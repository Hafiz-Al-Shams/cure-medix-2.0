import { useQuery } from "@tanstack/react-query";
// import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaArrowAltCircleLeft, FaDollarSign, FaPills, FaUsers } from "react-icons/fa";
import Swal from "sweetalert2";
// import useAxiosPublic from "../../hooks/useAxiosPublic";






const AdminHome = () => {
    // const { user } = useAuth();
    // const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const { data: stats = {} } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin-stats');
            return res.data;
        }
    });


    // Fetch banner requests
    const { data: banners = [], refetch: refetchBanners } = useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
            const res = await axiosSecure.get('/banners');
            return res.data;
        }
    });

    // Function to handle banner status toggle
    const handleToggleBannerStatus = async (bannerId, currentStatus) => {
        console.log(currentStatus);
        const newStatus = !currentStatus;
        try {
            await axiosSecure.patch(`/banners/${bannerId}`, { isBanner: newStatus });
            refetchBanners(); // Refresh the banner list
            Swal.fire({
                position: "center",
                icon: "success",
                title: `Banner status updated to ${newStatus ? "Accepted" : "Pending"}`,
                showConfirmButton: false,
                timer: 1000,
            });
        } catch (error) {
            console.error("Error updating banner:", error);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Failed to update banner",
                showConfirmButton: false,
                timer: 1000,
            });
        }
        console.log(newStatus);
    };


    // Format number to 2 decimal places safely
    const fmt = (val) => {
        if (val === undefined || val === null || isNaN(val)) return '0.00';
        return Number(val).toFixed(2);
    };

    const handleDeleteBanner = async (bannerId) => {
        try {
            await axiosSecure.delete(`/banners/${bannerId}`);
            refetchBanners(); // Refresh the banner list
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Banner deleted permanently",
                showConfirmButton: false,
                timer: 1000,
            });
        } catch (error) {
            console.error("Error deleting banner:", error);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Failed to delete banner",
                showConfirmButton: false,
                timer: 1000,
            });
        }
    };


    console.log(stats.totalPaid);
    console.log(stats.totalPending);
    console.log(stats.revenue);

    return (
        <div className="">
            <h2 className="text-4xl font-semibold my-10">
                <span>Welcome Home Admin</span>
            </h2>

            {/* ── Stats Section ── */}
            <style>{`
            .stat-card {
                background: white;
                border: 0.5px solid rgba(0,0,0,0.08);
                border-radius: 12px;
                padding: 1.1rem 1.2rem 1rem;
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .dark .stat-card {
                background: rgba(255,255,255,0.04);
                border-color: rgba(255,255,255,0.08);
            }
            .stat-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 3px;
                background: var(--card-accent, #57CEA7);
            }
            .stat-icon {
                width: 34px; height: 34px;
                border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
                font-size: 15px;
                margin-bottom: 4px;
            }
            .stat-label {
                font-size: 11px;
                color: #6b7280;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                font-weight: 500;
            }
            .stat-value {
                font-size: 22px;
                font-weight: 600;
                color: inherit;
                line-height: 1.2;
            }
            .stat-badge {
                display: inline-block;
                font-size: 10px;
                font-weight: 500;
                padding: 2px 8px;
                border-radius: 20px;
                margin-top: 4px;
            }
            .section-sep {
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #9ca3af;
                padding-bottom: 0.5rem;
                border-bottom: 0.5px solid rgba(0,0,0,0.08);
                margin-bottom: 0.75rem;
            }
            .dark .section-sep { border-color: rgba(255,255,255,0.08); }
        `}</style>

            {/* Row 1 — Overview */}
            <p className="section-sep">Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

                {/* Revenue */}
                <div className="stat-card" style={{ '--card-accent': '#57CEA7' }}>
                    <div className="stat-icon" style={{ background: '#e6f9f3', color: '#0f6e56' }}>
                        <FaDollarSign />
                    </div>
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">${fmt(stats.revenue)}</div>
                    <span className="stat-badge" style={{ background: '#e6f9f3', color: '#0f6e56' }}>
                        ↑ All time
                    </span>
                </div>

                {/* Users */}
                <div className="stat-card" style={{ '--card-accent': '#378ADD' }}>
                    <div className="stat-icon" style={{ background: '#E6F1FB', color: '#185FA5' }}>
                        <FaUsers />
                    </div>
                    <div className="stat-label">Users</div>
                    <div className="stat-value">{stats.users}</div>
                    <span className="stat-badge" style={{ background: '#E6F1FB', color: '#185FA5' }}>
                        Registered
                    </span>
                </div>

                {/* Medicines */}
                <div className="stat-card" style={{ '--card-accent': '#EF9F27' }}>
                    <div className="stat-icon" style={{ background: '#FAEEDA', color: '#633806' }}>
                        <FaPills />
                    </div>
                    <div className="stat-label">Medicines</div>
                    <div className="stat-value">{stats.medicines}</div>
                    <span className="stat-badge" style={{ background: '#FAEEDA', color: '#633806' }}>
                        In catalogue
                    </span>
                </div>

                {/* Orders */}
                <div className="stat-card" style={{ '--card-accent': '#7F77DD' }}>
                    <div className="stat-icon" style={{ background: '#EEEDFE', color: '#3C3489' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            className="w-4 h-4 stroke-current" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                    </div>
                    <div className="stat-label">Orders</div>
                    <div className="stat-value">{stats.orders}</div>
                    <span className="stat-badge" style={{ background: '#EEEDFE', color: '#3C3489' }}>
                        Total placed
                    </span>
                </div>
            </div>

            {/* Row 2 — Financials */}
            <p className="section-sep">Financials</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">

                {/* Pending */}
                <div className="stat-card" style={{ '--card-accent': '#E24B4A' }}>
                    <div className="stat-icon" style={{ background: '#FCEBEB', color: '#A32D2D' }}>
                        <FaDollarSign />
                    </div>
                    <div className="stat-label">Total Pending</div>
                    <div className="stat-value">${fmt(stats.totalPending)}</div>
                    <span className="stat-badge" style={{ background: '#FAEEDA', color: '#633806' }}>
                        ● Awaiting payment
                    </span>
                </div>

                {/* Paid */}
                <div className="stat-card" style={{ '--card-accent': '#57CEA7' }}>
                    <div className="stat-icon" style={{ background: '#e6f9f3', color: '#0f6e56' }}>
                        <FaDollarSign />
                    </div>
                    <div className="stat-label">Total Paid</div>
                    <div className="stat-value">${fmt(stats.totalPaid)}</div>
                    <span className="stat-badge" style={{ background: '#e6f9f3', color: '#0f6e56' }}>
                        ✓ Collected
                    </span>
                </div>

                {/* Collection Rate */}
                <div className="stat-card" style={{
                    '--card-accent': '#57CEA7',
                    background: '#e6f9f3',
                    border: '0.5px solid #9FE1CB'
                }}>
                    <div className="stat-label" style={{ color: '#085041' }}>Collection Rate</div>
                    <div className="stat-value" style={{ color: '#085041', fontSize: '26px' }}>
                        {stats.revenue > 0
                            ? `${((stats.totalPaid / stats.revenue) * 100).toFixed(1)}%`
                            : '0%'
                        }
                    </div>
                    {/* Progress bar */}
                    <div style={{
                        background: '#c2ede0', borderRadius: '999px',
                        height: '6px', overflow: 'hidden', marginTop: '4px'
                    }}>
                        <div style={{
                            width: stats.revenue > 0
                                ? `${Math.min((stats.totalPaid / stats.revenue) * 100, 100)}%`
                                : '0%',
                            height: '100%',
                            background: '#0f6e56',
                            borderRadius: '999px',
                            transition: 'width 0.6s ease'
                        }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#0f6e56', marginTop: '6px' }}>
                        ${fmt(stats.totalPaid)} of ${fmt(stats.revenue)} collected
                    </div>
                </div>
            </div>

            {/* ── Banner Requests Section ── */}
            <div className="my-10">
                <h2 className="text-2xl font-semibold mb-6">Banner Requests</h2>
                {banners.length === 0 ? (
                    <p className="text-gray-500">No banner requests available.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
                        {banners.map((banner) => (
                            <div
                                key={banner._id}
                                className="card bg-base-100 shadow-xl transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-2xl"
                            >
                                <figure className="w-full h-40 overflow-hidden rounded-t-lg">
                                    <img
                                        src={banner.image}
                                        alt="Banner"
                                        className="object-cover w-full h-full"
                                    />
                                </figure>
                                <div className="card-body">
                                    <p className="text-base-content/90">
                                        Status: {banner.isBanner ? (
                                            <span className="text-green-600 font-semibold">Accepted</span>
                                        ) : (
                                            <span className="text-yellow-600 font-semibold">Pending</span>
                                        )}
                                    </p>
                                    <div className="card-actions justify-end mt-2">
                                        <button
                                            onClick={() => handleToggleBannerStatus(banner._id, banner.isBanner)}
                                            className={`btn btn-sm ${banner.isBanner ? "bg-gray-500/70 text-white" : "bg-green-600 text-white"}`}
                                        >
                                            {banner.isBanner ? "Remove Banner" : "Make Banner"}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBanner(banner._id)}
                                            className="btn btn-sm bg-red-500/85 text-white ml-2"
                                        >
                                            Delete it!
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHome;