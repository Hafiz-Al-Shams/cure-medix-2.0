// 📁 PATH: src/pages/Dashboard/RequestBanner.jsx  (NEW file)
// Seller banner request page: your real "choose image" upload + your real submitted requests.
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { FaBullhorn } from "react-icons/fa";
import { FiSend, FiCalendar } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import AdminPageHeader from "../../components/AdminPageHeader";
import { confirmAction, successAlert, errorAlert, infoAlert } from "../../utils/adminAlerts";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const RequestBanner = () => {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);

    // This seller's own banner requests (same endpoint as before)
    const { data: banners = [], refetch } = useQuery({
        queryKey: ["seller-banners", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosPublic.get(`/banners/seller/${user.email}`)).data,
    });

    // Upload image → save request (same 2 calls as your old code)
    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const res = await axiosPublic.post(image_hosting_api, { image: data.image[0] }, { headers: { "content-type": "multipart/form-data" } });
            if (!res.data.success) {
                errorAlert("Failed to upload image", "Please try a different image.");
                return;
            }
            const bannerRequest = {
                title: data.title, // NEW field
                image: res.data.data.display_url,
                reason: data.reason,
                isBanner: false, // admin changes this later
                seller: user.email,
                createdAt: new Date().toISOString(), // NEW field (shown on the card)
            };
            const requestRes = await axiosPublic.post("/banners", bannerRequest);
            if (requestRes.data.insertedId) {
                reset();
                refetch();
                successAlert("Request submitted", "Your banner request was sent to the admin for review.");
            } else {
                errorAlert("Failed to submit banner request", "Please try again.");
            }
        } catch (err) {
            console.error(err);
            errorAlert("Failed to submit banner request", "Please try again in a moment.");
        } finally {
            setSubmitting(false);
        }
    };

    // Cancel is STATIC for now (no seller delete endpoint yet): confirmation only
    const handleCancel = async () => {
        const ok = await confirmAction({
            title: "Cancel this request?",
            text: "Your banner request will be withdrawn.",
            confirmText: "Yes, cancel it",
            danger: true,
        });
        if (ok) infoAlert("Not connected yet", "Cancelling requests isn't connected yet, so nothing was removed.");
    };

    const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);

    return (
        <div>
            <Helmet><title>CureMedix | Request Banner</title></Helmet>
            <AdminPageHeader title="Manage / Request Banner" subtitle="Submit custom banner requests to admin and monitor approval status." roleLabel="Verified Seller" />

            {/* Request form */}
            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-base-content/10 pb-4">
                    <div className="min-w-0">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-base-content"><FaBullhorn className="text-teal-600" /> Request Homepage Banner Promotion</h2>
                        <p className="mt-0.5 text-xs text-base-content/60">Submit custom banner promotional campaigns to CureMedix Admin for review.</p>
                    </div>
                    <span className="cm-chip cm-tone-green border border-emerald-500/30 !px-3 !py-1 text-xs">Admin Review Required</span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-base-content/80">Campaign Title*</label>
                        <input type="text" placeholder="e.g., Summer Medical Discount 20%" {...register("title", { required: "Campaign title is required" })} className="input input-bordered w-full border-base-content/15 bg-base-100" />
                        {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-base-content/80">Choose Banner Image*</label>
                        <input type="file" accept="image/*" {...register("image", { required: "Image is required" })} className="file-input file-input-bordered w-full border-base-content/15 bg-base-100" />
                        {errors.image && <p className="mt-1 text-xs text-rose-500">{errors.image.message}</p>}
                    </div>
                </div>

                <div className="mt-5">
                    <label className="mb-1 block text-xs font-semibold text-base-content/80">Promotion Description / Notes*</label>
                    <textarea placeholder="Describe the medicine highlights or special discount code for this banner..." {...register("reason", { required: "Reason is required" })} className="textarea textarea-bordered h-24 w-full border-base-content/15 bg-base-100" />
                    {errors.reason && <p className="mt-1 text-xs text-rose-500">{errors.reason.message}</p>}
                </div>

                <div className="mt-5 flex justify-end">
                    <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/25 transition-colors hover:bg-teal-700 disabled:opacity-60 sm:w-auto">
                        <FiSend /> {submitting ? "Submitting..." : "Submit Banner Request"}
                    </button>
                </div>
            </form>

            {/* Submitted requests (real data) */}
            <h2 className="mb-4 mt-8 text-lg font-bold text-base-content">Your Submitted Banner Requests</h2>
            {banners.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-base-content/20 py-10 text-center text-sm text-base-content/60">No banner requests yet.</p>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {banners.map((banner) => (
                        <div key={banner._id} className="flex flex-col overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
                            <div className="relative h-40 bg-base-200">
                                <img src={banner.image} alt={banner.title || "Banner"} className="h-full w-full object-cover" />
                                <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${banner.isBanner ? "bg-emerald-500" : "bg-amber-500"}`}>{banner.isBanner ? "Accepted" : "Pending"}</span>
                            </div>
                            <div className="flex-1 p-4">
                                <h3 className="font-bold text-base-content">{banner.title || "Banner request"}</h3>
                                <p className="mt-1 text-xs text-base-content/70">{banner.reason}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-base-content/10 px-4 py-2.5 text-xs">
                                <span className="flex items-center gap-1.5 text-base-content/50">{fmtDate(banner.createdAt) && <><FiCalendar /> {fmtDate(banner.createdAt)}</>}</span>
                                {!banner.isBanner && <button onClick={handleCancel} className="font-bold text-rose-500 hover:text-rose-600">Cancel Request</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestBanner;