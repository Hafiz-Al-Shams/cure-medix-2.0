// 📁 PATH: src/pages/CategoryDetails/DetailsCard.jsx  (replace the whole file)
import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    FaBottleDroplet,
    FaBox,
    FaCapsules,
    FaCartShopping,
    FaHouse,
    FaLungs,
    FaMinus,
    FaPlus,
    FaSyringe,
    FaTablets,
    FaXmark,
} from "react-icons/fa6";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useCart from "../../hooks/useCart";

/* ----------------------------------------------------------------
   Routes (taken from your router.jsx)
----------------------------------------------------------------- */
const HOME_ROUTE = "/";
const CATEGORY_ROUTE = "/categoryDetails"; // -> /categoryDetails/Tablet

const CATEGORIES = [
    { name: "Tablet", icon: FaTablets },
    { name: "Capsule", icon: FaCapsules },
    { name: "Injection", icon: FaSyringe },
    { name: "Inhaler", icon: FaLungs },
    { name: "Syrup", icon: FaBottleDroplet },
];

/* ----------------------------------------------------------------
   SweetAlert2 look (matches the design, adapts to light / dark)
   The "!" makes sure these win over SweetAlert's own CSS.
   Dark values apply when <html data-theme="dark">.
----------------------------------------------------------------- */
const swalClass = {
    popup:
        "!rounded-3xl !p-6 sm:!p-8 [[data-theme=dark]_&]:!bg-slate-900 [[data-theme=dark]_&]:!border [[data-theme=dark]_&]:!border-slate-700",
    title: "!text-xl !font-bold !text-slate-600 [[data-theme=dark]_&]:!text-slate-100",
    htmlContainer: "!text-base !text-slate-500 [[data-theme=dark]_&]:!text-slate-400",
    actions: "!gap-3 !mt-6",
    confirmButton:
        "!rounded-lg !bg-teal-600 !px-5 !py-2.5 !text-sm !font-bold !text-white !shadow-none hover:!bg-teal-700 focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-teal-500/60 [[data-theme=dark]_&]:hover:!bg-teal-500",
    cancelButton:
        "!rounded-lg !border !border-slate-200 !bg-white !px-5 !py-2.5 !text-sm !font-semibold !text-slate-700 !shadow-none hover:!bg-slate-50 focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-slate-400/50 [[data-theme=dark]_&]:!border-slate-600 [[data-theme=dark]_&]:!bg-slate-800 [[data-theme=dark]_&]:!text-slate-200 [[data-theme=dark]_&]:hover:!bg-slate-700",
};

/* ----------------------------------------------------------------
   Theme tokens
   Light = default classes. Dark = the `[[data-theme=dark]_&]:` variant,
   which fires when <html data-theme="dark"> (your navbar toggle).
   No Tailwind config change is needed for this variant.
----------------------------------------------------------------- */
const t = {
    page: "bg-slate-50 [[data-theme=dark]_&]:bg-slate-950",

    crumb: "text-slate-400 [[data-theme=dark]_&]:text-slate-500",
    crumbLink: "hover:text-emerald-600 [[data-theme=dark]_&]:hover:text-emerald-400",
    crumbNow: "text-slate-900 [[data-theme=dark]_&]:text-slate-100",

    headCard:
        "border-emerald-100/70 bg-white shadow-[0_8px_30px_-12px_rgba(16,185,129,0.15)] [[data-theme=dark]_&]:border-slate-800 [[data-theme=dark]_&]:bg-slate-900 [[data-theme=dark]_&]:shadow-none",
    headGlow:
        "bg-[radial-gradient(circle_at_92%_20%,rgba(16,185,129,0.14),transparent_45%)] [[data-theme=dark]_&]:bg-[radial-gradient(circle_at_92%_20%,rgba(16,185,129,0.16),transparent_50%)]",
    iconTile:
        "border-emerald-100 bg-emerald-50 text-emerald-600 [[data-theme=dark]_&]:border-emerald-500/20 [[data-theme=dark]_&]:bg-emerald-500/10 [[data-theme=dark]_&]:text-emerald-400",
    title: "text-slate-900 [[data-theme=dark]_&]:text-slate-50",
    accent: "text-emerald-600 [[data-theme=dark]_&]:text-emerald-400",
    countPill:
        "border-emerald-200 bg-emerald-50 text-emerald-700 [[data-theme=dark]_&]:border-emerald-500/30 [[data-theme=dark]_&]:bg-emerald-500/10 [[data-theme=dark]_&]:text-emerald-300",
    muted: "text-slate-500 [[data-theme=dark]_&]:text-slate-400",

    pill:
        "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:text-slate-200 [[data-theme=dark]_&]:hover:border-emerald-500/60 [[data-theme=dark]_&]:hover:text-emerald-300",
    pillActive:
        "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25 [[data-theme=dark]_&]:shadow-emerald-900/40",

    card:
        "border-gray-200 bg-white hover:shadow-xl hover:shadow-slate-200/70 [[data-theme=dark]_&]:border-slate-800 [[data-theme=dark]_&]:bg-slate-900 [[data-theme=dark]_&]:hover:border-slate-700 [[data-theme=dark]_&]:hover:shadow-black/40",
    imgBox: "bg-gray-100 [[data-theme=dark]_&]:bg-slate-800",
    typeLabel: "text-emerald-700 [[data-theme=dark]_&]:text-emerald-400",
    strong: "text-slate-900 [[data-theme=dark]_&]:text-slate-50",
    body: "text-slate-700 [[data-theme=dark]_&]:text-slate-300",
    faint: "text-gray-400 [[data-theme=dark]_&]:text-slate-500",

    btnOutline:
        "border-gray-200 bg-white text-slate-800 hover:bg-gray-50 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:bg-transparent [[data-theme=dark]_&]:text-slate-200 [[data-theme=dark]_&]:hover:bg-slate-800",
    btnPrimary: "bg-teal-600 text-white hover:bg-teal-700 [[data-theme=dark]_&]:hover:bg-teal-500",

    skeleton: "bg-gray-100 [[data-theme=dark]_&]:bg-slate-800",
    empty:
        "border-gray-300 bg-white [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:bg-slate-900",

    /* modal */
    overlay: "bg-slate-900/50 [[data-theme=dark]_&]:bg-black/70",
    modal:
        "bg-white [[data-theme=dark]_&]:border [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:bg-slate-900",
    close: "text-gray-400 hover:text-gray-700 [[data-theme=dark]_&]:text-slate-400 [[data-theme=dark]_&]:hover:text-slate-100",
    modalName: "text-slate-900 [[data-theme=dark]_&]:text-slate-50",
    typeChip:
        "bg-emerald-50 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-500/10 [[data-theme=dark]_&]:text-emerald-300",
    priceBox: "bg-gray-100/80 [[data-theme=dark]_&]:bg-slate-800",
    priceText: "text-teal-600 [[data-theme=dark]_&]:text-teal-400",
    discountText: "text-red-500 [[data-theme=dark]_&]:text-red-400",
    infoLabel: "text-gray-500 [[data-theme=dark]_&]:text-slate-400",
    infoValue: "text-gray-900 [[data-theme=dark]_&]:text-slate-100",
    guideTitle: "text-slate-800 [[data-theme=dark]_&]:text-slate-100",
    guideText: "text-slate-600 [[data-theme=dark]_&]:text-slate-400",
    divider: "border-gray-200 [[data-theme=dark]_&]:border-slate-700",
    stepper: "bg-gray-100 [[data-theme=dark]_&]:bg-slate-800",
    stepBtn:
        "text-slate-700 hover:bg-gray-200 [[data-theme=dark]_&]:text-slate-200 [[data-theme=dark]_&]:hover:bg-slate-700",
    stepInput:
        "bg-white text-slate-900 [[data-theme=dark]_&]:bg-slate-900 [[data-theme=dark]_&]:text-slate-50",
};

/* ----------------------------------------------------------------
   Small pieces
----------------------------------------------------------------- */
const SkeletonCard = () => (
    <div className={`animate-pulse rounded-3xl border p-4 ${t.card}`}>
        <div className={`h-48 rounded-2xl sm:h-[206px] ${t.skeleton}`} />
        <div className={`mt-5 h-3 w-24 rounded ${t.skeleton}`} />
        <div className={`mt-3 h-5 w-40 rounded ${t.skeleton}`} />
        <div className={`mt-3 h-3 w-full rounded ${t.skeleton}`} />
        <div className={`mt-2 h-3 w-2/3 rounded ${t.skeleton}`} />
        <div className="mt-5 flex gap-2">
            <div className={`h-9 flex-1 rounded-lg ${t.skeleton}`} />
            <div className={`h-9 flex-1 rounded-lg ${t.skeleton}`} />
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="min-w-0">
        <p className={`text-sm ${t.infoLabel}`}>{label}</p>
        <p className={`mt-0.5 break-words text-sm font-semibold ${t.infoValue}`}>{value}</p>
    </div>
);

/* ----------------------------------------------------------------
   Page
----------------------------------------------------------------- */
const DetailsCard = () => {
    const { categoryName } = useParams();

    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // medicine shown in the modal
    const [quantity, setQuantity] = useState(1);

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosSecure = useAxiosSecure();
    const [, refetch] = useCart();

    const activeCategory =
        CATEGORIES.find((c) => c.name.toLowerCase() === String(categoryName).toLowerCase()) || null;
    const HeaderIcon = activeCategory?.icon || FaTablets;
    const headerDesc = `Browse all high-grade ${String(categoryName).toLowerCase()} formulations with verified laboratory certifications and discounted pricing.`;

    /* ---------- data ---------- */
    useEffect(() => {
        setLoading(true);
        axios
            .get("https://cure-medix-server.vercel.app/medicines")
            .then((res) => {
                const filteredMedicines = res.data.filter(
                    (medicine) => medicine.category === categoryName
                );
                setMedicines(filteredMedicines);
            })
            .catch((error) => {
                console.error("Error happened while fetching data:", error);
            })
            .finally(() => setLoading(false));
    }, [categoryName]);

    /* ---------- modal helpers ---------- */
    const openDetails = (medicine) => {
        setQuantity(1);
        setSelected(medicine);
    };
    const closeDetails = () => setSelected(null);

    useEffect(() => {
        if (!selected) return;
        const onKey = (e) => e.key === "Escape" && setSelected(null);
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [selected]);

    const maxQty = selected ? Math.max(Number(selected.stock) || 1, 1) : 1;
    const changeQty = (value) => {
        const n = Number(value);
        if (Number.isNaN(n)) return;
        setQuantity(Math.min(Math.max(n, 1), maxQty));
    };

    /* ---------- cart ---------- */
    const handleAddToCart = (medicine, qty = 1) => {
        const { name, image, price, _id, type, description, seller, company } = medicine;
        if (user && user.email) {
            const cartItem = {
                medicineId: _id,
                email: user.email,
                name,
                image,
                price,
                type,
                description,
                seller,
                company,
                quantity: qty,
            };
            axiosSecure.post("/carts", cartItem).then((res) => {
                if (res.data.insertedId) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `${name} added to your cart`,
                        showConfirmButton: false,
                        timer: 1000,
                        buttonsStyling: false,
                        customClass: { popup: swalClass.popup, title: swalClass.title },
                    });
                    refetch();
                    closeDetails();
                }
            });
        } else {
            closeDetails();
            Swal.fire({
                title: "You are not Logged In",
                text: "Please login to add to the cart?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, login!",
                cancelButtonText: "Cancel",
                reverseButtons: true, // Cancel on the left, "Yes, login!" on the right
                buttonsStyling: false, // lets our own button classes take over
                customClass: swalClass,
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/signIn", { state: { from: location } });
                }
            });
        }
    };

    /* ---------- render ---------- */
    return (
        <>
            <Helmet>
                <title>CureMedix | Category - {categoryName}</title>
            </Helmet>

            <div className={`min-h-screen ${t.page}`}>
                <div className="mx-auto max-w-screen-xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
                    {/* ================= Breadcrumb: Home / Syrup ================= */}
                    <nav
                        aria-label="Breadcrumb"
                        className={`mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${t.crumb}`}
                    >
                        <Link to={HOME_ROUTE} className={`flex items-center gap-1.5 font-medium ${t.crumbLink}`}>
                            <FaHouse className="text-[13px]" />
                            Home
                        </Link>
                        <span>/</span>
                        <span className={`font-semibold ${t.crumbNow}`}>{categoryName}</span>
                    </nav>

                    {/* ================= Heading card ================= */}
                    <header
                        className={`relative overflow-hidden rounded-3xl border px-5 py-6 sm:rounded-[28px] sm:px-8 sm:py-7 ${t.headCard}`}
                    >
                        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${t.headGlow}`} />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-3.5 sm:gap-4">
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl sm:h-16 sm:w-16 sm:text-3xl ${t.iconTile}`}
                                >
                                    <HeaderIcon />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                        <h1
                                            className={`text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl ${t.title}`}
                                        >
                                            Medicines for <span className={t.accent}>{categoryName}</span>
                                        </h1>
                                        <span
                                            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${t.countPill}`}
                                        >
                                            {medicines.length} Products
                                        </span>
                                    </div>
                                    <p className={`mt-1.5 max-w-2xl text-sm ${t.muted}`}>{headerDesc}</p>
                                </div>
                            </div>

                            {/* Category pills */}
                            <div className="flex flex-wrap gap-2 sm:gap-2.5">
                                {CATEGORIES.map(({ name, icon: Icon }) => {
                                    const isActive = name.toLowerCase() === String(categoryName).toLowerCase();
                                    return (
                                        <Link
                                            key={name}
                                            to={`${CATEGORY_ROUTE}/${name}`}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors sm:px-4 ${
                                                isActive ? t.pillActive : t.pill
                                            }`}
                                        >
                                            <Icon className="text-[13px]" />
                                            {name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </header>

                    {/* ================= Cards ================= */}
                    <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                        {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

                        {!loading &&
                            medicines.map((medicine, index) => {
                                const discount = Number(medicine.discountPercentage) || 0;
                                return (
                                    <article
                                        key={medicine._id || index}
                                        className={`flex min-w-0 flex-col rounded-3xl border p-4 transition-shadow duration-200 ${t.card}`}
                                    >
                                        {/* image */}
                                        <div
                                            className={`relative flex h-48 items-center justify-center overflow-hidden rounded-2xl sm:h-[206px] ${t.imgBox}`}
                                        >
                                            {discount > 0 && (
                                                <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                                                    {discount}% Discount Price
                                                </span>
                                            )}
                                            {medicine.image && (
                                                <img
                                                    src={medicine.image}
                                                    alt={medicine.name}
                                                    loading="lazy"
                                                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                                                    className="h-full w-full object-contain"
                                                />
                                            )}
                                        </div>

                                        {/* info */}
                                        <div className="mt-5 flex flex-1 flex-col">
                                            <p className={`text-[11px] font-bold uppercase tracking-wide ${t.typeLabel}`}>
                                                {medicine.type}
                                            </p>
                                            <h2 className={`mt-1 break-words text-lg font-bold leading-snug ${t.strong}`}>
                                                {medicine.name}
                                            </h2>

                                            <div className={`mt-1.5 space-y-0.5 text-[13px] ${t.body}`}>
                                                <p>
                                                    <span className="font-semibold">Per unit:</span>{" "}
                                                    <span className={`font-bold ${t.strong}`}>{medicine.price}$</span>{" "}
                                                    <span className={t.faint}>({discount}% discount price)</span>
                                                </p>
                                                <p>Stock: {medicine.stock} boxes available today</p>
                                                <p className={t.faint}>Type: {medicine.type}</p>
                                            </div>

                                            <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetails(medicine)}
                                                    className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${t.btnOutline}`}
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(medicine)}
                                                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-colors ${t.btnPrimary}`}
                                                >
                                                    <FaPlus className="text-[11px]" />
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                    </section>

                    {/* empty state */}
                    {!loading && medicines.length === 0 && (
                        <div className={`mt-8 rounded-3xl border border-dashed px-4 py-16 text-center sm:py-20 ${t.empty}`}>
                            <p className={`text-lg font-bold ${t.strong}`}>No medicines found</p>
                            <p className={`mt-1 text-sm ${t.muted}`}>
                                There are no products in the {categoryName} category yet. Try another category above.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= Details modal ================= */}
            {selected &&
                (() => {
                    const discount = Number(selected.discountPercentage) || 0;
                    return (
                        <div
                            className={`fixed inset-0 z-[100] flex items-end justify-center p-0 backdrop-blur-[2px] sm:items-center sm:p-4 ${t.overlay}`}
                            onClick={closeDetails}
                        >
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-label={`${selected.name} details`}
                                onClick={(e) => e.stopPropagation()}
                                className={`relative max-h-[92vh] max-h-[92dvh] w-full max-w-[510px] overflow-y-auto rounded-t-[28px] p-5 shadow-2xl sm:rounded-[32px] sm:p-7 ${t.modal}`}
                            >
                                <button
                                    type="button"
                                    onClick={closeDetails}
                                    aria-label="Close"
                                    className={`absolute right-5 top-5 transition-colors sm:right-6 sm:top-6 ${t.close}`}
                                >
                                    <FaXmark className="text-xl" />
                                </button>

                                {/* header */}
                                <div className="flex items-center gap-3.5 pr-8 sm:gap-4">
                                    <div
                                        className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-20 sm:w-20 ${t.imgBox}`}
                                    >
                                        {selected.image && (
                                            <img
                                                src={selected.image}
                                                alt={selected.name}
                                                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                                                className="h-full w-full object-contain"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <span
                                            className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${t.typeChip}`}
                                        >
                                            {selected.type}
                                        </span>
                                        <h3
                                            className={`mt-1 break-words text-xl font-extrabold leading-tight sm:text-2xl ${t.modalName}`}
                                        >
                                            {selected.name}
                                        </h3>
                                        <p className={`mt-0.5 flex items-center gap-1.5 text-sm ${t.infoLabel}`}>
                                            <FaBox className={`text-xs ${t.priceText}`} />
                                            {selected.stock} boxes available today
                                        </p>
                                    </div>
                                </div>

                                {/* pricing */}
                                <div className={`mt-5 rounded-2xl p-4 sm:p-5 ${t.priceBox}`}>
                                    <p className={`text-[15px] font-semibold ${t.guideTitle}`}>Pricing Breakdown:</p>
                                    <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                                        <span className={`text-3xl font-extrabold ${t.priceText}`}>{selected.price}$</span>
                                        <span className={`text-sm font-medium ${t.discountText}`}>
                                            ({discount}% discount price)
                                        </span>
                                    </p>
                                </div>

                                {/* info grid */}
                                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6">
                                    <InfoItem label="Category" value={selected.category || "N/A"} />
                                    <InfoItem label="Type" value={selected.type || "N/A"} />
                                    <InfoItem label="Unit" value={selected.unit || "N/A"} />
                                    <InfoItem label="Company" value={selected.company || "N/A"} />
                                    <InfoItem label="Seller" value={selected.seller || "N/A"} />
                                    <InfoItem label="Stock" value={`${selected.stock} boxes`} />
                                </div>

                                {/* guidelines */}
                                <div className="mt-5">
                                    <p className={`text-[15px] font-bold ${t.guideTitle}`}>
                                        Pharmacist Safety Guidelines:
                                    </p>
                                    <p className={`mt-1.5 text-sm leading-relaxed ${t.guideText}`}>
                                        {selected.description}
                                    </p>
                                    <p className={`mt-1.5 text-sm leading-relaxed ${t.guideText}`}>
                                        Take strictly as prescribed by your physician. Store in a cool dry place away
                                        from direct sunlight.
                                    </p>
                                </div>

                                <hr className={`my-5 ${t.divider}`} />

                                {/* actions */}
                                <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-stretch">
                                    <div
                                        className={`flex h-12 shrink-0 items-center justify-between overflow-hidden rounded-xl min-[420px]:justify-start ${t.stepper}`}
                                    >
                                        <button
                                            type="button"
                                            aria-label="Decrease quantity"
                                            onClick={() => changeQty(quantity - 1)}
                                            disabled={quantity <= 1}
                                            className={`flex h-full w-11 items-center justify-center transition-colors disabled:opacity-40 min-[420px]:w-10 ${t.stepBtn}`}
                                        >
                                            <FaMinus className="text-xs" />
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={maxQty}
                                            value={quantity}
                                            onChange={(e) => changeQty(e.target.value)}
                                            aria-label="Quantity"
                                            className={`h-full w-14 text-center text-sm font-bold outline-none [appearance:textfield] min-[420px]:w-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${t.stepInput}`}
                                        />
                                        <button
                                            type="button"
                                            aria-label="Increase quantity"
                                            onClick={() => changeQty(quantity + 1)}
                                            disabled={quantity >= maxQty}
                                            className={`flex h-full w-11 items-center justify-center transition-colors disabled:opacity-40 min-[420px]:w-10 ${t.stepBtn}`}
                                        >
                                            <FaPlus className="text-xs" />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(selected, quantity)}
                                        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-[15px] font-bold shadow-lg shadow-teal-600/20 transition-colors ${t.btnPrimary}`}
                                    >
                                        <FaCartShopping className="text-sm" />
                                        Select &amp; Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
        </>
    );
};

export default DetailsCard;