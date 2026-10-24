// 📁 PATH: src/pages/Dashboard/UserHome.jsx  (MODIFIED existing file – replace the whole file)
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaPills, FaFilePrescription } from "react-icons/fa";
import { FiShoppingCart, FiCreditCard, FiClock, FiRotateCcw, FiShield, FiFileText } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const UserHome = () => {
    const { user } = useAuth();
    const [cart] = useCart(); // live cart items
    const axiosSecure = useAxiosSecure();

    // Same payments request your Payment History page uses
    const { data: payments = [] } = useQuery({
        queryKey: ["payments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/payments/${user.email}`)).data,
    });

    // ── Numbers for the cards (real data where available) ──
    const cartTotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
    const paymentsTotal = payments.reduce((sum, p) => sum + Number(p.price || 0), 0);
    const pendingCount = payments.filter((p) => String(p.status).toLowerCase().includes("pend")).length;
    const latestPayment = payments[payments.length - 1];
    const cartNames = cart.slice(0, 2).map((i) => i.name).join(" & ") + (cart.length > 2 ? ` +${cart.length - 2} more` : "");

    // Shared look for the white cards (adapts to dark mode through your theme colors)
    const card = "bg-base-100 border border-base-content/10 rounded-2xl";

    const stats = [
        { label: "CART MEDICINES", value: `${cart.length} ${cart.length === 1 ? "Item" : "Items"}`, note: <>Total cart value: <b className="text-base-content">${cartTotal.toFixed(2)}</b></>, icon: <FaPills />, tile: "bg-emerald-100 text-teal-600 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300" },
        { label: "TOTAL PAYMENTS", value: `$${paymentsTotal.toFixed(2)}`, note: `${payments.length} Recorded ${payments.length === 1 ? "Transaction" : "Transactions"}`, icon: <FiCreditCard />, tile: "bg-emerald-100 text-emerald-600 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300" },
        { label: "PENDING ORDERS", value: `${pendingCount} ${pendingCount === 1 ? "Order" : "Orders"}`, note: pendingCount > 0 ? <span className="flex items-center gap-1.5 text-amber-600 font-medium"><FiRotateCcw className="animate-spin [animation-duration:3s]" /> Processing Payment</span> : "Nothing pending", icon: <FiClock />, tile: "bg-amber-100 text-amber-600 [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300" },
        // Static for now (no prescription data in your backend yet)
        { label: "ACTIVE PRESCRIPTIONS", value: "2 Verified", note: "Ready for re-fill", icon: <FaFilePrescription />, tile: "bg-blue-100 text-blue-600 [[data-theme=dark]_&]:bg-blue-500/15 [[data-theme=dark]_&]:text-blue-300" },
    ];

    return (
        <div className="max-w-screen-xl mx-auto space-y-5 sm:space-y-6">
            {/* ── Welcome card ── */}
            <div className={`relative overflow-hidden ${card} p-5 sm:p-7 shadow-sm`}>
                <div className="pointer-events-none absolute -right-10 -top-10 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl" /> {/* soft green glow */}
                <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 [[data-theme=dark]_&]:bg-emerald-500/10 [[data-theme=dark]_&]:border-emerald-500/20 [[data-theme=dark]_&]:text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Session</span>
                        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">Hello User, Welcome Home</h2>
                        <p className="mt-2 text-sm sm:text-base text-base-content/70 max-w-xl">Manage your active medicine orders, view payment transaction history, and quickly navigate your healthcare workspace.</p>
                    </div>
                    {/* The two dynamic buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Link to="/dashboard/cart" className="btn btn-sm sm:btn-md border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg shadow-teal-600/30"><FiShoppingCart /> View Cart ({cart.length})</Link>
                        <Link to="/dashboard/paymentHistory" className="btn btn-sm sm:btn-md bg-base-200/70 hover:bg-base-200 border border-base-content/10 text-base-content gap-2"><FiFileText className="text-teal-600" /> Payment History</Link>
                    </div>
                </div>
            </div>

            {/* ── 4 stat cards ── */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                {stats.map((s) => (
                    <div key={s.label} className={`${card} p-5 shadow-sm`}>
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-[11px] font-bold tracking-wider text-base-content/50">{s.label}</p>
                            <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${s.tile}`}>{s.icon}</span>
                        </div>
                        <p className="mt-4 text-2xl sm:text-3xl font-extrabold">{s.value}</p>
                        <p className="mt-1 text-xs text-base-content/60">{s.note}</p>
                    </div>
                ))}
            </div>

            {/* ── Dashboard summary ── */}
            <div className={`${card} p-4 sm:p-5 shadow-sm`}>
                <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-base-content/60 uppercase"><FiRotateCcw className="text-teal-600" /> Dashboard Summary</h3>
                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 sm:gap-4 bg-base-200/50 border border-base-content/10 rounded-xl px-3 sm:px-4 py-3">
                        <span className="w-9 h-9 shrink-0 rounded-lg bg-emerald-100 text-teal-600 flex items-center justify-center [[data-theme=dark]_&]:bg-emerald-500/15"><FiShoppingCart /></span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{cart.length} {cart.length === 1 ? "Item" : "Items"} inside your shopping cart</p>
                            <p className="text-xs text-base-content/60 truncate">{cart.length ? cartNames : "Your cart is empty"}</p>
                        </div>
                        <Link to={cart.length ? "/dashboard/cart" : "/shop"} className="text-sm font-semibold text-teal-600 hover:underline shrink-0">{cart.length ? "Manage" : "Browse"}</Link>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 bg-base-200/50 border border-base-content/10 rounded-xl px-3 sm:px-4 py-3">
                        <span className="w-9 h-9 shrink-0 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center [[data-theme=dark]_&]:bg-amber-500/15"><FiShield /></span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold break-all">{latestPayment ? `Transaction #${latestPayment.transactionId}` : "No transactions yet"}</p>
                            <p className="text-xs text-base-content/60">{latestPayment ? `$${Number(latestPayment.price).toFixed(2)} • ${String(latestPayment.status).toLowerCase().includes("pend") ? "Pending Verification" : latestPayment.status}` : "Your payments will appear here"}</p>
                        </div>
                        <Link to="/dashboard/paymentHistory" className="text-sm font-semibold text-teal-600 hover:underline shrink-0">View</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHome;