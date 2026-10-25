import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "firebase/auth";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { successAlert } from "../../utils/adminAlerts";
import { FaRegIdCard, FaUserMd, FaGoogle, FaGithub, FaFacebook } from "react-icons/fa";
import { MdFingerprint } from "react-icons/md";
import { FiEdit, FiLogOut, FiMail, FiPhone, FiShield, FiCamera, FiCalendar, FiRotateCcw, FiCopy, FiCheck, FiCheckCircle, FiUser, FiSliders, FiPackage, FiLock, FiX, FiClock, FiVideo, FiFileText, FiInfo, FiAlertCircle } from "react-icons/fi";
import { GiStethoscope } from "react-icons/gi";

// ───────────── Small helpers ─────────────
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const money = (n) => `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2)}`;

// How the user signed in (Firebase gives us this). Unknown providers are simply not shown.
const authProviders = {
    "google.com": { label: "Google", icon: <FaGoogle className="text-rose-500 text-xs" /> },
    password: { label: "Email & Password", icon: <FiMail className="text-teal-600 text-xs" /> },
    "github.com": { label: "GitHub", icon: <FaGithub className="text-xs" /> },
    "facebook.com": { label: "Facebook", icon: <FaFacebook className="text-blue-600 text-xs" /> },
};

// Status pill colours (light + dark): pending = amber, paid/confirmed = green, cancelled = rose
const pillStyle = (s) =>
    s === "cancelled"
        ? "bg-rose-100 text-rose-700 [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300"
        : s === "paid" || s === "confirmed"
            ? "bg-emerald-100 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300"
            : "bg-amber-100 text-amber-700 [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300";

const StatusPill = ({ status }) => {
    const s = String(status || "pending").toLowerCase();
    return <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 capitalize ${pillStyle(s)}`}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{s}</span>;
};

// Short explanation for each appointment status
const statusNote = {
    pending: "Waiting for the clinic to confirm your appointment.",
    confirmed: "Your appointment is confirmed. Please be online at the scheduled time.",
    cancelled: "This appointment was cancelled and its time slot was released.",
};

// Doctor photo with initials fallback
const Avatar = ({ name, img, size = "w-11 h-11" }) => {
    const [failed, setFailed] = useState(false);
    const initials = String(name || "Dr").replace("Dr. ", "").split(" ").map((w) => w[0]).join("").slice(0, 2);
    return failed || !img ? (
        <div className={`${size} shrink-0 rounded-xl bg-emerald-100 text-teal-700 font-bold flex items-center justify-center [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300`}>{initials}</div>
    ) : (
        <img src={img} alt={name} onError={() => setFailed(true)} className={`${size} shrink-0 rounded-xl object-cover`} />
    );
};

// Reusable popup shell (dark blurred backdrop + rounded box that follows the theme)
// 📱 smaller outer padding on phones so the popup uses more of the screen; overscroll-contain keeps scrolling inside the popup
const Modal = ({ onClose, size = "max-w-md", children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-3 sm:p-4" onClick={onClose}> {/* click outside = close */}
        <div className={`w-full ${size} bg-base-100 text-base-content rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain`} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
);

const Profile = () => {
    const { user, signOutUser } = useAuth(); // same hooks as before
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // ───────────── Real data from your server ─────────────
    // saved name + phone (stored in MongoDB)
    const { data: profile } = useQuery({
        queryKey: ["profile", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/users/profile/${user.email}`)).data,
    });

    // medicine payments (same key as Payment History / User Home, so the cache is shared)
    const { data: payments = [], isLoading: loadingPayments } = useQuery({
        queryKey: ["payments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/payments/${user.email}`)).data,
    });

    // doctor bookings (same key as My Appointments)
    const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
        queryKey: ["appointments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/appointments/${user.email}`)).data,
    });

    // newest first
    const orders = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

    // ✅ Same user info mapping as before, now preferring the saved database values
    const userInfo = {
        image: user?.photoURL,
        name: profile?.name || user?.displayName || "Unknown User",
        email: user?.email || "Not Provided",
        phoneNumber: profile?.phoneNumber || user?.phoneNumber || "Not Provided",
        lastSignInTime: user?.metadata?.lastSignInTime || "Unknown",
        creationTime: user?.metadata?.creationTime || "Unknown",
        userId: user?.uid || "Not provided",
    };
    const memberSince = new Date(userInfo.creationTime).toLocaleDateString();
    const lastSignIn = new Date(userInfo.lastSignInTime).toLocaleString();
    const noPhone = userInfo.phoneNumber === "Not Provided";
    const authInfo = authProviders[user?.providerData?.[0]?.providerId]; // undefined = unknown provider (row hidden)

    const [tab, setTab] = useState("details"); // details | orders | consults | security
    const [showEdit, setShowEdit] = useState(false); // Edit Profile popup
    const [showLogout, setShowLogout] = useState(false); // Confirm Logout popup
    const [copied, setCopied] = useState(false); // "Copy ID" feedback
    const [viewAppt, setViewAppt] = useState(null); // appointment shown in the summary popup
    const [copiedTx, setCopiedTx] = useState(false);

    // edit form
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editError, setEditError] = useState("");
    const [saving, setSaving] = useState(false);

    // ✅ Original logout logic (now runs after the user confirms in the popup)
    const handleLogOut = () => {
        signOutUser()
            .then(() => {
                setShowLogout(false);
                Swal.fire({ position: "center", icon: "warning", title: "Log out done!", showConfirmButton: false, timer: 1000 });
            })
            .catch((error) => console.log("ERROR", error.message));
    };

    // Copies the user ID to the clipboard and shows "Copied!" for 2 seconds
    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(userInfo.userId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.log("Copy failed", err);
        }
    };

    const handleCopyTx = async (id) => {
        try {
            await navigator.clipboard.writeText(id);
            setCopiedTx(true);
            setTimeout(() => setCopiedTx(false), 2000);
        } catch (err) {
            console.log("Copy failed", err);
        }
    };

    // Opens the Edit popup with the current values
    const openEdit = () => {
        setEditName(userInfo.name === "Unknown User" ? "" : userInfo.name);
        setEditPhone(noPhone ? "" : userInfo.phoneNumber);
        setEditError("");
        setShowEdit(true);
    };

    // Saves name + phone to MongoDB (through the server) and the name to Firebase too
    const handleSave = async (e) => {
        e.preventDefault();
        const name = editName.trim();
        const phone = editPhone.trim();
        if (name.length < 2) { setEditError("Please enter your full name (at least 2 characters)."); return; }
        if (phone && !/^\+?[0-9\s\-()]{7,20}$/.test(phone)) { setEditError("Please enter a valid phone number, e.g. +1 555 000 0000."); return; }

        setSaving(true);
        setEditError("");
        try {
            await axiosSecure.patch(`/users/profile/${user.email}`, { name, phoneNumber: phone });
            try {
                await updateProfile(user, { displayName: name }); // keeps the Firebase name in sync (navbar, invoice)
            } catch (fbErr) {
                console.log("Firebase name update skipped", fbErr);
            }
            queryClient.setQueryData(["profile", user.email], { name, phoneNumber: phone }); // updates this page instantly
            setShowEdit(false);
            successAlert("Profile updated", "Your details were saved successfully.");
        } catch (err) {
            console.error(err);
            setEditError(err.response?.data?.message || "Could not save your changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Tabs (count = little number badge, only when there is something to count)
    const tabs = [
        { key: "details", label: "Personal Details", icon: <FaRegIdCard /> },
        { key: "orders", label: "Pharmacy Orders", icon: <FiPackage />, count: orders.length },
        { key: "consults", label: "Doctor Consultations", icon: <FaUserMd />, count: appointments.length },
        { key: "security", label: "Security & Privacy", icon: <FiLock /> },
    ];

    // 📱 inputs use text-base on phones (16px stops iOS zoom on focus), text-sm from sm: upward (same as before)
    const inputClass = "mt-1.5 w-full bg-base-100 border border-base-content/15 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";
    const rowClass = "flex items-center justify-between gap-3 sm:gap-4 py-3 sm:py-3.5 [&>span]:shrink-0 [&>b]:text-right [&>b]:min-w-0 [&>b]:[overflow-wrap:anywhere] border-b border-base-content/10 last:border-0 text-sm"; // label/value rows
    const emptyBox = "bg-base-100 border border-base-content/10 rounded-2xl py-10 sm:py-12 px-4 text-center";

    return (
        <div className="px-4 sm:px-6 py-5 sm:py-10 pb-14 sm:pb-20 overflow-x-hidden"> {/* smaller padding on phones; overflow-x-hidden = page can never scroll sideways */}
            <div className="max-w-4xl 2xl:max-w-5xl mx-auto"> {/* a bit wider on very large screens */}
                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 [[data-theme=dark]_&]:bg-emerald-500/10 [[data-theme=dark]_&]:border-emerald-500/20 [[data-theme=dark]_&]:text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Account Dashboard</span>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">User Profile &amp; Account</h1>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto"> {/* buttons share the full width on phones */}
                        <button onClick={openEdit} className="btn btn-sm bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 gap-2 flex-1 sm:flex-none [[data-theme=dark]_&]:bg-teal-500/10 [[data-theme=dark]_&]:border-teal-500/20 [[data-theme=dark]_&]:text-teal-300 [[data-theme=dark]_&]:hover:bg-teal-500/20"><FiEdit /> Edit Details</button>
                        <button onClick={() => setShowLogout(true)} className="btn btn-sm bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 gap-2 flex-1 sm:flex-none [[data-theme=dark]_&]:bg-rose-500/10 [[data-theme=dark]_&]:border-rose-500/20 [[data-theme=dark]_&]:text-rose-300 [[data-theme=dark]_&]:hover:bg-rose-500/20"><FiLogOut /> Logout</button>
                    </div>
                </div>

                {/* ── Profile card ── */}
                <div className="relative mt-5 sm:mt-6 overflow-hidden bg-base-100 border border-base-content/10 rounded-3xl p-4 min-[400px]:p-5 sm:p-7 shadow-lg">
                    <div className="pointer-events-none absolute -right-10 -top-10 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" /> {/* soft green glow */}
                    <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                        {/* ROUND profile photo with teal ring + camera badge (a little smaller on tiny phones) */}
                        <div className="relative shrink-0">
                            {userInfo.image ? (
                                <img src={userInfo.image} alt="Profile" className="w-20 h-20 min-[400px]:w-24 min-[400px]:h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-teal-200" />
                            ) : (
                                <div className="w-20 h-20 min-[400px]:w-24 min-[400px]:h-24 sm:w-28 sm:h-28 rounded-full border-4 border-teal-200 bg-emerald-100 text-teal-700 text-3xl sm:text-4xl font-bold flex items-center justify-center">{userInfo.name[0]}</div>
                            )}
                            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 text-white border-2 border-base-100 flex items-center justify-center text-sm"><FiCamera /></span>
                        </div>

                        <div className="flex-1 w-full min-w-0 text-center sm:text-left"> {/* min-w-0 lets long text wrap instead of overflowing */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                                <h2 className="text-xl min-[400px]:text-2xl sm:text-3xl font-extrabold break-words max-w-full">{userInfo.name}</h2>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-emerald-100 border border-emerald-200 rounded-md px-2 py-1 uppercase [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:border-emerald-500/25 [[data-theme=dark]_&]:text-emerald-300"><FiShield /> Verified Patient</span>
                            </div>
                            <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-start justify-center sm:justify-start gap-x-6 gap-y-1.5 text-sm pb-3 border-b border-base-content/10"> {/* stacked + centered on phones, side by side from sm: */}
                                <span className="flex items-center justify-center sm:justify-start gap-2 min-w-0 max-w-full break-all"><FiMail className="text-teal-600 shrink-0" /> {userInfo.email}</span>
                                <span className={`flex items-center gap-2 ${noPhone ? "italic text-base-content/50" : ""}`}><FiPhone className="text-teal-600 shrink-0" /> {userInfo.phoneNumber}</span>
                            </div>
                            <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-start justify-center sm:justify-start gap-x-6 gap-y-1.5 text-xs text-base-content/70">
                                <span className="flex flex-wrap items-center justify-center gap-1.5"><FiCalendar className="text-teal-600" /> Member Since: <b className="text-base-content">{memberSince}</b></span>
                                <span className="flex flex-wrap items-center justify-center gap-1.5"><FiRotateCcw className="text-teal-600" /> Last Sign-In: <b className="text-base-content">{lastSignIn}</b></span>
                            </div>
                        </div>
                    </div>

                    {/* User ID box + Copy ID */}
                    <div className="relative mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-base-content/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200/60 border border-base-content/10 rounded-2xl px-3 sm:px-4 py-3"> {/* stacks on phones */}
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 shrink-0 rounded-lg bg-emerald-100 text-teal-700 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300"><MdFingerprint /></span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold tracking-wider text-base-content/50">USER ID</p>
                                    <p className="font-mono text-xs break-all">{userInfo.userId}</p>
                                </div>
                            </div>
                            <button onClick={handleCopyId} className="btn btn-sm bg-base-100 border border-base-content/15 gap-2 shrink-0 w-full sm:w-auto">{copied ? <FiCheck className="text-emerald-600" /> : <FiCopy className="text-teal-600" />} {copied ? "Copied!" : "Copy ID"}</button>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                {/* 📱 on phones the strip stretches edge-to-edge (-mx-4) so swiping feels natural; unchanged from sm: upward */}
                <div className="mt-5 sm:mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-nowrap gap-x-1 sm:gap-x-2 overflow-x-auto overscroll-x-contain border-b border-base-content/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"> {/* swipe sideways on small screens */}
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)} className={`flex shrink-0 items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 ${tab === t.key ? "text-teal-600 border-teal-600" : "text-base-content/60 border-transparent hover:text-base-content"}`}>
                            {t.icon} {t.label}
                            {t.count > 0 && <span className={`text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center ${tab === t.key ? "bg-emerald-100 text-teal-700 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300" : "bg-base-200 text-base-content/60"}`}>{t.count}</span>}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Personal Details ── */}
                {tab === "details" && (
                    <div className="mt-4 sm:mt-5 grid md:grid-cols-2 gap-4 sm:gap-5">
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-4 sm:p-5">
                            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-base-content/70 uppercase mb-2"><FiUser className="text-teal-600" /> Basic Information</h3>
                            <div className={rowClass}><span className="text-base-content/70">Full Name</span><b>{userInfo.name}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Email Address</span><b>{userInfo.email}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Phone Number</span><b className={noPhone ? "italic font-medium text-base-content/50" : ""}>{userInfo.phoneNumber}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Account Status</span><b className="flex items-center gap-1.5 text-emerald-600"><FiCheckCircle /> Active Patient</b></div>
                        </div>
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-4 sm:p-5">
                            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-base-content/70 uppercase mb-2"><FiSliders className="text-teal-600" /> Account Activity</h3>
                            <div className={rowClass}><span className="text-base-content/70">Member Since</span><b>{memberSince}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Last Login Timestamp</span><b>{lastSignIn}</b></div>
                            {/* shown only when we know how the user signed in */}
                            {authInfo && <div className={rowClass}><span className="text-base-content/70">Authentication Type</span><b className="flex items-center gap-1.5">{authInfo.icon} {authInfo.label}</b></div>}
                            <div className={rowClass}><span className="text-base-content/70">Email Verification</span>{user?.emailVerified ? <b className="flex items-center gap-1.5 text-emerald-600"><FiCheckCircle /> Verified</b> : <b className="flex items-center gap-1.5 text-amber-600"><FiAlertCircle /> Not verified</b>}</div>
                        </div>
                    </div>
                )}

                {/* ── Tab: Pharmacy Orders (real medicine payments only) ── */}
                {tab === "orders" && (
                    <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
                        {loadingPayments ? (
                            <div className="flex justify-center py-14"><span className="loading loading-bars loading-lg"></span></div>
                        ) : orders.length === 0 ? (
                            <div className={emptyBox}>
                                <span className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-teal-600 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-emerald-500/15"><FiPackage /></span>
                                <p className="mt-3 font-semibold">No pharmacy orders yet</p>
                                <p className="text-xs text-base-content/60 mt-1">Your medicine orders will appear here.</p>
                                <Link to="/shop" className="mt-5 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Go to Shop</Link>
                            </div>
                        ) : (
                            orders.map((o) => {
                                const names = (o.items || []).map((i) => i.name).filter(Boolean);
                                const summary = names.length ? names.slice(0, 2).join(" & ") + (names.length > 2 ? ` +${names.length - 2} more` : "") : "Medicine order";
                                const status = String(o.status || "pending").toLowerCase();
                                return (
                                    <div key={o._id || o.transactionId} className="flex flex-wrap items-center gap-x-4 gap-y-3 bg-base-100 border border-base-content/10 rounded-2xl p-3 sm:p-4">
                                        <span className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-teal-600 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300"><FiPackage /></span>
                                        <div className="flex-1 min-w-[10rem]">
                                            <p className="font-bold break-all sm:break-normal">Order #{String(o.transactionId || "").slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-base-content/60 break-words sm:truncate">{summary}{o.totalItems ? ` • ${o.totalItems} ${o.totalItems === 1 ? "item" : "items"}` : ""} • {fmtDate(o.date)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap pt-3 sm:pt-0 border-t border-base-content/10 sm:border-0"> {/* status + price + invoice drop to their own line on phones, separated by a thin line */}
                                            <StatusPill status={status} />
                                            <span className="font-bold">{money(o.price)}</span>
                                            <Link to="/invoice" state={{ transactionId: o.transactionId }} className="btn btn-xs border-0 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 rounded-full px-3"><FiFileText /> Invoice</Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ── Tab: Doctor Consultations (real appointments) ── */}
                {tab === "consults" && (
                    <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
                        {loadingAppointments ? (
                            <div className="flex justify-center py-14"><span className="loading loading-bars loading-lg"></span></div>
                        ) : appointments.length === 0 ? (
                            <div className={emptyBox}>
                                <span className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-teal-600 flex items-center justify-center text-2xl [[data-theme=dark]_&]:bg-emerald-500/15"><GiStethoscope /></span>
                                <p className="mt-3 font-semibold">No doctor consultations yet</p>
                                <p className="text-xs text-base-content/60 mt-1">Book a video consultation with one of our doctors.</p>
                                <Link to="/online-doctor" className="mt-5 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Find a Doctor</Link>
                            </div>
                        ) : (
                            appointments.map((a) => (
                                <div key={a._id} className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 bg-base-100 border border-base-content/10 rounded-2xl p-3 sm:p-4">
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <Avatar name={a.doctorName} img={a.doctorImg} />
                                        <div className="min-w-0">
                                            <p className="font-bold break-words sm:truncate">Teleconsultation with {a.doctorName}</p> {/* wraps on phones so the doctor's name is never cut off */}
                                            <p className="text-xs text-base-content/60 break-words">{a.specialty} • {a.dateText}, {a.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between lg:justify-end">
                                        <StatusPill status={a.status} />
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button onClick={() => setViewAppt(a)} className="btn btn-sm flex-1 sm:flex-none whitespace-nowrap bg-base-200 hover:bg-base-300 border-0 rounded-full px-3 sm:px-4 gap-1.5 text-xs sm:text-sm"><FiInfo className="text-teal-600" /> View Details</button>
                                            <Link to="/invoice" state={{ transactionId: a.transactionId }} className="btn btn-sm flex-1 sm:flex-none whitespace-nowrap border-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-3 sm:px-4 gap-1.5 text-xs sm:text-sm"><FiFileText /> View Invoice</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── Tab: Security & Privacy ── */}
                {tab === "security" && (
                    <div className="mt-4 sm:mt-5 bg-base-100 border border-base-content/10 rounded-2xl px-4 sm:px-6 py-2">
                        <div className="flex items-center justify-between gap-3 sm:gap-4 py-4 border-b border-base-content/10">
                            <div className="min-w-0"><p className="font-bold">Two-Factor Authentication (2FA)</p><p className="text-xs text-base-content/60">Add an extra layer of security to your medical profile</p></div>
                            <span className="text-xs font-bold bg-base-200 text-base-content/70 rounded-full px-3 py-1 shrink-0">Disabled</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:gap-4 py-4">
                            <div className="min-w-0"><p className="font-bold">Password Change</p><p className="text-xs text-base-content/60">Update your account password periodically</p></div>
                            <span className="text-xs font-bold bg-base-200 text-base-content/70 rounded-full px-3 py-1 shrink-0">Not available yet</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ═════════ POPUP: Edit Profile Information (name + phone are saved for real) ═════════ */}
            {showEdit && (
                <Modal onClose={() => !saving && setShowEdit(false)} size="max-w-md">
                    <form onSubmit={handleSave} className="p-4 min-[400px]:p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold"><FiEdit className="text-teal-600 shrink-0" /> Edit Profile Information</h3>
                            <button type="button" onClick={() => !saving && setShowEdit(false)} aria-label="Close" className="w-9 h-9 shrink-0 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center"><FiX /></button>
                        </div>
                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="text-xs font-semibold">Full Name</label>
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={60} placeholder="Your full name" className={inputClass} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold flex items-center gap-1.5">Email Address <FiLock className="text-base-content/40" /></label>
                                <input type="email" value={userInfo.email} readOnly disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
                                <p className="mt-1.5 text-[11px] text-base-content/50">{`Your email is your account ID and is linked to your orders and bookings, so it can't be changed here.`}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold">Phone Number</label>
                                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} maxLength={20} placeholder="+1 (555) 000-0000" className={inputClass} />
                            </div>
                        </div>
                        {editError && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 [[data-theme=dark]_&]:text-rose-300">{editError}</p>}
                        {/* 📱 two equal full-width buttons on phones, right-aligned compact buttons from sm: upward */}
                        <div className="mt-6 grid grid-cols-2 sm:flex sm:justify-end gap-3">
                            <button type="button" disabled={saving} onClick={() => setShowEdit(false)} className="btn btn-sm bg-base-200 hover:bg-base-300 border-0 w-full sm:w-auto">Cancel</button>
                            <button type="submit" disabled={saving} className="btn btn-sm border-0 bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30 disabled:opacity-60 w-full sm:w-auto">
                                {saving ? (<><span className="loading loading-spinner loading-xs"></span> Saving...</>) : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ═════════ POPUP: Consultation Summary ═════════ */}
            {viewAppt && (
                <Modal onClose={() => setViewAppt(null)} size="max-w-lg">
                    <div className="flex items-start justify-between gap-3 px-4 min-[400px]:px-5 sm:px-6 py-4 sm:py-5 border-b border-base-content/10 bg-base-200/50 rounded-t-3xl">
                        <div className="min-w-0">
                            <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold"><FiVideo className="text-teal-600 shrink-0" /> Consultation Summary</h3>
                            <p className="text-xs text-base-content/60 mt-0.5">Booked on {fmtDate(viewAppt.date)}</p>
                        </div>
                        <button onClick={() => setViewAppt(null)} aria-label="Close" className="w-9 h-9 shrink-0 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center"><FiX /></button>
                    </div>

                    <div className="p-4 min-[400px]:p-5 sm:p-6">
                        {/* Doctor + status (status pill drops under the name on very small phones) */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Avatar name={viewAppt.doctorName} img={viewAppt.doctorImg} size="w-14 h-14" />
                            <div className="min-w-0 flex-1 basis-32">
                                <p className="font-bold leading-tight break-words">{viewAppt.doctorName}</p>
                                <p className="text-xs text-base-content/60">{viewAppt.specialty}</p>
                            </div>
                            <StatusPill status={viewAppt.status} />
                        </div>

                        {/* Details grid */}
                        <div className="mt-5 grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-4 bg-base-200/60 border border-base-content/10 rounded-2xl p-3 sm:p-4 text-xs">
                            <div className="min-w-0"><p className="flex items-center gap-1.5 text-base-content/50"><FiCalendar /> Date</p><p className="mt-0.5 font-semibold break-words">{viewAppt.dateText}</p></div>
                            <div className="min-w-0"><p className="flex items-center gap-1.5 text-base-content/50"><FiClock /> Time</p><p className="mt-0.5 font-semibold break-words">{viewAppt.time}</p></div>
                            <div className="min-w-0"><p className="flex items-center gap-1.5 text-base-content/50"><FiUser /> Patient</p><p className="mt-0.5 font-semibold break-words">{viewAppt.patientName}</p></div>
                            <div className="min-w-0"><p className="flex items-center gap-1.5 text-base-content/50"><FiVideo /> Type</p><p className="mt-0.5 font-semibold">Video Consultation</p></div>
                            <div className="min-w-0"><p className="text-base-content/50">Fee Paid</p><p className="mt-0.5 font-bold text-teal-600">{money(viewAppt.price)}</p></div>
                            <div className="min-w-0"><p className="text-base-content/50">Payment</p><p className="mt-0.5 font-semibold text-emerald-600">Received</p></div>
                            <div className="col-span-2 min-w-0 border-t border-base-content/10 pt-3"><p className="text-base-content/50">Reason for visit</p><p className="mt-0.5 font-semibold break-words">{viewAppt.reason}</p></div>
                        </div>

                        {/* Status note */}
                        <p className="mt-4 flex items-start gap-2 text-xs text-base-content/70"><FiInfo className="mt-0.5 shrink-0 text-teal-600" /> {statusNote[viewAppt.status || "pending"]}</p>

                        {/* Transaction id */}
                        <div className="mt-4 flex items-center justify-between gap-3 bg-base-200/60 border border-base-content/10 rounded-xl px-3.5 py-2.5">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold tracking-wider text-base-content/50">TRANSACTION ID</p>
                                <p className="font-mono text-[11px] break-all">{viewAppt.transactionId}</p>
                            </div>
                            <button onClick={() => handleCopyTx(viewAppt.transactionId)} aria-label="Copy transaction id" className="shrink-0 p-1 text-base-content/40 hover:text-teal-600">{copiedTx ? <FiCheck className="text-emerald-600" /> : <FiCopy />}</button>
                        </div>

                        {/* Footer buttons */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => setViewAppt(null)} className="btn border-0 bg-base-200 hover:bg-base-300 rounded-xl">Close</button>
                            <Link to="/invoice" state={{ transactionId: viewAppt.transactionId }} className="btn border-0 bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2 shadow-lg shadow-teal-600/30 whitespace-nowrap"><FiFileText /> View Invoice</Link>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═════════ POPUP: Confirm Logout ═════════ */}
            {showLogout && (
                <Modal onClose={() => setShowLogout(false)} size="max-w-sm">
                    <div className="p-5 min-[400px]:p-7 text-center">
                        <span className="mx-auto w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300"><FiLogOut /></span>
                        <h3 className="mt-4 text-lg font-bold">Confirm Logout</h3>
                        <p className="mt-2 text-xs text-base-content/60">Are you sure you want to end your current session on CureMedix?</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => setShowLogout(false)} className="btn border-0 bg-base-200 hover:bg-base-300 rounded-xl">Cancel</button>
                            <button onClick={handleLogOut} className="btn border-0 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/30">Logout</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Profile;