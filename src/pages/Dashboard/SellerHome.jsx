// 📁 PATH: src/pages/Dashboard/SellerHome.jsx  (MODIFIED existing file – replace the whole file)
// 100% real, seller-specific data: every number and table row comes from GET /seller-dashboard/:email
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaPills, FaAd } from "react-icons/fa";
import { FiActivity, FiClock, FiDownload, FiPlus, FiPackage, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { successAlert, infoAlert } from "../../utils/adminAlerts";

const PAGE_STEP = 10; // table rows shown at a time

const money = (n) => `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2)}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const StatCard = ({ label, value, icon, tone, badge }) => (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">{label}</p>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm cm-tone-${tone}`}>{icon}</span>
        </div>
        <p className="mt-4 break-words text-2xl font-bold text-base-content sm:text-3xl">{value}</p>
        <span className={`cm-chip mt-3 cm-tone-${tone}`}>{badge}</span>
    </div>
);

// grey placeholder cards while the numbers load
const StatSkeleton = () => (
    <div className="animate-pulse rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm">
        <div className="flex items-start justify-between"><div className="h-3 w-28 rounded bg-base-200" /><div className="h-9 w-9 rounded-lg bg-base-200" /></div>
        <div className="mt-5 h-8 w-24 rounded bg-base-200" />
        <div className="mt-4 h-5 w-36 rounded-full bg-base-200" />
    </div>
);

const StatusChip = ({ status }) => <span className={`cm-chip ${status === "Fulfilled" ? "cm-tone-green" : "cm-tone-amber"}`}>{status}</span>;

const SellerHome = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [visible, setVisible] = useState(PAGE_STEP);

    // Everything on this page comes from this single call (only THIS seller's data)
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["seller-dashboard", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/seller-dashboard/${user.email}`)).data,
    });

    const stats = data?.stats;
    const sales = data?.sales || [];
    const isNewSeller = !!stats && stats.medicinesListed === 0 && sales.length === 0;

    // Export CSV: downloads ALL sales rows (UTF-8 BOM + quotes escaped, so Excel opens it perfectly)
    const handleExport = () => {
        if (sales.length === 0) {
            infoAlert("Nothing to export", "You don't have any sales yet, so there is no report to download.");
            return;
        }
        const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const header = ["#", "Order Ref", "Order Date", "Medicine Item", "Category", "Units Sold", "Unit Price", "Total Revenue", "Fulfillment Status"];
        const rows = sales.map((r, i) => [i + 1, r.orderRef, fmtDate(r.date), r.name, r.category, r.quantity, r.unitPrice.toFixed(2), r.total.toFixed(2), r.status]);
        const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(esc).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        successAlert("Report exported", "Your sales report CSV has been downloaded.");
    };

    const shown = sales.slice(0, visible);

    return (
        <div>
            <Helmet><title>CureMedix | Seller Home</title></Helmet>
            <AdminPageHeader title="Welcome Home Seller" subtitle="Sales performance analytics, order breakdowns, and store statistics." roleLabel="Verified Seller" />

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">Seller Metrics</p>

            {/* ── 4 metric cards (order: approved revenue, pending money, medicines, banners) ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)}</div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-8 text-center">
                    <FiAlertCircle className="text-2xl text-rose-500" />
                    <p className="text-sm font-semibold text-base-content">Could not load your dashboard.</p>
                    <button onClick={() => refetch()} className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700">Try again</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total Sales Revenue" value={money(stats.totalRevenue)} icon={<FiActivity />} tone="green"
                        badge={<><FiCheckCircle /> {stats.paidCount === 0 ? "No approved sales yet" : `${plural(stats.paidCount, "approved sale", "approved sales")}`}</>}
                    />
                    <StatCard
                        label="Pending Sales" value={money(stats.pendingRevenue)} icon={<FiClock />} tone="amber"
                        badge={stats.pendingCount === 0 ? "Nothing waiting for approval" : `${stats.pendingCount} awaiting admin approval`}
                    />
                    <StatCard
                        label="Medicines Listed" value={stats.medicinesListed} icon={<FaPills />} tone="blue"
                        badge={stats.medicinesListed === 0 ? "Add your first medicine" : `${stats.totalStock} units in stock`}
                    />
                    <StatCard
                        label="Banner Requests" value={stats.bannerRequests} icon={<FaAd />} tone="purple"
                        badge={stats.bannerRequests === 0 ? "No requests yet" : `${stats.bannersAccepted} accepted • ${stats.bannersPending} pending`}
                    />
                </div>
            )}

            {/* ── Sales & revenue report ── */}
            <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-base-content">Sales &amp; Revenue Breakdown Report</h2>
                    <p className="text-xs text-base-content/60">Medicines bought by customers, one record per medicine per order.</p>
                </div>
                <button onClick={handleExport} disabled={isLoading || isError} className="inline-flex items-center gap-2 rounded-xl border border-base-content/15 bg-base-100 px-4 py-2 text-xs font-semibold text-base-content hover:bg-base-200 disabled:opacity-50"><FiDownload /> Export CSV</button>
            </div>

            {isLoading ? (
                <div className="flex justify-center rounded-2xl border border-base-content/10 bg-base-100 py-14"><span className="loading loading-bars loading-lg" /></div>
            ) : isError ? null : isNewSeller ? (
                /* brand-new seller: friendly onboarding instead of an empty table */
                <div className="rounded-2xl border border-dashed border-base-content/20 bg-base-100 px-4 py-12 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-teal-600 [[data-theme=dark]_&]:bg-emerald-500/15"><FiPackage /></span>
                    <p className="mt-4 text-lg font-bold text-base-content">Welcome to your seller dashboard!</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-base-content/60">You haven&apos;t listed any medicines yet. Add your first medicine and your sales will appear here as soon as customers start buying.</p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link to="/dashboard/manage-medicines" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 sm:w-auto"><FiPlus /> Add Your First Medicine</Link>
                        <Link to="/dashboard/requestBanner" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-base-content/15 px-5 py-2.5 text-sm font-semibold text-base-content hover:bg-base-200 sm:w-auto"><FaAd /> Request a Banner</Link>
                    </div>
                </div>
            ) : sales.length === 0 ? (
                /* has medicines but nobody bought yet */
                <div className="rounded-2xl border border-dashed border-base-content/20 bg-base-100 px-4 py-12 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-teal-600 [[data-theme=dark]_&]:bg-emerald-500/15"><FiActivity /></span>
                    <p className="mt-3 font-semibold text-base-content">No sales yet</p>
                    <p className="mt-1 text-xs text-base-content/60">When customers buy your medicines, every order will show up here.</p>
                </div>
            ) : (
                <>
                    {/* Desktop / tablet table */}
                    <div className="hidden overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="bg-teal-600 text-left text-xs font-bold uppercase tracking-wider text-white">
                                        <th className="w-12 px-4 py-3">#</th>
                                        <th className="px-4 py-3">Order</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Medicine Item</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Units Sold</th>
                                        <th className="px-4 py-3">Unit Price</th>
                                        <th className="px-4 py-3">Total Revenue</th>
                                        <th className="px-4 py-3 text-right">Fulfillment Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-base-content/10">
                                    {shown.map((r, i) => (
                                        <tr key={r.key} className="transition-colors hover:bg-base-200/50">
                                            <td className="px-4 py-3 text-xs text-base-content/50">{i + 1}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-base-content/70">#{r.orderRef}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-base-content/70">{fmtDate(r.date)}</td>
                                            <td className="px-4 py-3 font-semibold text-base-content">{r.name}</td>
                                            <td className="px-4 py-3"><span className="cm-chip cm-tone-slate">{r.category}</span></td>
                                            <td className="px-4 py-3 text-base-content/80">{plural(r.quantity, "unit", "units")}</td>
                                            <td className="px-4 py-3 text-base-content/60">{money(r.unitPrice)}</td>
                                            <td className="px-4 py-3 font-bold text-teal-700 [[data-theme=dark]_&]:text-teal-300">{money(r.total)}</td>
                                            <td className="px-4 py-3 text-right"><StatusChip status={r.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Phone cards */}
                    <div className="space-y-3 md:hidden">
                        {shown.map((r) => (
                            <div key={r.key} className="rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="break-words font-bold text-base-content">{r.name}</p>
                                        <p className="mt-0.5 text-xs text-base-content/60">Order #{r.orderRef} • {fmtDate(r.date)}</p>
                                    </div>
                                    <StatusChip status={r.status} />
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-base-content/10 pt-3 text-xs">
                                    <span className="cm-chip cm-tone-slate">{r.category}</span>
                                    <span className="text-base-content/60">{plural(r.quantity, "unit", "units")} × {money(r.unitPrice)}</span>
                                    <span className="text-sm font-bold text-teal-700 [[data-theme=dark]_&]:text-teal-300">{money(r.total)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Show more (only when there are more rows) */}
                    <div className="mt-4 flex flex-col items-center gap-2">
                        <p className="text-xs text-base-content/50">Showing {shown.length} of {sales.length} records</p>
                        {visible < sales.length && (
                            <button onClick={() => setVisible((v) => v + PAGE_STEP)} className="rounded-xl border border-base-content/15 bg-base-100 px-5 py-2 text-xs font-semibold text-base-content hover:bg-base-200">Show more</button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SellerHome;