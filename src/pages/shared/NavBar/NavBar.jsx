import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png"; // ✅ your ORIGINAL logo, untouched
import { FaStethoscope } from "react-icons/fa";
import { RiShoppingBag2Line } from "react-icons/ri";
import { IoMdHome } from "react-icons/io";
import { BsCart2 } from "react-icons/bs";
import { MdOutlineDarkMode, MdLightMode } from "react-icons/md";
import { FiSearch, FiUser, FiTruck, FiShield, FiPhone, FiTag, FiFileText } from "react-icons/fi";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useCart from "../../../hooks/useCart";
import useAdmin from "../../../hooks/useAdmin";
import useSeller from "../../../hooks/useSeller";
import useAuth from "../../../hooks/useAuth";

// Pill style for nav links: active = soft emerald, inactive = plain text
const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30" : "text-base-content/70 hover:text-emerald-600"
    }`;

const NavBar = () => {
    const { user, signOutUser } = useAuth(); // logged-in user + logout function
    const [isAdmin] = useAdmin();
    const [isSeller] = useSeller();
    const [cart] = useCart(); // cart.length drives the badge
    const navigate = useNavigate();
    const [search, setSearch] = useState(""); // navbar search text

    // ─── Theme toggle + persistence (unchanged) ───
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

    // ─── Logout (unchanged) ───
    const handleLogOut = () => {
        signOutUser()
            .then(() => Swal.fire({ position: "center", icon: "warning", title: "Logged out!", showConfirmButton: false, timer: 1000 }))
            .catch((err) => console.error("ERROR", err.message));
    };

    // Search -> shop page with ?search=
    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
    };

    // ─── Main links (Cart moved to its own icon button on the right, like the mockup) ───
    const links = (
        <>
            <li><NavLink to="/" className={linkClass}><IoMdHome className="text-lg" /> Home</NavLink></li>
            <li><NavLink to="/shop" className={linkClass}><RiShoppingBag2Line className="text-lg" /> Shop</NavLink></li>
            {/* NEW in mockup: change these two routes to your real pages when you have them */}
            <li><Link to="/shop" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-emerald-600"><FiTag /> Deals</Link></li>
            {/* Online Doctor now uses the same linkClass as the others, so it is highlighted ONLY on its own page */}
            <li><NavLink to="/online-doctor" className={linkClass}><FaStethoscope /> Online Doctor</NavLink></li>
            <li><Link to="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-emerald-600"><FiFileText /> Articles</Link></li>
        </>
    );

    // ─── Avatar dropdown (unchanged logic) ───
    const dropdownLinks = (
        <>
            <li><NavLink to="/update-profile">Update Profile</NavLink></li>
            {user && isAdmin && <li><NavLink to="/dashboard/adminHome">Dashboard</NavLink></li>}
            {user && isSeller && <li><NavLink to="/dashboard/sellerHome">Dashboard</NavLink></li>}
            {!isSeller && !isAdmin && <li><NavLink to="/dashboard/userHome">Dashboard</NavLink></li>}
            <li><a onClick={handleLogOut}>Logout</a></li>
        </>
    );

    return (
        <>
            {/* ── Top info bar (scrolls away) ── */}
            <div className="bg-emerald-900 text-white/90 text-[11px]">
                <div className="max-w-screen-xl mx-auto px-4 py-1.5 flex justify-between items-center">
                    <div className="flex gap-5">
                        <span className="flex items-center gap-1.5"><FiTruck /> Express Delivery Available in 2 Hours</span>
                        <span className="hidden sm:flex items-center gap-1.5"><FiShield /> 100% Certified Authentic Medicines</span>
                    </div>
                    <span className="hidden sm:flex items-center gap-1.5 font-medium"><FiPhone /> 24/7 Support: 1-800-MEDIX</span>
                </div>
            </div>

            {/* ── Main navbar (sticky) ── */}
            <div className="sticky top-0 z-50 bg-base-100 border-b border-base-content/10 shadow-sm">
                <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
                    {/* Left: mobile menu + logo */}
                    <div className="flex items-center gap-1">
                        <div className="dropdown lg:hidden">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm px-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-56 p-2 shadow space-y-1">
                                {links}
                            </ul>
                        </div>
                        <Link to="/" className="flex items-center gap-2">
                            <img src={logo} alt="logo" className="w-7 h-7 object-contain" /> {/* your original logo file */}
                            <div className="leading-tight">
                                {/* Same two-tone text as the footer: "Cure" + emerald "Medix" (Cure uses theme text color so it stays visible on the white navbar) */}
                                <h4 className="text-xl font-bold text-base-content">Cure<span className="text-emerald-400">Medix</span></h4>
                                <p className="hidden md:block text-[9px] tracking-widest text-base-content">HEALTHCARE PLATFORM</p>
                            </div>
                        </Link>
                    </div>

                    {/* Center: desktop links */}
                    <ul className="hidden lg:flex items-center gap-1">{links}</ul>

                    {/* Right: search, theme, cart, user */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <form onSubmit={handleSearch} className="hidden xl:flex items-center gap-2 bg-base-200 rounded-lg px-3 py-1.5">
                            <FiSearch className="text-base-content/50" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="bg-transparent outline-none text-xs w-36 text-base-content" />
                        </form>

                        {/* Theme toggle (unchanged behavior) */}
                        <div className="tooltip tooltip-bottom" data-tip={theme === "light" ? "Toggle Dark" : "Toggle Light"}>
                            <button onClick={toggleTheme} className="btn btn-sm btn-circle btn-ghost">
                                {theme === "light" ? <MdOutlineDarkMode className="text-lg" /> : <MdLightMode className="text-lg" />}
                            </button>
                        </div>

                        {/* Cart with live count */}
                        <Link to="/dashboard/cart" className="relative btn btn-sm btn-circle btn-ghost" aria-label="Cart">
                            <BsCart2 className="text-lg" />
                            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>
                        </Link>

                        {user ? (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs p-0 rounded-full">
                                    <img src={user.photoURL} alt="avatar" className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover" />
                                </div>
                                <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-52 p-4 shadow space-y-2">
                                    {dropdownLinks}
                                </ul>
                            </div>
                        ) : (
                            <Link to="/signIn" className="btn btn-sm border-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                                <FiUser /> Join Us / Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavBar;