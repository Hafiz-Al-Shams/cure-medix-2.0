// 📁 PATH: src/layouts/Dashboard.jsx  (MODIFIED existing file – replace the whole file)
import { useEffect, useState } from "react";
import { FaHome, FaList, FaShoppingCart, FaUsers, FaFileInvoice, FaCapsules } from "react-icons/fa";
import { MdPayments, MdOutlineDarkMode, MdLightMode } from "react-icons/md";
import { FiArrowLeft, FiMenu, FiX } from "react-icons/fi";
import { NavLink, Link, Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useCart from "../hooks/useCart";
import useAdmin from "../hooks/useAdmin";
import useSeller from "../hooks/useSeller";
import logo from "../assets/logo.png"; // your original logo

const Dashboard = () => {
    const [cart] = useCart(); // cart.length drives the sidebar badge
    const [isAdmin] = useAdmin(); // role flags from your database (unchanged)
    const [isSeller] = useSeller();
    const [open, setOpen] = useState(false); // mobile sidebar drawer

    // ─── Theme: the dashboard has no NavBar, so it applies the saved theme itself + has its own toggle ───
    const [theme, setTheme] = useState("light");
    useEffect(() => {
        const saved = localStorage.getItem("theme") || "light";
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
    }, []);
    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
    };

    // Portal name under the logo
    const portal = isAdmin ? "ADMIN PORTAL" : isSeller ? "SELLER PORTAL" : "USER PORTAL";

    // One sidebar link: active = green gradient pill, optional count badge. Closes the drawer after a tap on mobile.
    const NavItem = ({ to, icon, label, badge }) => (
        <li>
            <NavLink
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
                }
            >
                {({ isActive }) => (
                    <>
                        <span className={`text-lg ${isActive ? "text-white" : "text-teal-300"}`}>{icon}</span> {/* white icon on the green active pill */}
                        <span className="flex-1">{label}</span>
                        {badge !== undefined && <span className="min-w-6 h-6 px-1.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[11px] font-bold flex items-center justify-center">{badge}</span>}
                    </>
                )}
            </NavLink>
        </li>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 text-base-content [[data-theme=dark]_&]:bg-slate-950">
            <Helmet>
                <title>CureMedix | Dashboard</title>
            </Helmet>

            {/* Dark backdrop behind the mobile drawer */}
            {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

            {/* ═════════ SIDEBAR ═════════ (slides in on phones/tablets, fixed on large screens) */}
            <aside className={`fixed lg:sticky top-0 self-start z-40 h-screen w-72 max-w-[85vw] shrink-0 flex flex-col bg-[#0f172a] text-white transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                {/* Logo + portal name + theme toggle */}
                <div className="flex items-center justify-between gap-3 px-6 py-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-3 min-w-0">
                        <span className="w-10 h-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center"><img src={logo} alt="logo" className="w-6 h-6 object-contain" /></span>
                        <div className="leading-tight min-w-0">
                            <p className="text-xl font-bold">Cure<span className="text-emerald-400">Medix</span></p>
                            <p className="text-[10px] font-semibold tracking-widest text-slate-400">{portal}</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-1">
                        <button onClick={toggleTheme} aria-label="Toggle theme" className="w-8 h-8 rounded-full text-slate-300 hover:bg-white/10 flex items-center justify-center">{theme === "light" ? <MdOutlineDarkMode className="text-lg" /> : <MdLightMode className="text-lg" />}</button>
                        <button onClick={() => setOpen(false)} aria-label="Close menu" className="lg:hidden w-8 h-8 rounded-full text-slate-300 hover:bg-white/10 flex items-center justify-center"><FiX /></button>
                    </div>
                </div>

                {/* Navigation (role-based, same rules as before) */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-slate-500">NAVIGATION MENU</p>
                    <ul className="space-y-2">
                        {isAdmin && (
                            <>
                                <NavItem to="/dashboard/adminHome" icon={<FaHome />} label="Admin Home" />
                                <NavItem to="/dashboard/users" icon={<FaUsers />} label="All Users" />
                                <NavItem to="/dashboard/allCategories" icon={<FaList />} label="All Categories" />
                                <NavItem to="/dashboard/manage-payments" icon={<MdPayments />} label="Manage Payments" />
                            </>
                        )}
                        {isSeller && (
                            <>
                                <NavItem to="/dashboard/sellerHome" icon={<FaHome />} label="Seller Home" />
                                <NavItem to="/dashboard/manage-medicines" icon={<FaCapsules />} label="Manage Medicines" />
                            </>
                        )}
                        {!isAdmin && !isSeller && (
                            <>
                                <NavItem to="/dashboard/userHome" icon={<FaHome />} label="User Home" />
                                <NavItem to="/dashboard/cart" icon={<FaShoppingCart />} label="My Cart" badge={cart.length} />
                                <NavItem to="/dashboard/paymentHistory" icon={<FaFileInvoice />} label="Payment History" />
                            </>
                        )}
                    </ul>
                </nav>

                {/* Back to the main site (replaces the old Home link; Profile & Shop are in the main navbar) */}
                <div className="p-4 border-t border-white/10">
                    <Link to="/" className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 text-sm font-semibold text-slate-100"><FiArrowLeft className="text-teal-300" /> Back to CureMedix Home</Link>
                </div>
            </aside>

            {/* ═════════ CONTENT ═════════ */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Top bar with the menu button (phones & tablets only) */}
                <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 bg-[#0f172a] text-white px-4 py-3">
                    <button onClick={() => setOpen(true)} aria-label="Open menu" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg"><FiMenu /></button>
                    <p className="text-lg font-bold">Cure<span className="text-emerald-400">Medix</span></p>
                    <span className="text-[10px] font-semibold tracking-widest text-slate-400">{portal}</span>
                </div>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet></Outlet>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;