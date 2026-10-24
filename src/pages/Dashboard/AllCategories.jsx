// 📁 PATH: src/pages/Dashboard/AllCategories.jsx  (MODIFIED existing file – replace the whole file)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { FiPlus, FiX } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import AdminPageHeader from "../../components/AdminPageHeader";
import { confirmAction, successAlert, errorAlert } from "../../utils/adminAlerts";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const AllCategories = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // queryKey fixed: it used to be ['users'], which clashed with the All Users page cache
    const { data: categories = [], refetch } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => (await axiosSecure.get("/categories")).data,
    });

    const closeModal = () => {
        reset();
        setIsModalOpen(false);
    };

    // Add category (same upload + 2 API calls as before)
    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const imageFile = { image: data.image[0] };
            const res = await axiosPublic.post(image_hosting_api, imageFile, { headers: { "content-type": "multipart/form-data" } });
            if (res.data.success) {
                const newCategory = { name: data.name, count: 0, image: res.data.data.display_url, details: data.details };
                const categoryRes = await axiosSecure.post("/categories", newCategory);
                if (categoryRes.data.insertedId) {
                    await axiosSecure.post("/categoryImages", { categoryName: data.name, imageUrl: res.data.data.display_url });
                    closeModal();
                    refetch();
                    successAlert("Category added", `${data.name} is added to the categories.`);
                }
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not add category", "Please check the details and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Confirm → delete → success modal
    const handleDelete = async (category) => {
        const ok = await confirmAction({
            title: "Delete this category?",
            text: `${category.name} will be removed permanently. You won't be able to revert this.`,
            confirmText: "Yes, delete it",
            danger: true,
        });
        if (!ok) return;
        try {
            const res = await axiosSecure.delete(`/categories/${category._id}`);
            if (res.data.deletedCount > 0) {
                refetch();
                successAlert("Category deleted", `${category.name} has been deleted.`);
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not delete category", "Please try again in a moment.");
        }
    };

    return (
        <div>
            <Helmet><title>CureMedix | All Categories</title></Helmet>
            <AdminPageHeader title="Medicine Categories" subtitle="Add, update, or reorganize medicine categories across the shop." />

            {/* Title card + Add button */}
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm sm:p-5">
                <div className="min-w-0">
                    <h2 className="font-bold text-base-content">Medicine Categories</h2>
                    <p className="text-xs text-base-content/60">Organize and manage medicine taxonomy</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700">
                    <FiPlus /> <span className="hidden sm:inline">Add</span> Category
                </button>
            </div>

            {categories.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-base-content/20 py-12 text-center text-sm text-base-content/60">No categories yet. Add your first one.</p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                            <thead>
                                <tr className="bg-teal-600 text-left text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="w-14 px-4 py-3">No.</th>
                                    <th className="px-4 py-3">Image</th>
                                    <th className="px-4 py-3">Category Name</th>
                                    <th className="px-4 py-3">Medicines Available</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/10">
                                {categories.map((category, i) => (
                                    <tr key={category._id || i} className="transition-colors hover:bg-base-200/50">
                                        <td className="px-4 py-3 text-xs text-base-content/50">{i + 1}</td>
                                        <td className="px-4 py-3"><img src={category.image} alt={category.name} className="h-10 w-10 rounded-xl object-cover" /></td>
                                        <td className="px-4 py-3 font-semibold text-base-content">{category.name}</td>
                                        <td className="px-4 py-3"><span className="cm-chip cm-tone-slate">{category.count ?? 0} item(s)</span></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <NavLink to={`/dashboard/updateCategory/${category._id}`} className="cm-chip cm-chip-btn cm-tone-blue">Update</NavLink>
                                                <button onClick={() => handleDelete(category)} aria-label={`Delete ${category.name}`} className="rounded-lg p-2 text-base-content/40 transition-colors hover:bg-rose-500/10 hover:text-rose-500"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Add category popup (theme + dark/light adaptive) ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
                    <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-base-content/10 bg-base-100 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} aria-label="Close" className="absolute right-5 top-5 text-xl text-base-content/50 hover:text-base-content"><FiX /></button>
                        <h3 className="text-xl font-bold text-base-content">Add New Category</h3>
                        <p className="mb-5 mt-0.5 text-xs text-base-content/60">Create a category with an image and a short description.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-base-content/70">Category Name*</label>
                                <input type="text" placeholder="Category Name" {...register("name", { required: "Category Name is required" })} className="input input-bordered w-full border-base-content/15 bg-base-100" />
                                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-base-content/70">Category Details*</label>
                                <textarea placeholder="Details" {...register("details", { required: "Details are required" })} className="textarea textarea-bordered h-24 w-full border-base-content/15 bg-base-100" />
                                {errors.details && <p className="mt-1 text-xs text-rose-500">{errors.details.message}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-base-content/70">Upload Image*</label>
                                <input type="file" accept="image/*" {...register("image", { required: "Image is required" })} className="file-input file-input-bordered w-full border-base-content/15 bg-base-100" />
                                {errors.image && <p className="mt-1 text-xs text-rose-500">{errors.image.message}</p>}
                            </div>
                            <div className="flex justify-end gap-3 border-t border-base-content/10 pt-4">
                                <button type="button" onClick={closeModal} className="rounded-xl border border-base-content/20 px-5 py-2 text-sm font-semibold text-base-content hover:bg-base-200">Cancel</button>
                                <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{submitting ? "Adding..." : "Add Category"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllCategories;