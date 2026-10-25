// 📁 PATH: src/pages/InvoicePage.jsx  (MODIFIED existing file – replace the whole file)
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { FiArrowLeft, FiCheck, FiCheckCircle, FiCopy, FiDownload, FiFileText, FiMoon, FiPackage, FiShoppingBag, FiSun, FiUser, FiVideo } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import logo from "../assets/logo.png";
import { errorAlert, successAlert } from "../utils/adminAlerts";

// same column layout for the items header and every item row (sm and up). On phones rows become compact cards.
const itemCols = "sm:grid-cols-[44px_minmax(0,1fr)_56px_84px_96px]";

const money = (n) => `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2)}`;

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

    // Medicine payments of this user (own query key so it never shows stale data from other pages)
    const { data: payments = [], isLoading: loadingPayments, isFetching: fetchingPayments } = useQuery({
        queryKey: ["invoice-payments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/payments/${user.email}`)).data,
    });

    // ✅ NEW: doctor appointments of this user
    const { data: appointments = [], isLoading: loadingAppointments, isFetching: fetchingAppointments } = useQuery({
        queryKey: ["invoice-appointments", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/appointments/${user.email}`)).data,
    });

    // ✅ NEW: both kinds in ONE list, so the invoice can be either a medicine order or a consultation
    const records = [
        ...payments.map((p) => ({ ...p, kind: "medicine" })),
        ...appointments.map((a) => ({ ...a, kind: "consultation" })),
    ];

    // ONLY the current record: the one just paid (id sent from checkout) or, if opened directly, the latest of all
    const targetId = location.state?.transactionId;
    const latest = records.reduce((a, b) => (!a || new Date(b.date) > new Date(a.date) ? b : a), null);
    const found = targetId ? records.find((r) => r.transactionId === targetId) : null;
    const payment = found || latest;
    const isConsult = payment?.kind === "consultation";

    // keep the loader while the just-paid record is still being fetched (avoids flashing an older invoice)
    const waitingForFresh = !!targetId && !found && (fetchingPayments || fetchingAppointments);
    const isLoading = loadingPayments || loadingAppointments || waitingForFresh;

    const amount = payment ? `$${Number(payment.price || 0).toFixed(2)}` : "";

    // medicines bought in this payment (older payments made before the update have no list)
    const items = !isConsult && Array.isArray(payment?.items) ? payment.items : [];
    const totalPieces = isConsult ? 1 : (payment?.totalItems ?? items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0));

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(payment.transactionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            errorAlert("Could not copy", "Please select and copy the transaction ID manually.");
        }
    };

    // Download the invoice card as PDF (keeps item rows from splitting across pages)
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
                pagebreak: { mode: ["css", "legacy"], avoid: ".invoice-row" },
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

            <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-8 sm:px-4 sm:py-10">
                <div className="mb-7 text-center">
                    <h1 className="text-2xl font-bold text-base-content sm:text-3xl">Invoice</h1>
                    <p className="mt-1 text-sm text-base-content/60">{isConsult ? "Official video consultation receipt" : "Official medicine purchase receipt"}</p>
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
                            <div className="px-4 pb-8 pt-7 sm:px-9 sm:pt-8">

                                {/* Brand + transaction id */}
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50"><img src={logo} alt="CureMedix logo" className="h-8 w-8 object-contain" /></span>
                                        <div className="leading-tight">
                                            <p className="text-2xl font-bold text-slate-900">CureMedix</p>
                                            <p className="text-xs text-slate-500">Company Limited</p>
                                        </div>
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:max-w-[330px]">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-right">Transaction ID</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <p className="min-w-0 break-all font-mono text-xs font-semibold text-teal-700">{payment.transactionId}</p>
                                            <button onClick={handleCopy} data-html2canvas-ignore="true" aria-label="Copy transaction ID" className="shrink-0 text-slate-400 hover:text-teal-600">{copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}</button>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-7 border-slate-200" />

                                {/* Customer + purchase details */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="min-w-0">
                                        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700"><FiUser /> Customer Information</h3>
                                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Name:</span><span className="text-right font-semibold">{user.displayName || "—"}</span></div>
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Email:</span><span className="min-w-0 break-all text-right font-mono text-xs font-semibold">{user.email}</span></div>
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700"><FiFileText /> Purchase Details</h3>
                                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Transaction Date:</span><span className="text-right font-semibold">{new Date(payment.date).toLocaleString()}</span></div>
                                            {isConsult ? (
                                                <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Booking Status:</span><span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold capitalize text-amber-700">{payment.status || "pending"}</span></div>
                                            ) : (
                                                totalPieces > 0 && <div className="flex justify-between gap-4"><span className="text-slate-500">Total Items:</span><span className="text-right font-semibold">{totalPieces}</span></div>
                                            )}
                                            <div className="flex justify-between gap-4"><span className="text-slate-500">Total Price:</span><span className="text-right text-base font-bold">{amount}</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* ✅ NEW: consultation details (doctor booking) */}
                                {isConsult && (
                                    <div className="mt-8">
                                        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700"><FiVideo /> Consultation Details</h3>
                                        <div className="overflow-hidden rounded-xl border border-slate-200">
                                            <div className="invoice-row flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                                                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-teal-50 text-teal-600">
                                                    <FiVideo />
                                                    {payment.doctorImg && <img src={payment.doctorImg} alt={payment.doctorName} onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full bg-white object-cover" />}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="break-words text-sm font-semibold leading-snug text-slate-900">{payment.doctorName}</p>
                                                    <p className="truncate text-[11px] text-slate-500">{payment.specialty}</p>
                                                </div>
                                                <span className="text-right text-sm font-bold text-slate-900">{money(payment.price)}</span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 py-4 text-sm sm:grid-cols-2">
                                                <div className="min-w-0"><p className="text-[11px] text-slate-500">Patient</p><p className="break-words font-semibold">{payment.patientName}</p></div>
                                                <div className="min-w-0"><p className="text-[11px] text-slate-500">Consultation Type</p><p className="font-semibold">Video Consultation</p></div>
                                                <div className="min-w-0"><p className="text-[11px] text-slate-500">Date</p><p className="font-semibold">{payment.dateText}</p></div>
                                                <div className="min-w-0"><p className="text-[11px] text-slate-500">Time</p><p className="font-semibold">{payment.time}</p></div>
                                                <div className="min-w-0 sm:col-span-2"><p className="text-[11px] text-slate-500">Reason for Visit</p><p className="break-words font-semibold">{payment.reason}</p></div>
                                            </div>

                                            <div className="space-y-1.5 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                                                <div className="flex justify-between text-slate-600"><span>Consultation fee</span><span className="font-semibold">{amount}</span></div>
                                                <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Grand Total</span><span className="text-base font-bold text-teal-700">{amount}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* medicines bought in this order (unchanged) */}
                                {!isConsult && (
                                    <div className="mt-8">
                                        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700"><FiShoppingBag /> Ordered Medicines</h3>

                                        {items.length > 0 ? (
                                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                                {/* Header bar (tablet / desktop only) */}
                                                <div className={`hidden items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white sm:grid ${itemCols}`}>
                                                    <span>#</span>
                                                    <span>Medicine</span>
                                                    <span className="text-center">Qty</span>
                                                    <span className="text-right">Unit Price</span>
                                                    <span className="text-right">Total</span>
                                                </div>

                                                {items.map((it, i) => {
                                                    const qty = Number(it.quantity) || 1;
                                                    const unit = Number(it.unitPrice ?? it.price) || 0;
                                                    const line = Number(it.lineTotal ?? unit * qty) || 0;
                                                    return (
                                                        <div key={it.cartId || i} className={`invoice-row grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 px-3 py-3 last:border-0 sm:px-4 ${itemCols}`}>
                                                            {/* Image (falls back to an icon) */}
                                                            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-teal-50 text-teal-600">
                                                                <FiPackage />
                                                                {it.image && <img src={it.image} alt={it.name} onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full bg-white object-cover" />}
                                                            </span>

                                                            {/* Name + type / company */}
                                                            <div className="min-w-0">
                                                                <p className="break-words text-sm font-semibold leading-snug text-slate-900">{it.name}</p>
                                                                <p className="truncate text-[11px] text-slate-500">{it.type}{it.company ? ` • ${it.company}` : ""}</p>
                                                                {/* phones: qty × unit price under the name */}
                                                                <p className="mt-0.5 text-[11px] font-medium text-teal-700 sm:hidden">{qty} × {money(unit)}</p>
                                                            </div>

                                                            {/* tablet / desktop columns */}
                                                            <span className="hidden text-center text-sm font-semibold sm:block">{qty}</span>
                                                            <span className="hidden text-right text-sm text-slate-600 sm:block">{money(unit)}</span>

                                                            {/* line total (always visible) */}
                                                            <span className="text-right text-sm font-bold text-slate-900">{money(line)}</span>
                                                        </div>
                                                    );
                                                })}

                                                {/* Totals */}
                                                <div className="space-y-1.5 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                                                    <div className="flex justify-between text-slate-600"><span>Total items</span><span className="font-semibold">{totalPieces}</span></div>
                                                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-semibold">{amount}</span></div>
                                                    <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Grand Total</span><span className="text-base font-bold text-teal-700">{amount}</span></div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Payments made before the update have no saved medicine list */
                                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                                                <p className="text-sm font-semibold text-slate-700">Medicine details are not available for this order</p>
                                                <p className="mt-1 text-xs text-slate-500">This payment was made before item details were saved. Only the total amount is available.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Payment status band */}
                            <div className="flex flex-col gap-3 bg-emerald-50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-9">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600"><FiCheckCircle /></span>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment Status</p>
                                        <p className="text-sm font-semibold text-emerald-700">Payment Received successfully</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-emerald-100 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount Paid</p>
                                    <p className="text-2xl font-bold text-slate-900">{amount}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-7 text-center sm:px-9">
                                <p className="text-sm font-semibold text-slate-800">{isConsult ? "Thank you for booking with CureMedix!" : "Thank you for your purchase!"}</p>
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