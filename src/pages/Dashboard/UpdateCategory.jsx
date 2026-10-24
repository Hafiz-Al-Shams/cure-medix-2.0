// 📁 PATH: src/pages/Dashboard/UpdateCategory.jsx  (MODIFIED existing file – replace the whole file)
import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { successAlert, errorAlert, infoAlert } from "../../utils/adminAlerts";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const UpdateCategory = () => {
    const { name, details, image, _id } = useLoaderData();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            // New image is optional now: if none is chosen, the current image is kept
            let imageUrl = image;
            if (data.image && data.image[0]) {
                const res = await axiosPublic.post(image_hosting_api, { image: data.image[0] }, { headers: { "content-type": "multipart/form-data" } });
                if (!res.data.success) throw new Error("Image upload failed");
                imageUrl = res.data.data.display_url;
            }

            const updatedCategory = { name: data.name, image: imageUrl, details: data.details };
            const cateUpdateRes = await axiosSecure.patch(`/categories/${_id}`, updatedCategory);

            if (cateUpdateRes.data.modifiedCount > 0) {
                await axiosSecure.patch(`/categoryImages/${name}`, { imageUrl });
                successAlert("Category updated", `${data.name} has been updated.`);
                navigate("/dashboard/allCategories");
            } else {
                infoAlert("No changes made", "Edit something first, then update the category.");
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not update category", "Please check the details and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Helmet><title>CureMedix | Update Category</title></Helmet>
            <AdminPageHeader title="Update Category" subtitle={`Editing “${name}” – change its name, details or image.`} />

            <div className="mx-auto max-w-2xl rounded-3xl border border-base-content/10 bg-base-100 p-5 shadow-sm sm:p-7">
                {/* Current image */}
                <div className="mb-6 flex items-center gap-4">
                    <img src={image} alt={name} className="h-16 w-16 rounded-2xl bg-base-200 object-cover" />
                    <div>
                        <p className="text-xs text-base-content/50">Current category</p>
                        <p className="text-lg font-bold text-base-content">{name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-base-content/70">Category Name*</label>
                        <input defaultValue={name} type="text" {...register("name", { required: "Category Name is required" })} className="input input-bordered w-full border-base-content/15 bg-base-100" />
                        {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-base-content/70">Category Details*</label>
                        <textarea defaultValue={details} {...register("details", { required: "Details are required" })} className="textarea textarea-bordered h-28 w-full border-base-content/15 bg-base-100" />
                        {errors.details && <p className="mt-1 text-xs text-rose-500">{errors.details.message}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-base-content/70">New Image <span className="font-normal text-base-content/50">(optional – leave empty to keep the current one)</span></label>
                        <input type="file" accept="image/*" {...register("image")} className="file-input file-input-bordered w-full border-base-content/15 bg-base-100" />
                    </div>
                    <div className="flex flex-col-reverse gap-3 border-t border-base-content/10 pt-4 sm:flex-row sm:justify-end">
                        <button type="button" onClick={() => navigate("/dashboard/allCategories")} className="rounded-xl border border-base-content/20 px-5 py-2.5 text-sm font-semibold text-base-content hover:bg-base-200">Cancel</button>
                        <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{submitting ? "Updating..." : "Update Category"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateCategory;