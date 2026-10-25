// 📁 PATH: src/pages/Dashboard/ManageAppointments.jsx  (NEW FILE)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaCalendarCheck } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { confirmAction, successAlert, errorAlert } from "../../utils/adminAlerts";

const tabs = ["All", "Pending", "Confirmed", "Cancelled"];
const tone = { pending: "cm-tone-amber", confirmed: "cm-tone-green", cancelled: "cm-tone-red" };

const ManageAppointments = () => {
    const axiosSecure = useAxiosSecure();
    const [busyId, setBusyId] = useState(null); // disables the buttons of a row while its request runs
    const [tab, setTab] = useState("All");
    const [search, setSearch] = useState("");

    const { data: appointments = [], isLoading, refetch } = useQuery({
        queryKey: ["manage-appointments"],
        queryFn: async () => (await axiosSecure.get("/manage-appointments")).data,
    });

    const statusOf = (a) => a.status || "pending";
    const countOf = (t) => (t === "All" ? appointments.length : appointments.filter((a) => statusOf(a) === t.toLowerCase()).length);

    // tab filter + search (patient, doctor, email, transaction id)
    const q = search.trim().toLowerCase();
    const visible = appointments
        .filter((a) => tab === "All" || statusOf(a) === tab.toLowerCase())
        .filter((a) => !q || `${a.patientName} ${a.doctorName} ${a.email} ${a.transactionId}`.toLowerCase().includes(q));

    // Changes the status; cancelling asks for confirmation first
    const changeStatus = async (a, status) => {
        if (status === "cancelled") {
            const ok = await confirmAction({
                title: "Cancel this appointment?",
                text: `${a.patientName}'s appointment with ${a.doctorName} will be cancelled and the time slot will be released.`,
                confirmText: "Yes, cancel it",
                danger: true,
            });
            if (!ok) return;
        }
        setBusyId(a._id);
        try {
            const res = await axiosSecure.patch(`/manage-appointments/${a._id}`, { status });
            if (res.data.modifiedCount > 0) {
                refetch();
                successAlert("Appointment updated", `Status changed to ${status}.`);
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not update appointment", err.response?.data?.message || "Please try again in a moment.");
        } finally {
            setBusyId(null);
        }
    };

    const btn = "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-60";

    return (
        <div>
            <Helmet><title>CureMedix | Manage Appointments</title></Helmet>
            <AdminPageHeader title="Manage Appointments" subtitle="Review online doctor bookings, confirm them or cancel them." />

            {/* Intro banner */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 sm:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white"><FaCalendarCheck /></span>
                <div className="min-w-0">
                    <h2 className="font-bold text-base-content">Doctor Consultation Bookings</h2>
                    <p className="text-xs text-base-content/70">Cancelling an appointment releases its time slot so another patient can book it.</p>
                </div>
            </div>

            {/* Summary tiles (also work as filters) */}
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {tabs.map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`rounded-2xl border p-4 text-left shadow-sm transition-colors ${tab === t ? "border-teal-500 bg-teal-500/10" : "border-base-content/10 bg-base-100 hover:border-teal-500/50"}`}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">{t}</p>
                        <p className="mt-1 text-2xl font-bold text-base-content">{countOf(t)}</p>
                    </button>
                ))}
            </div>

            {/* Search */}
            <label className="mb-5 flex w-full items-center gap-2 rounded-xl border border-base-content/10 bg-base-100 px-3 py-2 sm:w-96">
                <FiSearch className="shrink-0 text-base-content/50" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient, doctor, email or transaction..." className="min-w-0 grow bg-transparent text-sm outline-none" />
            </label>

            {isLoading ? (
                <div className="flex justify-center py-16"><span className="loading loading-bars loading-lg"></span></div>
            ) : visible.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-base-content/20 py-12 text-center text-sm text-base-content/60">{appointments.length === 0 ? "No appointments yet." : "No appointments match your filter."}</p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead>
                                <tr className="bg-base-200/70 text-left text-xs font-bold uppercase tracking-wider text-base-content/70">
                                    <th className="w-12 px-4 py-3">No.</th>
                                    <th className="px-4 py-3">Patient</th>
                                    <th className="px-4 py-3">Doctor</th>
                                    <th className="px-4 py-3">Schedule</th>
                                    <th className="px-4 py-3">Fee</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/10">
                                {visible.map((a, i) => {
                                    const status = statusOf(a);
                                    const busy = busyId === a._id;
                                    return (
                                        <tr key={a._id} className="align-top transition-colors hover:bg-base-200/50">
                                            <td className="px-4 py-3 text-xs text-base-content/50">{i + 1}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-base-content">{a.patientName}</p>
                                                <p className="break-all text-xs text-base-content/60">{a.email}</p>
                                                <p className="mt-1 max-w-[220px] break-words text-xs text-base-content/60">“{a.reason}”</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-base-content">{a.doctorName}</p>
                                                <p className="text-xs text-base-content/60">{a.specialty}</p>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="font-semibold text-base-content">{a.dateText}</p>
                                                <p className="text-xs text-base-content/60">{a.time}</p>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-base-content">${Number(a.price).toFixed(2)}</td>
                                            <td className="px-4 py-3"><span className={`cm-chip capitalize ${tone[status]}`}>{status}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    {status === "pending" && (
                                                        <>
                                                            <button disabled={busy} onClick={() => changeStatus(a, "confirmed")} className={`${btn} bg-teal-600 text-white hover:bg-teal-700`}>{busy ? "Saving..." : "Confirm"}</button>
                                                            <button disabled={busy} onClick={() => changeStatus(a, "cancelled")} className={`${btn} cm-tone-red hover:brightness-95`}>Cancel</button>
                                                        </>
                                                    )}
                                                    {status === "confirmed" && (
                                                        <button disabled={busy} onClick={() => changeStatus(a, "cancelled")} className={`${btn} cm-tone-red hover:brightness-95`}>{busy ? "Saving..." : "Cancel"}</button>
                                                    )}
                                                    {status === "cancelled" && (
                                                        <button disabled={busy} onClick={() => changeStatus(a, "pending")} className={`${btn} cm-tone-slate hover:brightness-95`}>{busy ? "Saving..." : "Restore"}</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAppointments;