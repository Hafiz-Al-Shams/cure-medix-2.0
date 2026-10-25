import { Link, NavLink } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { FaStethoscope } from "react-icons/fa";
import { RiShoppingBag2Line } from "react-icons/ri";
import { IoMdHome } from "react-icons/io";
import { BsCart2 } from "react-icons/bs";
import { MdOutlineDarkMode, MdLightMode } from "react-icons/md";
import {
    FiUser,
    FiTruck,
    FiShield,
    FiPhone,
    FiLogOut,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useCart from "../../../hooks/useCart";
import useAdmin from "../../../hooks/useAdmin";
import useSeller from "../../../hooks/useSeller";
import useAuth from "../../../hooks/useAuth";

// Pill style for nav links: active = soft emerald, inactive = plain text
const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30"
        : "text-base-content/70 hover:text-emerald-600"
    }`;

// Closes an open DaisyUI dropdown
const closeDropdown = () => document.activeElement?.blur();

const NavBar = () => {
    const { user, signOutUser } = useAuth();
    const [isAdmin] = useAdmin();
    const [isSeller] = useSeller();
    const [cart] = useCart();
    const [showLogout, setShowLogout] = useState(false);

    // Theme toggle + persistence
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

    // Logout runs only after the user confirms in the popup
    const handleLogOut = () => {
        signOutUser()
            .then(() => {
                setShowLogout(false);

                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "Logged out!",
                    showConfirmButton: false,
                    timer: 1000,
                });
            })
            .catch((err) => console.error("ERROR", err.message));
    };

    // Main navigation links
    const links = (
        <>
            <li>
                <NavLink to="/" className={linkClass}>
                    <IoMdHome className="text-lg" /> Home
                </NavLink>
            </li>

            <li>
                <NavLink to="/shop" className={linkClass}>
                    <RiShoppingBag2Line className="text-lg" /> Shop
                </NavLink>
            </li>

            <li>
                <NavLink to="/online-doctor" className={linkClass}>
                    <FaStethoscope /> Online Doctor
                </NavLink>
            </li>
        </>
    );

    // Avatar dropdown links
    const dropdownLinks = (
        <>
            <li>
                <NavLink to="/update-profile">Profile</NavLink>
            </li>

            {user && isAdmin && (
                <li>
                    <NavLink to="/dashboard/adminHome">Dashboard</NavLink>
                </li>
            )}

            {user && isSeller && (
                <li>
                    <NavLink to="/dashboard/sellerHome">Dashboard</NavLink>
                </li>
            )}

            {!isSeller && !isAdmin && (
                <li>
                    <NavLink to="/dashboard/userHome">Dashboard</NavLink>
                </li>
            )}

            <li>
                <a
                    onClick={() => {
                        closeDropdown();
                        setShowLogout(true);
                    }}
                >
                    Logout
                </a>
            </li>
        </>
    );

    return (
        <>
            {/* Top info bar */}
            <div className="bg-emerald-900 text-white/90 text-[10px] sm:text-[11px]">
                <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-1.5 flex justify-between items-center gap-3">
                    <div className="flex gap-3 sm:gap-5 min-w-0">
                        <span className="flex items-center gap-1.5 min-w-0">
                            <FiTruck className="shrink-0" />
                            <span className="truncate">
                                Express Delivery Available in 2 Hours
                            </span>
                        </span>

                        <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
                            <FiShield />
                            100% Certified Authentic Medicines
                        </span>
                    </div>

                    <span className="hidden lg:flex items-center gap-1.5 font-medium whitespace-nowrap">
                        <FiPhone />
                        24/7 Support: 1-800-MEDIX
                    </span>
                </div>
            </div>

            {/* Main navbar */}
            <div className="sticky top-0 z-50 bg-base-100 border-b border-base-content/10 shadow-sm">
                <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-3">

                    {/* Left: mobile menu + logo */}
                    <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <div className="dropdown lg:hidden">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-sm px-2"
                                aria-label="Open menu"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h8m-8 6h16"
                                    />
                                </svg>
                            </div>

                            {/* Mobile/tablet menu */}
                            <ul
                                tabIndex={0}
                                onClick={(e) => {
                                    if (e.target.closest("a")) closeDropdown();
                                }}
                                className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-60 max-w-[85vw] p-2 shadow space-y-1"
                            >
                                {links}
                            </ul>
                        </div>

                        <Link
                            to="/"
                            className="flex items-center gap-1.5 sm:gap-2 min-w-0"
                        >
                            <img
                                src={logo}
                                alt="logo"
                                className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0"
                            />

                            <div className="leading-tight">
                                <h4 className="hidden md:block md:text-lg font-bold text-base-content">
                                    Cure<span className="text-emerald-400">Medix</span>
                                </h4>

                                <p className="hidden md:block text-[9px] tracking-widest text-base-content">
                                    HEALTHCARE PLATFORM
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Center: desktop navigation links */}
                    <ul className="hidden lg:flex items-center gap-1">
                        {links}
                    </ul>

                    {/* Right: theme, cart, and user */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">

                        {/* Theme toggle */}
                        <div
                            className="tooltip tooltip-bottom"
                            data-tip={theme === "light" ? "Toggle Dark" : "Toggle Light"}
                        >
                            <button
                                onClick={toggleTheme}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Toggle theme"
                            >
                                {theme === "light" ? (
                                    <MdOutlineDarkMode className="text-lg" />
                                ) : (
                                    <MdLightMode className="text-lg" />
                                )}
                            </button>
                        </div>

                        {/* Cart with live count */}
                        <Link
                            to="/dashboard/cart"
                            className="relative btn btn-sm btn-circle btn-ghost"
                            aria-label="Cart"
                        >
                            <BsCart2 className="text-lg" />

                            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        </Link>

                        {/* User profile or Join Us / Login */}
                        {user ? (
                            <div className="dropdown dropdown-end">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    aria-label="Open user menu"
                                    className="btn btn-ghost btn-xs !w-8 !h-8 lg:!w-9 lg:!h-9 !min-h-0 !p-0 !rounded-full !overflow-hidden !border-0 !bg-transparent !shadow-none hover:!bg-transparent active:!bg-transparent focus:!bg-transparent hover:!shadow-none active:!shadow-none focus:!shadow-none focus-visible:!outline-none focus-visible:!ring-0"
                                >
                                    <img
                                        src={user.photoURL}
                                        alt="avatar"
                                        className="block w-full h-full !rounded-full object-cover"
                                    />
                                </div>

                                <ul
                                    tabIndex={0}
                                    onClick={(e) => {
                                        if (e.target.closest("a")) closeDropdown();
                                    }}
                                    className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-48 sm:w-52 p-3 sm:p-4 shadow space-y-2"
                                >
                                    {dropdownLinks}
                                </ul>
                            </div>
                        ) : (
                            <Link
                                to="/signIn"
                                className="btn btn-sm border-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-3 sm:px-4"
                            >
                                <FiUser />

                                <span className="sm:hidden">Login</span>

                                <span className="hidden sm:inline">
                                    Join Us / Login
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup: Confirm Logout */}
            {showLogout && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
                    onClick={() => setShowLogout(false)}
                >
                    <div
                        className="w-full max-w-sm bg-base-100 text-base-content rounded-3xl shadow-2xl p-6 sm:p-7 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="mx-auto w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl">
                            <FiLogOut />
                        </span>

                        <h3 className="mt-4 text-lg font-bold">
                            Confirm Logout
                        </h3>

                        <p className="mt-2 text-xs text-base-content/60">
                            Are you sure you want to end your current session on CureMedix?
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowLogout(false)}
                                className="btn border-0 bg-base-200 hover:bg-base-300 rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleLogOut}
                                className="btn border-0 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/30"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;