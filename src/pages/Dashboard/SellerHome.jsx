// 📁 PATH: src/pages/Dashboard/SellerHome.jsx  (MODIFIED existing file – replace the whole file)
// All numbers + report rows on this page are STATIC placeholders for now (no real sales data yet).
// The banner-request form that used to be here now lives in RequestBanner.jsx.
import { FaBoxes, FaPills, FaAd } from "react-icons/fa";
import { FiTrendingUp, FiDownload, FiActivity } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import AdminPageHeader from "../../components/AdminPageHeader";
import { successAlert } from "../../utils/adminAlerts";

// ── static demo data (replace with real API data later) ──
const salesRows = [
    { name: "Esomeprazole", category: "Capsule", units: 42, price: 3.2, status: "Fulfilled" },
    { name: "Clopidogrel", category: "Tablet", units: 20, price: 7.0, status: "Fulfilled" },
    { name: "Insulin Glargine", category: "Injection", units: 12, price: 12.0, status: "Processing" },
    { name: "Prednisone", category: "Tablet", units: 18, price: 5.5, status: "Fulfilled" },
    { name: "Montelukast", category: "Tablet", units: 35, price: 2.7, status: "Fulfilled" },
];

const StatCard = ({ label, value, icon, tone, badge }) => (
    <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">{label}</p>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm cm-tone-${tone}`}>{icon}</span>
        </div>
        <p className="mt-4 text-3xl font-bold text-base-content">{value}</p>
        <span className={`cm-chip mt-3 cm-tone-${tone}`}>{badge}</span>
    </div>
);

const SellerHome = () => {
    // Export CSV: downloads the rows shown in the table
    const handleExport = () => {
        const header = ["#", "Medicine Item", "Category", "Units Sold", "Unit Price", "Total Revenue", "Fulfillment Status"];
        const rows = salesRows.map((r, i) => [i + 1, r.name, r.category, r.units, r.price.toFixed(2), (r.units * r.price).toFixed(2), r.status]);
        const csv = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "sales-report.csv";
        a.click();
        URL.revokeObjectURL(url);
        successAlert("Report exported", "Your sales report CSV has been downloaded.");
    };

    return (
        <div>
            <Helmet><title>CureMedix | Seller Home</title></Helmet>
            <AdminPageHeader title="Welcome Home Seller" subtitle="Sales performance analytics, order breakdowns, and store statistics." roleLabel="Verified Seller" />

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">Seller Metrics</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Sales Revenue" value="$428.50" icon={<FiActivity />} tone="green" badge={<><FiTrendingUp /> +14.2% this month</>} />
                <StatCard label="Medicines Listed" value="8 Active" icon={<FaPills />} tone="blue" badge="Catalogue synchronized" />
                <StatCard label="Banner Status" value="1 Request" icon={<FaAd />} tone="amber" badge="Status: Pending Admin" />
                <StatCard label="Inventory Health" value="563 Units" icon={<FaBoxes />} tone="purple" badge="2 Items low stock" />
            </div>

            {/* Sales & revenue report */}
            <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-base-content">Sales &amp; Revenue Breakdown Report</h2>
                    <p className="text-xs text-base-content/60">Detailed record of item sales, units fulfilled, and net earnings.</p>
                </div>
                <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-base-content/15 bg-base-100 px-4 py-2 text-xs font-semibold text-base-content hover:bg-base-200"><FiDownload /> Export CSV</button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="bg-teal-600 text-left text-xs font-bold uppercase tracking-wider text-white">
                                <th className="w-12 px-4 py-3">#</th>
                                <th className="px-4 py-3">Medicine Item</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Units Sold</th>
                                <th className="px-4 py-3">Unit Price</th>
                                <th className="px-4 py-3">Total Revenue</th>
                                <th className="px-4 py-3 text-right">Fulfillment Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-content/10">
                            {salesRows.map((r, i) => (
                                <tr key={r.name} className="transition-colors hover:bg-base-200/50">
                                    <td className="px-4 py-3 text-xs text-base-content/50">{i + 1}</td>
                                    <td className="px-4 py-3 font-semibold text-base-content">{r.name}</td>
                                    <td className="px-4 py-3"><span className="cm-chip cm-tone-slate">{r.category}</span></td>
                                    <td className="px-4 py-3 text-base-content/80">{r.units} units</td>
                                    <td className="px-4 py-3 text-base-content/60">${r.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 font-bold text-teal-700 [[data-theme=dark]_&]:text-teal-300">${(r.units * r.price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right"><span className={`cm-chip ${r.status === "Fulfilled" ? "cm-tone-green" : "cm-tone-amber"}`}>{r.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerHome;