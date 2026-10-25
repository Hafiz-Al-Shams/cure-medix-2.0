import { useEffect, useRef, useState } from "react";
import { FiSearch, FiPlus, FiMinus, FiX, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiShoppingCart, FiPackage } from "react-icons/fi";
import { FaSortAlphaDown } from "react-icons/fa";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useCart from "../../hooks/useCart";
import { Helmet } from "react-helmet-async";
import useMedicines from "../../hooks/useMedicines";

const Shop = () => {
    // 🔥 Fetch medicines once (unchanged)
    const { medicines, isLoading, error } = useMedicines();

    // 🔥 Auth + cart hooks (unchanged)
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosSecure = useAxiosSecure();
    const [, refetch] = useCart();
    const [searchParams] = useSearchParams(); // reads ?search= sent from the navbar/hero search
    const initialSearch = searchParams.get("search") || "";

    // 🔥 Local UI state
    const [resultMedicines, setResultMedicines] = useState([]);
    const [searchValue, setSearchValue] = useState(initialSearch);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortOrder, setSortOrder] = useState("");
    const [viewMode, setViewMode] = useState("card"); // "card" | "list"  (list replaces the old table)
    const [activeType, setActiveType] = useState("All"); // NEW: selected filter chip
    const [selected, setSelected] = useState(null); // NEW: medicine shown in the details popup
    const [qty, setQty] = useState(1); // NEW: quantity inside the popup
    const seeded = useRef(false); // makes sure we seed the list only once

    // 🔥 Seed list when data arrives (skipped if a ?search= is being applied)
    useEffect(() => {
        if (!seeded.current && !initialSearch && medicines.length > 0) {
            seeded.current = true;
            setResultMedicines(medicines);
            setCurrentPage(1);
        }
    }, [medicines, initialSearch]);

    // 🔥 Apply ?search= coming from other pages
    useEffect(() => {
        if (initialSearch) {
            seeded.current = true;
            handleSearch(initialSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSearch]);

    // ───────────── Handlers (logic unchanged unless commented) ─────────────
    const handlePageChange = (pageNumber, totalPages) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Opens the new popup (replaces the old Swal details popup)
    const handleViewDetails = (med) => {
        setQty(1);
        setSelected(med);
    };

    // Add to cart – same API call as before, plus the chosen quantity
    const handleAddToCart = (med, quantity = 1) => {
        if (user?.email) {
            const { name, image, price, _id, type, description, seller, company } = med;
            axiosSecure
                .post("/carts", { medicineId: _id, email: user.email, name, image, price, type, description, seller, company, quantity }) // quantity is NEW
                .then((res) => {
                    if (res.data.insertedId) {
                        setSelected(null); // close popup after success
                        Swal.fire({ position: "center", icon: "success", title: `${name} added to your cart`, showConfirmButton: false, timer: 1000 });
                        refetch(); // refresh navbar cart count
                    }
                });
        } else {
            setSelected(null);

            Swal.fire({
                title: "You are not Logged In",
                text: "Please login to add to the cart?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, login!",
                buttonsStyling: false, // turns off Swal's default blue/grey buttons
                reverseButtons: true, // Cancel on the left, main action on the right
                customClass: {
                    popup: "rounded-2xl",
                    title: "text-xl font-bold",
                    actions: "gap-3",
                    confirmButton: "px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors",
                    cancelButton: "px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium transition-colors",
                },
            }).then((result) => {
                if (result.isConfirmed) navigate("/signIn", { state: { from: location } });
            });

        }
    };

    // Server-side search (unchanged)
    const handleSearch = async (query) => {
        try {
            const res = await fetch(`https://cure-medix-server.vercel.app/searchMedicines?search=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResultMedicines(data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
        }
    };
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (debounceTimer) clearTimeout(debounceTimer); // 300ms debounce
        setDebounceTimer(setTimeout(() => handleSearch(value), 300));
    };
    const handleSortByName = () => setResultMedicines((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
    const handleSortByPrice = (order) => {
        setResultMedicines((prev) => [...prev].sort((a, b) => (order === "asc" ? a.price - b.price : b.price - a.price)));
        setSortOrder(order);
    };
    const handleTypeFilter = (type) => {
        setActiveType(type);
        setCurrentPage(1); // go back to page 1 when filter changes
    };

    // 🔥 Loading / Error UI (unchanged)
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <span className="loading loading-bars loading-xl"></span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="alert alert-error my-10 mx-auto max-w-lg">
                <span>Error loading medicines: {error.message}</span>
            </div>
        );
    }

    // 🔥 Dynamic filter chips = unique "type" values from your real data
    const types = ["All", ...new Set(medicines.map((m) => m.type).filter(Boolean))];

    // 🔥 Filter -> paginate
    const filtered = activeType === "All" ? resultMedicines : resultMedicines.filter((m) => m.type === activeType);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMedicines = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    // Small helpers for display
    const money = (n) => `${Number(n).toFixed(1)}$`; // 3 -> "3.0$"
    const hideBrokenImg = (e) => { e.currentTarget.style.display = "none"; }; // hides broken image icon

    // ───────────── Render ─────────────
    return (
        <div className="bg-base-100 pb-16">
            <Helmet>
                <title>CureMedix | Shop</title>
            </Helmet>

            {/* ── Dark header with live total count ── */}
            <section className="bg-gradient-to-r from-[#052e2b] via-[#04201f] to-[#050816] text-white">
                <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 border border-white/10 rounded-full px-3 py-1"><FiPackage className="text-emerald-400" /> Verified Medical Supplies</span>
                        <h1 className="text-3xl lg:text-4xl font-bold mt-3">Shop Your Necessary Medicines Here</h1>
                        <p className="text-sm text-white/70 mt-2 max-w-md">Browse through our complete catalog of certified prescription drugs and daily healthcare essentials.</p>
                    </div>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-fit">
                        <div className="text-center pr-6 border-r border-white/15">
                            <p className="text-2xl font-bold text-emerald-400">{medicines.length}</p> {/* ✅ real total, not hardcoded */}
                            <p className="text-[10px] tracking-wider text-white/70">MEDICINES</p>
                        </div>
                        <div className="text-center pl-6">
                            <p className="text-2xl font-bold">100%</p>
                            <p className="text-[10px] tracking-wider text-white/70">GENUINE</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-screen-xl mx-auto px-4">
                {/* ── Controls card: sort, view toggle, search, filter chips ── */}
                <div className="mt-6 bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <button onClick={handleSortByName} className="btn btn-sm bg-base-100 border-base-content/15 gap-2 font-medium"><FaSortAlphaDown className="text-teal-600" /> Sort by Name (A-Z)</button>
                            <div className="relative">
                                <select value={sortOrder} onChange={(e) => handleSortByPrice(e.target.value)} className="select select-sm select-bordered border-base-content/15 font-medium pr-8">
                                    <option value="">Sort by Price</option>
                                    <option value="asc">Low to High</option>
                                    <option value="desc">High to Low</option>
                                </select>
                            </div>
                            {/* Card / List toggle */}
                            <div className="flex bg-base-200 rounded-lg p-1 text-xs font-semibold">
                                <button onClick={() => setViewMode("card")} className={`px-3 py-1 rounded-md flex items-center gap-1.5 ${viewMode === "card" ? "bg-teal-600 text-white" : "text-base-content/70"}`}><FiGrid /> Card View</button>
                                <button onClick={() => setViewMode("list")} className={`px-3 py-1 rounded-md flex items-center gap-1.5 ${viewMode === "list" ? "bg-teal-600 text-white" : "text-base-content/70"}`}><FiList /> List View</button>
                            </div>
                        </div>
                        {/* Search (server-side, debounced) */}
                        <label className="flex items-center gap-2 border border-base-content/15 rounded-lg px-3 py-1.5 w-full sm:w-72">
                            <FiSearch className="text-base-content/50" />
                            <input type="text" name="search" value={searchValue} onChange={handleInputChange} placeholder="Search Medicines by Name or Type..." className="grow bg-transparent outline-none text-xs" />
                        </label>
                    </div>

                    {/* Dynamic type filter chips */}
                    <div className="mt-4 pt-3 border-t border-base-content/10 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold tracking-wider text-base-content/50 mr-1">FILTER TYPE:</span>
                        {types.map((t) => (
                            <button key={t} onClick={() => handleTypeFilter(t)} className={`text-xs px-3 py-1 rounded-full font-medium ${activeType === t ? "bg-teal-600 text-white" : "bg-base-200 text-base-content/80 hover:bg-base-300"}`}>{t}</button>
                        ))}
                    </div>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && <p className="text-center text-base-content/60 py-16">No medicines found. Try a different search or filter.</p>}

                {/* ── Card View ── */}
                {viewMode === "card" && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {currentMedicines.map((med, i) => (
                            <div key={med._id || i} className="bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                                <div className="relative h-52 rounded-xl bg-base-200 flex items-center justify-center overflow-hidden">
                                    {med.discount && <span className="absolute left-3 top-3 z-[1] text-[9px] font-bold bg-red-600 text-white rounded-full px-2 py-0.5 uppercase">{med.discountPercentage} discount price</span>}
                                    <img src={med.image} alt={med.name} onError={hideBrokenImg} className="max-h-full max-w-full object-contain p-3" />
                                </div>
                                <p className="mt-4 text-[10px] font-bold tracking-wider text-teal-600 uppercase">{med.type}</p>
                                <h2 className="font-bold text-base-content">{med.name}</h2>
                                <p className="text-xs text-base-content/80 mt-1"><span className="font-semibold">Per unit: {money(med.price)}</span> <span className="text-base-content/50">({med.discountPercentage ?? "0%"} discount price)</span></p>
                                <p className="text-xs text-base-content/80">Stock: {med.stock} boxes available today</p>
                                <p className="text-xs text-base-content/50">Type: {med.type}</p>
                                <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                                    <button onClick={() => handleViewDetails(med)} className="btn btn-sm btn-outline border-base-content/15 font-medium">Details</button>
                                    <button onClick={() => handleAddToCart(med, 1)} className="btn btn-sm border-0 bg-teal-600 hover:bg-teal-700 text-white gap-1"><FiPlus /> Select</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── List View ── */}
                {viewMode === "list" && (
                    <div className="mt-6 space-y-3">
                        {currentMedicines.map((med, i) => (
                            <div key={med._id || i} className="bg-base-100 border border-base-content/10 rounded-2xl p-3 shadow-sm flex items-center gap-4">
                                <div className="w-14 h-14 shrink-0 rounded-xl bg-base-200 flex items-center justify-center overflow-hidden">
                                    <img src={med.image} alt={med.name} onError={hideBrokenImg} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold tracking-wider text-teal-600 uppercase">{med.type}</p>
                                    <h2 className="font-bold text-base-content truncate">{med.name}</h2>
                                    <p className="text-xs text-base-content/60">Stock: {med.stock} boxes available • Type: {med.type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-base-content">{money(med.price)}</p>
                                    <p className="text-[10px] text-base-content/50">({med.discountPercentage ?? "0%"} discount price)</p>
                                </div>
                                <button onClick={() => handleViewDetails(med)} className="btn btn-sm btn-outline border-base-content/15 font-medium hidden sm:inline-flex">Details</button>
                                <button onClick={() => handleAddToCart(med, 1)} className="btn btn-sm border-0 bg-teal-600 hover:bg-teal-700 text-white gap-1"><FiPlus /> Select</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Pagination bar ── */}
                <div className="mt-6 bg-base-100 border border-base-content/10 rounded-2xl px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-base-content/70">
                        Show per page:
                        <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="select select-xs select-bordered border-base-content/15">
                            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} per page</option>)}
                        </select>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="btn btn-xs btn-outline border-base-content/15 gap-1" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1, totalPages)}><FiChevronLeft /> Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => handlePageChange(i + 1, totalPages)} className={`w-7 h-7 rounded-full text-xs font-semibold ${currentPage === i + 1 ? "bg-teal-600 text-white" : "bg-base-200 text-base-content/70"}`}>{i + 1}</button>
                        ))}
                        <button className="btn btn-xs btn-outline border-base-content/15 gap-1" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1, totalPages)}>Next <FiChevronRight /></button>
                    </div>
                </div>
            </div>

            {/* ── Details popup (NEW design) ── */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}> {/* click backdrop to close */}
                    <div className="relative bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-5 top-5 text-base-content/50 hover:text-base-content text-xl"><FiX /></button>

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
        </div>
    );
};

export default Shop;