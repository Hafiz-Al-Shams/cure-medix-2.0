// 📁 PATH: src/pages/Dashboard/ManagePayments.jsx  (MODIFIED existing file – replace the whole file)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaFileInvoice } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { successAlert, errorAlert } from "../../utils/adminAlerts";

// Shows the amount if your payment document has one (price / amount / totalPrice / total)
const getAmount = (p) => {
    const v = p.price ?? p.amount ?? p.totalPrice ?? p.total;
    const n = Number(v);
    return v === undefined || v === null || !Number.isFinite(n) ? "—" : `$${n.toFixed(2)}`;
};

const ManagePayments = () => {
    const axiosSecure = useAxiosSecure();
    const [busyId, setBusyId] = useState(null); // disables a button while its request runs

    const { data: payments = [], refetch } = useQuery({
        queryKey: ["manage-payments"],
        queryFn: async () => (await axiosSecure.get("/manage-payments")).data,
    });

    const handleAcceptPayment = async (transactionId) => {
        setBusyId(transactionId);
        try {
            const res = await axiosSecure.patch(`/manage-payments/${transactionId}`);
            if (res.data.modifiedCount > 0) {
                refetch();
                successAlert("Payment accepted", "The payment has been marked as paid.");
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not accept payment", "Please try again in a moment.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div>
            <Helmet><title>CureMedix | Manage Payments</title></Helmet>
            <AdminPageHeader title="Manage Pending Payments" subtitle="Review transactions, verify stripe payment intents, and approve." />

            {/* Intro banner */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 sm:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white"><FaFileInvoice /></span>
                <div className="min-w-0">
                    <h2 className="font-bold text-base-content">Accept Pending Payments</h2>
                    <p className="text-xs text-base-content/70">Review stripe transactions and confirm client payments.</p>
                </div>
            </div>

            {payments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-base-content/20 py-12 text-center text-sm text-base-content/60">No payments found.</p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-sm">
                            <thead>
                                <tr className="bg-base-200/70 text-left text-xs font-bold uppercase tracking-wider text-base-content/70">
                                    <th className="w-14 px-4 py-3">No.</th>
                                    <th className="px-4 py-3">Transaction ID</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/10">
                                {payments.map((payment, i) => {
                                    const pending = payment.status === "pending";
                                    const label = String(payment.status || "").replace(/^./, (c) => c.toUpperCase());
                                    return (
                                        <tr key={payment.transactionId} className="transition-colors hover:bg-base-200/50">
                                            <td className="px-4 py-3 text-xs text-base-content/50">{i + 1}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-base-content/80">{payment.transactionId}</td>
                                            <td className="px-4 py-3 font-bold text-base-content">{getAmount(payment)}</td>
                                            <td className="px-4 py-3"><span className={`cm-chip ${pending ? "cm-tone-amber" : "cm-tone-green"}`}>{label}</span></td>
                                            <td className="px-4 py-3 text-right">
                                                {pending ? (
                                                    <button
                                                        onClick={() => handleAcceptPayment(payment.transactionId)}
                                                        disabled={busyId === payment.transactionId}
                                                        className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
                                                    >
                                                        {busyId === payment.transactionId ? "Accepting..." : "Accept Payment"}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-base-content/50">Payment Accepted</span>
                                                )}
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

export default ManagePayments;