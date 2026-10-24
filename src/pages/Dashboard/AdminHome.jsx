// 📁 PATH: src/pages/Dashboard/AdminHome.jsx  (MODIFIED existing file – replace the whole file)
import { useQuery } from "@tanstack/react-query";
import { FaBoxOpen, FaDollarSign, FaPills, FaUsers } from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { confirmAction, successAlert, errorAlert } from "../../utils/adminAlerts";

// Money like $190.90
const money = (val) => {
    const n = Number(val);
    return `$${(Number.isFinite(n) ? n : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// One overview card (label, big value, icon top-right, small badge)
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

const AdminHome = () => {
    const axiosSecure = useAxiosSecure();

    // Real stats from your server (unchanged)
    const { data: stats = {} } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => (await axiosSecure.get("/admin-stats")).data,
    });

    // Real banner requests from your server (unchanged)
    const { data: banners = [], refetch: refetchBanners } = useQuery({
        queryKey: ["banners"],
        queryFn: async () => (await axiosSecure.get("/banners")).data,
    });

    const handleToggleBannerStatus = async (bannerId, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            await axiosSecure.patch(`/banners/${bannerId}`, { isBanner: newStatus });
            refetchBanners();
            successAlert("Banner updated", `Banner status changed to ${newStatus ? "Accepted" : "Pending"}.`);
        } catch (error) {
            console.error("Error updating banner:", error);
            errorAlert("Failed to update banner", "Please try again in a moment.");
        }
    };

    const handleDeleteBanner = async (bannerId) => {
        const ok = await confirmAction({
            title: "Delete this banner?",
            text: "This banner request will be removed permanently.",
            confirmText: "Yes, delete it",
            danger: true,
        });
        if (!ok) return;
        try {
            await axiosSecure.delete(`/banners/${bannerId}`);
            refetchBanners();
            successAlert("Banner deleted", "The banner has been removed permanently.");
        } catch (error) {
            console.error("Error deleting banner:", error);
            errorAlert("Failed to delete banner", "Please try again in a moment.");
        }
    };

    // Collection rate = paid / revenue
    const rate = stats.revenue > 0 ? Math.min((stats.totalPaid / stats.revenue) * 100, 100) : 0;

    return (
        <div>
            <Helmet><title>CureMedix | Admin Home</title></Helmet>
            <AdminPageHeader title="Welcome Home Admin" subtitle="System metrics, financial overview, and website banner requests." />

            {/* ── Overview ── */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">Overview</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Revenue" value={money(stats.revenue)} icon={<FaDollarSign />} tone="green" badge={<><FiTrendingUp /> All time total</>} />
                <StatCard label="Registered Users" value={stats.users ?? 0} icon={<FaUsers />} tone="blue" badge="Registered accounts" />
                <StatCard label="Medicines" value={stats.medicines ?? 0} icon={<FaPills />} tone="amber" badge="In active catalogue" />
                <StatCard label="Orders Placed" value={stats.orders ?? 0} icon={<FaBoxOpen />} tone="purple" badge="Total processed" />
            </div>

            {/* ── Financials ── */}
            <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-base-content/50">Financials</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Total Pending</p>
                    <p className="mt-3 text-3xl font-bold text-amber-600 [[data-theme=dark]_&]:text-amber-400">{money(stats.totalPending)}</p>
                    <p className="mt-2 text-xs text-base-content/60">Awaiting verification or clearance</p>
                </div>
                <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Total Paid</p>
                    <p className="mt-3 text-3xl font-bold text-emerald-600 [[data-theme=dark]_&]:text-emerald-400">{money(stats.totalPaid)}</p>
                    <p className="mt-2 text-xs text-base-content/60">Collected and processed payments</p>
                </div>
                <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Collection Rate</p>
                    <p className="mt-3 text-3xl font-bold text-base-content">{rate.toFixed(1)}%</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-base-content/10">
                        <div className="h-full rounded-full bg-teal-500 transition-all duration-700" style={{ width: `${rate}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-base-content/60">{money(stats.totalPaid)} of {money(stats.revenue)} collected</p>
                </div>
            </div>

            {/* ── Banner requests (your real banner images) ── */}
            <h2 className="mb-4 mt-10 text-xl font-bold text-base-content">Banner Requests</h2>
            {banners.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-base-content/20 py-10 text-center text-sm text-base-content/60">No banner requests available.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {banners.map((banner) => (
                        <div key={banner._id} className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
                            <div className="relative h-40 bg-base-200">
                                <img src={banner.image} alt="Banner" className="h-full w-full object-cover" />
                                <span className={`absolute right-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${banner.isBanner ? "bg-emerald-500" : "bg-amber-500"}`}>
                                    {banner.isBanner ? "Accepted" : "Pending"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 p-3">
                                <button
                                    onClick={() => handleToggleBannerStatus(banner._id, banner.isBanner)}
                                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${banner.isBanner ? "cm-tone-slate hover:brightness-95" : "bg-teal-600 text-white hover:bg-teal-700"}`}
                                >
                                    {banner.isBanner ? "Remove Banner" : "Make Banner"}
                                </button>
                                <button onClick={() => handleDeleteBanner(banner._id)} className="cm-tone-red rounded-lg px-3 py-2 text-xs font-bold hover:brightness-95">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminHome;