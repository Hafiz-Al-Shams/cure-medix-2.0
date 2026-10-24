// 📁 PATH: src/pages/Profile/Profile.jsx  (MODIFIED existing file – replace the whole file; now fully responsive)
import { useState } from "react";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import { FaRegIdCard, FaUserMd, FaGoogle } from "react-icons/fa";
import { MdFingerprint } from "react-icons/md";
import { FiEdit, FiLogOut, FiMail, FiPhone, FiShield, FiCamera, FiCalendar, FiRotateCcw, FiCopy, FiCheck, FiCheckCircle, FiUser, FiSliders, FiPackage, FiTruck, FiLock, FiX } from "react-icons/fi";
import { GiStethoscope } from "react-icons/gi";

// ───────────── Static demo data (replace with real data later) ─────────────
const orders = [
    { id: "#CM-883921", items: "Ibuprofen 400mg & Cetirizine 10mg", status: "Delivered", date: "Delivered Oct 24, 2026", price: "$14.50", icon: <FiPackage />, pill: "bg-emerald-100 text-emerald-700" },
    { id: "#CM-883104", items: "Amoxicillin 500mg (Prescription)", status: "In Transit", date: "In Transit", price: "$22.00", icon: <FiTruck />, pill: "bg-amber-100 text-amber-700" },
];

// Reusable popup shell (dark blurred backdrop + white rounded box)
const Modal = ({ onClose, size = "max-w-md", children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4" onClick={onClose}> {/* click outside = close */}
        <div className={`w-full ${size} bg-base-100 text-base-content rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
);

const Profile = () => {
    const { user, signOutUser } = useAuth(); // same hooks as before

    // ✅ Same user info mapping as your original code
    const userInfo = {
        image: user?.photoURL,
        name: user?.displayName || "Unknown User",
        email: user?.email || "Not Provided",
        phoneNumber: user?.phoneNumber || "Not Provided",
        lastSignInTime: user?.metadata?.lastSignInTime || "Unknown",
        creationTime: user?.metadata?.creationTime || "Unknown",
        userId: user?.uid || "Not provided",
    };
    const memberSince = new Date(userInfo.creationTime).toLocaleDateString();
    const lastSignIn = new Date(userInfo.lastSignInTime).toLocaleString();
    const noPhone = userInfo.phoneNumber === "Not Provided";

    const [tab, setTab] = useState("details"); // details | orders | consults | security
    const [showEdit, setShowEdit] = useState(false); // Edit Profile popup
    const [showLogout, setShowLogout] = useState(false); // Confirm Logout popup
    const [copied, setCopied] = useState(false); // "Copy ID" feedback

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

    // Small helper for the tab buttons (count = little number badge)
    const tabs = [
        { key: "details", label: "Personal Details", icon: <FaRegIdCard /> },
        { key: "orders", label: "Pharmacy Orders", icon: <FiPackage />, count: 2 },
        { key: "consults", label: "Doctor Consultations", icon: <FaUserMd />, count: 1 },
        { key: "security", label: "Security & Privacy", icon: <FiLock /> },
    ];

    const inputClass = "mt-1.5 w-full bg-base-100 border border-base-content/15 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";
    const rowClass = "flex items-center justify-between gap-4 py-3.5 [&>span]:shrink-0 [&>b]:text-right [&>b]:min-w-0 [&>b]:[overflow-wrap:anywhere] border-b border-base-content/10 last:border-0 text-sm"; // label/value rows

    return (
        <div className="px-4 sm:px-6 py-6 sm:py-10 pb-16 sm:pb-20"> {/* smaller padding on phones */}
            <div className="max-w-4xl 2xl:max-w-5xl mx-auto"> {/* a bit wider on very large screens */}
                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Account Dashboard</span>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">User Profile &amp; Account</h1>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto"> {/* buttons share the full width on phones */}
                        <button onClick={() => setShowEdit(true)} className="btn btn-sm bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 gap-2 flex-1 sm:flex-none"><FiEdit /> Edit Details</button>
                        <button onClick={() => setShowLogout(true)} className="btn btn-sm bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 gap-2 flex-1 sm:flex-none"><FiLogOut /> Logout</button>
                    </div>
                </div>

                {/* ── Profile card ── */}
                <div className="relative mt-6 overflow-hidden bg-base-100 border border-base-content/10 rounded-3xl p-6 sm:p-7 shadow-lg">
                    <div className="pointer-events-none absolute -right-10 -top-10 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" /> {/* soft green glow */}
                    <div className="relative flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        {/* ROUND profile photo with teal ring + camera badge */}
                        <div className="relative shrink-0">
                            {userInfo.image ? (
                                <img src={userInfo.image} alt="Profile" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-teal-200" />
                            ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-teal-200 bg-emerald-100 text-teal-700 text-4xl font-bold flex items-center justify-center">{userInfo.name[0]}</div>
                            )}
                            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal-600 text-white border-2 border-base-100 flex items-center justify-center text-sm"><FiCamera /></span>
                        </div>

                        <div className="flex-1 w-full min-w-0 text-center sm:text-left"> {/* min-w-0 lets long text wrap instead of overflowing */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                <h2 className="text-2xl sm:text-3xl font-extrabold break-words">{userInfo.name}</h2>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-emerald-100 border border-emerald-200 rounded-md px-2 py-1 uppercase"><FiShield /> Verified Patient</span>
                            </div>
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-1 text-sm pb-3 border-b border-base-content/10">
                                <span className="flex items-center gap-2 min-w-0 break-all"><FiMail className="text-teal-600 shrink-0" /> {userInfo.email}</span>
                                <span className={`flex items-center gap-2 ${noPhone ? "italic text-base-content/50" : ""}`}><FiPhone className="text-teal-600" /> {userInfo.phoneNumber}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-1 text-xs text-base-content/70">
                                <span className="flex items-center gap-1.5"><FiCalendar className="text-teal-600" /> Member Since: <b className="text-base-content">{memberSince}</b></span>
                                <span className="flex items-center gap-1.5"><FiRotateCcw className="text-teal-600" /> Last Sign-In: <b className="text-base-content">{lastSignIn}</b></span>
                            </div>
                        </div>
                    </div>

                    {/* User ID box + Copy ID */}
                    <div className="relative mt-6 pt-6 border-t border-base-content/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200/60 border border-base-content/10 rounded-2xl px-4 py-3"> {/* stacks on phones */}
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 shrink-0 rounded-lg bg-emerald-100 text-teal-700 flex items-center justify-center text-xl"><MdFingerprint /></span>
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
                <div className="mt-6 sm:mt-8 flex flex-nowrap gap-x-1 sm:gap-x-2 overflow-x-auto border-b border-base-content/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"> {/* swipe sideways on small screens */}
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)} className={`flex shrink-0 items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 ${tab === t.key ? "text-teal-600 border-teal-600" : "text-base-content/60 border-transparent hover:text-base-content"}`}>
                            {t.icon} {t.label}
                            {t.count && <span className={`text-[10px] rounded-full w-5 h-5 flex items-center justify-center ${tab === t.key ? "bg-emerald-100 text-teal-700" : "bg-base-200 text-base-content/60"}`}>{t.count}</span>}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Personal Details ── */}
                {tab === "details" && (
                    <div className="mt-5 grid md:grid-cols-2 gap-5">
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-5">
                            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-base-content/70 uppercase mb-2"><FiUser className="text-teal-600" /> Basic Information</h3>
                            <div className={rowClass}><span className="text-base-content/70">Full Name</span><b>{userInfo.name}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Email Address</span><b>{userInfo.email}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Phone Number</span><b className={noPhone ? "italic font-medium text-base-content/50" : ""}>{userInfo.phoneNumber}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Account Status</span><b className="flex items-center gap-1.5 text-emerald-600"><FiCheckCircle /> Active Patient</b></div>
                        </div>
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-5">
                            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-base-content/70 uppercase mb-2"><FiSliders className="text-teal-600" /> Account Activity</h3>
                            <div className={rowClass}><span className="text-base-content/70">Member Since</span><b>{memberSince}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Last Login Timestamp</span><b>{lastSignIn}</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Authentication Type</span><b className="flex items-center gap-1.5"><FaGoogle className="text-rose-500 text-xs" /> Google / Password</b></div>
                            <div className={rowClass}><span className="text-base-content/70">Default Address</span><b className="italic font-medium text-base-content/50">Not Set</b></div>
                        </div>
                    </div>
                )}

                {/* ── Tab: Pharmacy Orders (static demo) ── */}
                {tab === "orders" && (
                    <div className="mt-5 space-y-4">
                        {orders.map((o) => (
                            <div key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 bg-base-100 border border-base-content/10 rounded-2xl p-4">
                                <span className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-teal-600 flex items-center justify-center text-xl">{o.icon}</span>
                                <div className="flex-1 min-w-[10rem]">
                                    <p className="font-bold">Order {o.id}</p>
                                    <p className="text-xs text-base-content/60 sm:truncate">{o.items} • {o.date}</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end"> {/* status + price drop to their own line on phones */}
                                    <span className={`text-xs font-bold rounded-full px-3 py-1 ${o.pill}`}>{o.status}</span>
                                    <span className="font-bold">{o.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Tab: Doctor Consultations (static demo) ── */}
                {tab === "consults" && (
                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-base-100 border border-base-content/10 rounded-2xl p-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-teal-600 flex items-center justify-center text-2xl"><GiStethoscope /></span>
                        <div className="min-w-0">
                            <p className="font-bold">Teleconsultation with Dr. Elena Rostova</p>
                            <p className="text-xs text-base-content/60">General Medicine • Oct 24, 2026, 11:30 AM</p>
                        </div>
                        </div>
                        <button className="btn btn-sm border-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full px-5 w-full sm:w-auto">View Summary</button>
                    </div>
                )}

                {/* ── Tab: Security & Privacy (static demo) ── */}
                {tab === "security" && (
                    <div className="mt-5 bg-base-100 border border-base-content/10 rounded-2xl px-4 sm:px-6 py-2">
                        <div className="flex items-center justify-between gap-4 py-4 border-b border-base-content/10">
                            <div><p className="font-bold">Two-Factor Authentication (2FA)</p><p className="text-xs text-base-content/60">Add an extra layer of security to your medical profile</p></div>
                            <span className="text-xs font-bold bg-base-200 text-base-content/70 rounded-full px-3 py-1 shrink-0">Disabled</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-4">
                            <div><p className="font-bold">Password Change</p><p className="text-xs text-base-content/60">Update your account password periodically</p></div>
                            <button className="text-xs font-bold bg-base-200 hover:bg-base-300 text-base-content/80 rounded-full px-4 py-1.5 shrink-0">Update</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ═════════ POPUP: Edit Profile Information (design only – save logic comes later) ═════════ */}
            {showEdit && (
                <Modal onClose={() => setShowEdit(false)} size="max-w-md">
                    <div className="p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold"><FiEdit className="text-teal-600" /> Edit Profile Information</h3>
                            <button onClick={() => setShowEdit(false)} aria-label="Close" className="w-9 h-9 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center"><FiX /></button>
                        </div>
                        <div className="mt-5 space-y-4">
                            <div><label className="text-xs font-semibold">Full Name</label><input defaultValue={user?.displayName || ""} className={inputClass} /></div>
                            <div><label className="text-xs font-semibold">Email Address</label><input type="email" defaultValue={user?.email || ""} className={inputClass} /></div>
                            <div><label className="text-xs font-semibold">Phone Number</label><input placeholder="+1 (555) 000-0000" className={inputClass} /></div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowEdit(false)} className="btn btn-sm bg-base-200 hover:bg-base-300 border-0">Cancel</button>
                            {/* TODO: connect your update-profile logic here later; for now it just closes the popup */}
                            <button onClick={() => setShowEdit(false)} className="btn btn-sm border-0 bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30">Save Changes</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═════════ POPUP: Confirm Logout ═════════ */}
            {showLogout && (
                <Modal onClose={() => setShowLogout(false)} size="max-w-sm">
                    <div className="p-7 text-center">
                        <span className="mx-auto w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl"><FiLogOut /></span>
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