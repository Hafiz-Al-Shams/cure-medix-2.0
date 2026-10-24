// 📁 PATH: src/pages/InvoicePage.jsx  (MODIFIED existing file – replace the whole file)
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { FiArrowLeft, FiCheck, FiCheckCircle, FiCopy, FiDownload, FiFileText, FiMoon, FiSun, FiUser } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import logo from "../assets/logo.png";
import { errorAlert, successAlert } from "../utils/adminAlerts";

const InvoicePage = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const location = useLocation();
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // This page is outside the dashboard layout, so it applies the saved theme itself (+ has a toggle)
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("theme", next);
    };

    // Payments of this user (own query key so it never shows stale data from other pages)
    const { data: payments = [], isLoading } = useQuery({
        queryKey: ["invoice-payments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/payments/${user.email}`)).data,
    });

    // ONLY the current payment: the one just made (id sent from checkout) or, if opened directly, the latest one
    const targetId = location.state?.transactionId;
    const latest = payments.reduce((a, b) => (!a || new Date(b.date) > new Date(a.date) ? b : a), null);
    const payment = (targetId && payments.find((p) => p.transactionId === targetId)) || latest;

    const amount = payment ? `$${Number(payment.price || 0).toFixed(2)}` : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(payment.transactionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            errorAlert("Could not copy", "Please select and copy the transaction ID manually.");
        }
    };

    // Download the invoice card as PDF (same html2pdf settings as before)
    const handlePrint = () => {
        const invoiceElement = document.getElementById("invoice");
        if (!invoiceElement) {
            errorAlert("Error!", "Invoice content not found!");
            return;
        }
        setDownloading(true);
        html2pdf()
            .set({
                margin: 10,
                filename: `Invoice_${user?.displayName || "Customer"}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(invoiceElement)
            .save()
            .then(() => successAlert("Invoice downloaded", "Your PDF invoice was downloaded successfully."))
            .catch((err) => {
                console.error("PDF Download Error:", err);
                errorAlert("Oops!", "Failed to generate the PDF. Please try again.");
            })
            .finally(() => setDownloading(false));
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-base-content [[data-theme=dark]_&]:bg-slate-950">
            <Helmet><title>CureMedix | Invoice</title></Helmet>

            {/* Top bar */}
            <div className="border-b border-base-content/10 bg-base-100">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-base-content/70 hover:text-base-content"><FiArrowLeft /> Back to Home</Link>
                    <button onClick={toggleTheme} aria-label="Toggle theme" className="flex h-9 w-9 items-center justify-center rounded-full bg-base-200 text-base-content/80 hover:bg-base-300">{theme === "light" ? <FiMoon /> : <FiSun />}</button>
                </div>
            </div>

            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
                <div className="mb-7 text-center">
                    <h1 className="text-3xl font-bold text-base-content">Invoice</h1>
                    <p className="mt-1 text-sm text-base-content/60">Official medicine purchase receipt</p>
                </div>

                {isLoading || !user ? (
                    <div className="flex justify-center py-20"><span className="loading loading-bars loading-lg"></span></div>
                ) : !payment ? (
                    <div className="rounded-2xl border border-dashed border-base-content/20 bg-base-100 px-6 py-14 text-center">
                        <p className="font-semibold text-base-content">No invoice found</p>
                        <p className="mt-1 text-sm text-base-content/60">{`You haven't made a payment yet.`}</p>
                        <Link to="/shop" className="mt-5 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Go to Shop</Link>
                    </div>
                ) : (
                    <>
                        {/* ── The invoice "paper" (always light colours so the PDF is always clean) ── */}
                        <div id="invoice" className="overflow-hidden rounded-2xl bg-white text-slate-900 shadow-xl">
                            <div className="h-1.5 bg-gradient-to-r from-teal-600 to-emerald-500" />
                            <div className="px-6 pb-8 pt-8 sm:px-9">

                                {/* Brand + transaction id */}
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50"><img src={logo} alt="CureMedix logo" className="h-8 w-8 object-contain" /></span>
                                        <div className="leading-tight">
                                            <p className="text-2xl font-bold text-slate-900">CureMedix</p>
                                            <p className="text-xs text-slate-500">Company Limited</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:max-w-[330px]">
                                        <p className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction ID</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <p className="break-all font-mono text-xs font-semibold text-teal-700">{payment.transactionId}</p>
                                            <button onClick={handleCopy} data-html2canvas-ignore="true" aria-label="Copy transaction ID" className="shrink-0 text-slate-400 hover:text-teal-600">{copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}</button>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-7 border-slate-200" />

                                {/* Customer + purchase details */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700"><FiUser /> Customer Information</h3>
                                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Name:</span><span className="text-right font-semibold">{user.displayName || "—"}</span></div>
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Email:</span><span className="break-all text-right font-mono text-xs font-semibold">{user.email}</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700"><FiFileText /> Purchase Details</h3>
                                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Transaction Date:</span><span className="text-right font-semibold">{new Date(payment.date).toLocaleString()}</span></div>
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Total Price:</span><span className="text-right text-base font-bold">{amount}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment status band */}
                            <div className="flex items-center justify-between gap-4 bg-emerald-50 px-6 py-5 sm:px-9">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600"><FiCheckCircle /></span>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment Status</p>
                                        <p className="text-sm font-semibold text-emerald-700">Payment Received successfully</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount Paid</p>
                                    <p className="text-2xl font-bold text-slate-900">{amount}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-7 text-center sm:px-9">
                                <p className="text-sm font-semibold text-slate-800">Thank you for your purchase!</p>
                                <p className="mt-1 text-xs text-slate-500">CureMedix Company Limited | <span className="text-teal-700">www.curemedix-company.com</span></p>
                            </div>
                        </div>

                        <div className="mt-7 flex justify-center">
                            <button onClick={handlePrint} disabled={downloading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition-opacity hover:opacity-90 disabled:opacity-60">
                                {downloading ? (<><span className="loading loading-spinner loading-sm"></span> Generating...</>) : (<><FiDownload className="text-lg" /> Download PDF</>)}
                            </button>
                        </div>
                    </>
                )}
            </main>

            <footer className="border-t border-base-content/10 py-4 text-center text-xs text-base-content/50">© {new Date().getFullYear()} CureMedix. All rights reserved.</footer>
        </div>
    );
};

export default InvoicePage;