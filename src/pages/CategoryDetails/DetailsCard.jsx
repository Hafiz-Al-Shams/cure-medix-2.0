// 📁 PATH: src/pages/CategoryDetails/DetailsCard.jsx  (MODIFIED existing file – replace the whole file)
import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    FaBottleDroplet,
    FaCapsules,
    FaHouse,
    FaLungs,
    FaSyringe,
    FaTablets,
} from "react-icons/fa6";
import { FiPlus, FiMinus, FiX, FiShoppingCart, FiPackage } from "react-icons/fi"; // same icons the Shop page cards/popup use
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
   Theme tokens for the PAGE parts (header, breadcrumb, pills, empty state)
   Light = default classes. Dark = the `[[data-theme=dark]_&]:` variant,
   which fires when <html data-theme="dark"> (your navbar toggle).
   NOTE: the medicine cards + details popup no longer use these tokens –
   they now use the exact same classes as the Shop page.
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

    strong: "text-slate-900 [[data-theme=dark]_&]:text-slate-50",
    skeleton: "bg-gray-100 [[data-theme=dark]_&]:bg-slate-800",
    empty:
        "border-gray-300 bg-white [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:bg-slate-900",
};

/* ----------------------------------------------------------------
   Loading placeholder – same shape as the new (Shop-style) card
----------------------------------------------------------------- */
const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
        <div className={`h-52 rounded-xl ${t.skeleton}`} />
        <div className={`mt-4 h-3 w-24 rounded ${t.skeleton}`} />
        <div className={`mt-3 h-5 w-40 rounded ${t.skeleton}`} />
        <div className={`mt-3 h-3 w-full rounded ${t.skeleton}`} />
        <div className={`mt-2 h-3 w-2/3 rounded ${t.skeleton}`} />
        <div className="mt-5 grid grid-cols-2 gap-2">
            <div className={`h-8 rounded-lg ${t.skeleton}`} />
            <div className={`h-8 rounded-lg ${t.skeleton}`} />
        </div>
    </div>
);

/* ----------------------------------------------------------------
   Small display helpers (copied from the Shop page)
----------------------------------------------------------------- */
const money = (n) => `${Number(n).toFixed(1)}$`; // 3 -> "3.0$"
const hideBrokenImg = (e) => { e.currentTarget.style.display = "none"; }; // hides the broken image icon

/* ----------------------------------------------------------------
   Page
----------------------------------------------------------------- */
const DetailsCard = () => {
    const { categoryName } = useParams();

    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // medicine shown in the details popup
    const [qty, setQty] = useState(1); // quantity inside the popup (same as Shop)

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosSecure = useAxiosSecure();
    const [, refetch] = useCart();

    const activeCategory =
        CATEGORIES.find((c) => c.name.toLowerCase() === String(categoryName).toLowerCase()) || null;
    const HeaderIcon = activeCategory?.icon || FaTablets;
    const headerDesc = `Browse all high-grade ${String(categoryName).toLowerCase()} formulations with verified laboratory certifications and discounted pricing.`;

    /* ---------- data (unchanged) ---------- */
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

    /* ---------- popup helpers ---------- */
    const openDetails = (medicine) => {
        setQty(1); // always start from 1
        setSelected(medicine);
    };
    const closeDetails = () => setSelected(null);

    // Esc closes the popup + page stops scrolling behind it (kept from your original)
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

    /* ---------- cart (logic unchanged) ---------- */
    const handleAddToCart = (medicine, quantity = 1) => {
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
                quantity,
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

                    {/* ================= Heading card (unchanged) ================= */}
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
                                            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors sm:px-4 ${isActive ? t.pillActive : t.pill
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

                    {/* ================= Cards – EXACT same card + grid as the Shop page ================= */}
                    <section className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

                        {!loading &&
                            medicines.map((med, i) => (
                                <div key={med._id || i} className="bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                                    <div className="relative h-52 rounded-xl bg-base-200 flex items-center justify-center overflow-hidden">
                                        {/* red discount badge only when the medicine is discounted (same rule as Shop) */}
                                        {med.discount && <span className="absolute left-3 top-3 z-[1] text-[9px] font-bold bg-red-600 text-white rounded-full px-2 py-0.5 uppercase">{med.discountPercentage} discount price</span>}
                                        <img src={med.image} alt={med.name} onError={hideBrokenImg} className="max-h-full max-w-full object-contain p-3" />
                                    </div>
                                    <p className="mt-4 text-[10px] font-bold tracking-wider text-teal-600 uppercase">{med.type}</p>
                                    <h2 className="font-bold text-base-content">{med.name}</h2>
                                    <p className="text-xs text-base-content/80 mt-1"><span className="font-semibold">Per unit: {money(med.price)}</span> <span className="text-base-content/50">({med.discountPercentage ?? "0%"} discount price)</span></p>
                                    <p className="text-xs text-base-content/80">Stock: {med.stock} boxes available today</p>
                                    <p className="text-xs text-base-content/50">Type: {med.type}</p>
                                    <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                                        <button onClick={() => openDetails(med)} className="btn btn-sm btn-outline border-base-content/15 font-medium">Details</button>
                                        <button onClick={() => handleAddToCart(med, 1)} className="btn btn-sm border-0 bg-teal-600 hover:bg-teal-700 text-white gap-1"><FiPlus /> Select</button>
                                    </div>
                                </div>
                            ))}
                    </section>

                    {/* empty state (unchanged) */}
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

            {/* ================= Details popup – EXACT same design as the Shop page popup ================= */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={closeDetails}> {/* click backdrop to close */}
                    <div className="relative bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeDetails} aria-label="Close" className="absolute right-5 top-5 text-base-content/50 hover:text-base-content text-xl"><FiX /></button>

                        {/* Top: thumbnail + type pill + name + stock */}
                        <div className="flex items-center gap-4 pr-8">
                            <div className="w-20 h-20 shrink-0 rounded-2xl bg-base-200 flex items-center justify-center overflow-hidden">
                                <img src={selected.image} alt={selected.name} onError={hideBrokenImg} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold tracking-wider bg-teal-50 text-teal-700 rounded-full px-2.5 py-0.5 uppercase">{selected.type}</span>
                                <h3 className="text-2xl font-bold text-base-content leading-tight">{selected.name}</h3>
                                <p className="text-xs text-base-content/60 flex items-center gap-1.5"><FiPackage className="text-teal-600" /> {selected.stock} boxes available today</p>
                            </div>
                        </div>

                        {/* Pricing breakdown */}
                        <div className="mt-5 bg-base-200/70 rounded-2xl p-4">
                            <p className="text-sm font-semibold text-base-content">Pricing Breakdown:</p>
                            <p className="mt-1"><span className="text-2xl font-bold text-teal-600">{money(selected.price)}</span> <span className="text-xs font-medium text-red-500">({selected.discountPercentage ?? "0%"} discount price)</span></p>
                            {qty > 1 && <p className="text-xs text-base-content/60 mt-1">Total for {qty}: <b>{money(selected.price * qty)}</b></p>}
                        </div>

                        {/* All important info */}
                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                            {[
                                ["Category", selected.category],
                                ["Type", selected.type],
                                ["Unit", selected.unit],
                                ["Company", selected.company],
                                ["Seller", selected.seller],
                                ["Stock", `${selected.stock} boxes`],
                            ].map(([label, value]) => (
                                <div key={label} className="min-w-0">
                                    <p className="text-base-content/50">{label}</p>
                                    <p className="font-semibold text-base-content truncate">{value || "NA"}</p>
                                </div>
                            ))}
                        </div>

                        {/* Description + safety text */}
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-base-content">Pharmacist Safety Guidelines:</p>
                            <p className="text-xs text-base-content/70 mt-1">{selected.description}</p>
                            <p className="text-xs text-base-content/70 mt-1">Take strictly as prescribed by your physician. Store in a cool dry place away from direct sunlight.</p>
                        </div>

                        {/* Quantity + add to cart */}
                        <div className="mt-5 pt-4 border-t border-base-content/10 flex items-center gap-3">
                            <div className="flex items-center border border-base-content/15 rounded-xl overflow-hidden">
                                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-10 flex items-center justify-center bg-base-200 hover:bg-base-300"><FiMinus /></button>
                                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                                <button onClick={() => setQty((q) => Math.min(Number(selected.stock) || 1, q + 1))} className="w-9 h-10 flex items-center justify-center bg-base-200 hover:bg-base-300"><FiPlus /></button> {/* capped at stock */}
                            </div>
                            <button onClick={() => handleAddToCart(selected, qty)} className="btn flex-1 border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 rounded-xl"><FiShoppingCart /> Select &amp; Add to Cart</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DetailsCard;