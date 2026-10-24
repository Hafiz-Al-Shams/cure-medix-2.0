// 📁 PATH: src/pages/Dashboard/PaymentHistory.jsx  (MODIFIED existing file – replace the whole file)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiCopy, FiCheck, FiFileText } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// Same column layout for the header row and every row (phones use stacked rows)
const cols = "md:grid md:grid-cols-[56px_120px_1fr_130px]";

// Coloured status pill: pending = amber, failed = rose, anything else (paid/succeeded) = green
const StatusPill = ({ status }) => {
    const s = String(status || "").toLowerCase();
    const style = s.includes("pend")
        ? "bg-amber-100 text-amber-700 [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300"
        : s.includes("fail") || s.includes("cancel")
            ? "bg-rose-100 text-rose-700 [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300"
            : "bg-emerald-100 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300";
    return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 ${style}`}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{status}</span>;
};

const PaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [search, setSearch] = useState(""); // transaction-id search text
    const [copiedId, setCopiedId] = useState(null); // which transaction id was just copied

    // ✅ Same data request as before
    const { data: payments = [] } = useQuery({
        queryKey: ["payments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments/${user.email}`);
            return res.data;
        },
    });

    // Search filters the rows by transaction id (the big total above always shows all payments)
    const visible = payments.filter((p) => String(p.transactionId || "").toLowerCase().includes(search.trim().toLowerCase()));

    // Copies a transaction id and shows a check icon for 2 seconds
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
            {/* ── Header card: title + search ── */}
            <div className="bg-emerald-50/70 [[data-theme=dark]_&]:bg-emerald-500/10 border border-base-content/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Total actual Payments: <span className="text-teal-600">{payments.length}</span></h2>
                    <p className="mt-1 text-sm text-base-content/60">Audit log of your completed and pending gateway payment transactions.</p>
                </div>
                <label className="flex items-center gap-2 bg-base-100 border border-base-content/10 rounded-xl px-3 py-2 w-full md:w-72">
                    <FiSearch className="text-base-content/50 shrink-0" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Transaction ID..." className="grow min-w-0 bg-transparent outline-none text-sm" />
                </label>
            </div>

            {/* ── Payments table (stacked rows on phones) ── */}
            <div className="bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden shadow-sm">
                <div className={`hidden ${cols} items-center bg-base-200/70 text-xs font-bold uppercase tracking-wide text-base-content/60 px-6 py-4`}>
                    <span>No.</span><span>Price</span><span>Transaction Id</span><span className="text-right">Status</span>
                </div>

                {visible.map((payment, i) => (
                    <div key={payment._id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 sm:px-6 md:gap-0 ${cols} border-b border-base-content/10 last:border-0`}>
                        <span className="text-sm text-base-content/70">{i + 1}</span>
                        <span className="font-bold">${payment.price}</span>
                        <span className="order-last md:order-none w-full md:w-auto min-w-0 flex items-center gap-2 font-mono text-xs sm:text-sm break-all">
                            {payment.transactionId}
                            <button onClick={() => handleCopy(payment.transactionId)} aria-label="Copy transaction id" className="shrink-0 text-base-content/40 hover:text-teal-600">{copiedId === payment.transactionId ? <FiCheck className="text-emerald-600" /> : <FiCopy />}</button>
                        </span>
                        <span className="ml-auto md:ml-0 md:text-right"><StatusPill status={payment.status} /></span>
                    </div>
                ))}

                {/* Empty / no-match message */}
                {visible.length === 0 && (
                    <div className="py-14 px-4 text-center">
                        <span className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-teal-600 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-emerald-500/15"><FiFileText /></span>
                        <p className="mt-3 font-semibold">{payments.length === 0 ? "No payments yet" : "No transaction matches your search"}</p>
                        <p className="text-xs text-base-content/60 mt-1">{payments.length === 0 ? "Your completed and pending payments will appear here." : "Try a different transaction ID."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;