// 📁 PATH: src/pages/Dashboard/MyAppointments.jsx  (NEW FILE)
import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { FiCalendar, FiCheck, FiClock, FiCopy, FiFileText, FiVideo, FiArrowRight } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const tabs = ["All", "Pending", "Confirmed", "Cancelled"];

// Short explanation shown under each status
const statusNote = {
    pending: "Waiting for the clinic to confirm your appointment.",
    confirmed: "Your appointment is confirmed. Please be online at the scheduled time.",
    cancelled: "This appointment was cancelled and its time slot was released.",
};

// Coloured status pill: pending = amber, cancelled = rose, confirmed = green (same colours as Payment History)
const StatusPill = ({ status }) => {
    const s = String(status || "pending").toLowerCase();
    const style = s === "cancelled"
        ? "bg-rose-100 text-rose-700 [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300"
        : s === "confirmed"
            ? "bg-emerald-100 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300"
            : "bg-amber-100 text-amber-700 [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300";
    return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 capitalize ${style}`}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{s}</span>;
};

// Doctor photo with initials fallback
const Avatar = ({ name, img }) => {
    const [failed, setFailed] = useState(false);
    const initials = String(name || "Dr").replace("Dr. ", "").split(" ").map((w) => w[0]).join("").slice(0, 2);
    return failed || !img ? (
        <div className="w-14 h-14 shrink-0 rounded-xl bg-emerald-100 text-teal-700 font-bold flex items-center justify-center [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300">{initials}</div>
    ) : (
        <img src={img} alt={name} onError={() => setFailed(true)} className="w-14 h-14 shrink-0 rounded-xl object-cover" />
    );
};

const MyAppointments = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [tab, setTab] = useState("All");
    const [copiedId, setCopiedId] = useState(null);

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ["appointments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/appointments/${user.email}`)).data,
    });

    const countOf = (t) => (t === "All" ? appointments.length : appointments.filter((a) => (a.status || "pending") === t.toLowerCase()).length);
    const visible = tab === "All" ? appointments : appointments.filter((a) => (a.status || "pending") === tab.toLowerCase());

    const handleCopy = async (id) => {
        try {
            await navigator.clipboard.writeText(id);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.log("Copy failed", err);
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto space-y-5 sm:space-y-6">
            <Helmet><title>CureMedix | My Appointments</title></Helmet>

            {/* ── Header card ── */}
            <div className="bg-emerald-50/70 [[data-theme=dark]_&]:bg-emerald-500/10 border border-base-content/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Appointments: <span className="text-teal-600">{appointments.length}</span></h2>
                    <p className="mt-1 text-sm text-base-content/60">Track the status of your online doctor consultations.</p>
                </div>
                <Link to="/online-doctor" className="btn btn-sm sm:btn-md border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg shadow-teal-600/30 w-fit"><FiVideo /> Book a Doctor</Link>
            </div>

            {/* ── Status tabs ── */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`text-xs font-semibold px-4 py-2 rounded-full border ${tab === t ? "bg-teal-600 border-teal-600 text-white" : "bg-base-100 border-base-content/10 text-base-content/80 hover:border-teal-500"}`}>
                        {t} <span className={tab === t ? "text-white/80" : "text-base-content/50"}>({countOf(t)})</span>
                    </button>
                ))}
            </div>

            {/* ── List ── */}
            {isLoading ? (
                <div className="flex justify-center py-16"><span className="loading loading-bars loading-lg"></span></div>
            ) : visible.length === 0 ? (
                <div className="bg-base-100 border border-base-content/10 rounded-2xl py-14 px-4 text-center shadow-sm">
                    <span className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-teal-600 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-emerald-500/15"><FiCalendar /></span>
                    <p className="mt-3 font-semibold">{appointments.length === 0 ? "No appointments yet" : `No ${tab.toLowerCase()} appointments`}</p>
                    <p className="text-xs text-base-content/60 mt-1">{appointments.length === 0 ? "Book a video consultation with one of our doctors." : "Try another filter."}</p>
                    {appointments.length === 0 && <Link to="/online-doctor" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Find a Doctor <FiArrowRight /></Link>}
                </div>
            ) : (
                <div className="space-y-4">
                    {visible.map((a) => {
                        const status = a.status || "pending";
                        return (
                            <div key={a._id} className="bg-base-100 border border-base-content/10 rounded-2xl p-4 sm:p-5 shadow-sm">
                                {/* Top: doctor + status */}
                                <div className="flex items-start gap-3">
                                    <Avatar name={a.doctorName} img={a.doctorImg} />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold leading-tight truncate">{a.doctorName}</h3>
                                        <p className="text-xs text-base-content/60">{a.specialty}</p>
                                        <p className="mt-1 text-[11px] text-base-content/50">Booked on {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                    </div>
                                    <div className="shrink-0"><StatusPill status={status} /></div>
                                </div>

                                {/* Details */}
                                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-base-200/60 rounded-xl p-3.5 text-xs">
                                    <div className="min-w-0"><p className="flex items-center gap-1.5 text-base-content/50"><FiCalendar /> Date</p><p className="mt-0.5 font-semibold">{a.dateText}</p></div>
                                    <div className="min-w-0"><p className="flex items-center gap-1.5 text-base-content/50"><FiClock /> Time</p><p className="mt-0.5 font-semibold">{a.time}</p></div>
                                    <div className="min-w-0"><p className="text-base-content/50">Patient</p><p className="mt-0.5 font-semibold truncate">{a.patientName}</p></div>
                                    <div className="min-w-0"><p className="text-base-content/50">Fee Paid</p><p className="mt-0.5 font-bold text-teal-600">${Number(a.price).toFixed(2)}</p></div>
                                    <div className="col-span-2 lg:col-span-4 min-w-0 border-t border-base-content/10 pt-3"><p className="text-base-content/50">Reason for visit</p><p className="mt-0.5 font-semibold break-words">{a.reason}</p></div>
                                </div>

                                {/* Status note */}
                                <p className="mt-3 text-xs text-base-content/60">{statusNote[status]}</p>

                                {/* Footer: transaction id + invoice */}
                                <div className="mt-4 pt-3 border-t border-base-content/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <span className="min-w-0 flex items-center gap-2 font-mono text-[11px] text-base-content/70 break-all">
                                        {a.transactionId}
                                        <button onClick={() => handleCopy(a.transactionId)} aria-label="Copy transaction id" className="shrink-0 text-base-content/40 hover:text-teal-600">{copiedId === a.transactionId ? <FiCheck className="text-emerald-600" /> : <FiCopy />}</button>
                                    </span>
                                    <Link to="/invoice" state={{ transactionId: a.transactionId }} className="btn btn-sm border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 w-fit"><FiFileText /> View Invoice</Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;