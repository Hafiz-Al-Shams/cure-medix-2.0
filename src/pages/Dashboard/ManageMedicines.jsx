// 📁 PATH: src/pages/Dashboard/ManageMedicines.jsx  (MODIFIED existing file – replace the whole file)
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { confirmAction, successAlert, errorAlert, infoAlert } from "../../utils/adminAlerts";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// Label + input wrapper used in the popup
const Field = ({ label, error, children }) => (
    <div>
        <label className="mb-1 block text-xs font-semibold text-base-content/70">{label}</label>
        {children}
        {error && <p className="mt-1 text-xs text-rose-500">{error.message}</p>}
    </div>
);
const inputCls = "input input-bordered w-full border-base-content/15 bg-base-100";
const selectCls = "select select-bordered w-full border-base-content/15 bg-base-100";

const ManageMedicines = () => {
    const { user } = useAuth();
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: { discount: "false", discountPercentage: "0", unit: "Mg", company: "", category: "" } });
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");

    // This seller's medicines (same endpoint as before; key made unique so it can't clash with other pages)
    const { data: medicines = [], refetch } = useQuery({
        queryKey: ["seller-medicines", user?.email],
        enabled: !!user?.email,
        queryFn: async () => (await axiosSecure.get(`/medicines/${user.email}`)).data,
    });

    // Categories for the popup's dropdown (unchanged)
    useEffect(() => {
        fetch("https://cure-medix-server.vercel.app/categories")
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((error) => console.log("Error while fetching categories:", error));
    }, []);

    const hasDiscount = watch("discount") === "true";

    const closeModal = () => {
        reset();
        setIsModalOpen(false);
    };

    // Add medicine (same upload + API calls as before)
    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const res = await axiosPublic.post(image_hosting_api, { image: data.image[0] }, { headers: { "content-type": "multipart/form-data" } });
            if (!res.data.success) {
                errorAlert("Failed to upload image", "Please try a different image.");
                return;
            }
            const discountOn = data.discount === "true";
            const newMedicine = {
                name: data.name,
                description: data.details,
                image: res.data.data.display_url,
                type: data.type,
                price: parseFloat(data.price),
                stock: parseInt(data.stock, 10),
                discount: discountOn, // real true/false (the old dropdown labels were swapped)
                discountPercentage: `${discountOn ? parseInt(data.discountPercentage, 10) : 0}%`,
                category: data.category,
                company: data.company,
                unit: data.unit,
                seller: user.email,
            };
            const medicineRes = await axiosSecure.post("/medicines", newMedicine);
            if (medicineRes.data.insertedId) {
                await axiosSecure.patch(`/categories/addCount/${data.category}`, {});
                closeModal();
                refetch();
                successAlert("Medicine added", `${data.name} is added to your medicines.`);
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not add medicine", "Please check the details and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Update + Delete are STATIC for now (no backend yet)
    const handleUpdate = () => infoAlert("Coming soon", "Updating medicines isn't connected yet.");
    const handleDelete = async (medicine) => {
        const ok = await confirmAction({
            title: "Delete this medicine?",
            text: `${medicine.name} will be removed from your list. You won't be able to revert this.`,
            confirmText: "Yes, delete it",
            danger: true,
        });
        if (ok) infoAlert("Not connected yet", "Deleting isn't connected yet, so nothing was removed.");
    };

    // Client-side search
    const q = search.trim().toLowerCase();
    const filtered = q
        ? medicines.filter((m) => [m.name, m.category, m.type, m.company].some((v) => String(v || "").toLowerCase().includes(q)))
        : medicines;

    const money = (n) => `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2)}`;
    const stockTone = (s) => (Number(s) <= 40 ? "cm-tone-amber" : "cm-tone-green"); // low stock = amber

    const actionBtns = (m) => (
        <div className="flex items-center justify-end gap-2">
            <button onClick={handleUpdate} className="cm-chip cm-chip-btn cm-tone-blue">Update</button>
            <button onClick={() => handleDelete(m)} aria-label={`Delete ${m.name}`} className="rounded-lg p-2 text-base-content/40 transition-colors hover:bg-rose-500/10 hover:text-rose-500"><FaTrash /></button>
        </div>
    );

    return (
        <div>
            <Helmet><title>CureMedix | Manage Medicines</title></Helmet>
            <AdminPageHeader title="Manage All Your Medicines Here" subtitle="Add new medicine listings, modify pricing, or adjust stock levels." roleLabel="Verified Seller" />

            {/* Title + search + add */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h2 className="font-bold text-base-content">Manage All Your Medicines Here</h2>
                    <p className="text-xs text-base-content/60">Add, edit pricing, or adjust stock levels for your pharmacy list.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex w-full items-center gap-2 rounded-xl border border-base-content/15 px-3 py-2 sm:w-64">
                        <FiSearch className="text-base-content/50" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine..." className="grow bg-transparent text-sm outline-none" />
                    </label>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"><FiPlus /> Add Medicine</button>
                </div>
            </div>

            {filtered.length === 0 && (
                <p className="rounded-2xl border border-dashed border-base-content/20 py-12 text-center text-sm text-base-content/60">{q ? `No medicines match “${search}”.` : "No medicines yet. Add your first one."}</p>
            )}

            {/* Desktop / tablet table */}
            {filtered.length > 0 && (
                <div className="hidden overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-sm">
                            <thead>
                                <tr className="bg-teal-600 text-left text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="w-12 px-4 py-3">No.</th>
                                    <th className="px-4 py-3">Image</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3">Company</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/10">
                                {filtered.map((m, i) => (
                                    <tr key={m._id || i} className="transition-colors hover:bg-base-200/50">
                                        <td className="px-4 py-3 text-xs text-base-content/50">{i + 1}</td>
                                        <td className="px-4 py-3"><img src={m.image} alt={m.name} className="h-10 w-10 rounded-xl bg-base-200 object-cover" /></td>
                                        <td className="px-4 py-3 font-semibold text-base-content">{m.name}</td>
                                        <td className="px-4 py-3"><span className="cm-chip cm-tone-slate">{m.category}</span></td>
                                        <td className="px-4 py-3 text-base-content/70">{m.type}</td>
                                        <td className="px-4 py-3 font-bold text-base-content">{money(m.price)}</td>
                                        <td className="px-4 py-3"><span className={`cm-chip ${stockTone(m.stock)}`}>{m.stock} units</span></td>
                                        <td className="px-4 py-3 text-base-content/70">{m.company}</td>
                                        <td className="px-4 py-3">{actionBtns(m)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Phone cards */}
            <div className="space-y-3 md:hidden">
                {filtered.map((m, i) => (
                    <div key={m._id || i} className="rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <img src={m.image} alt={m.name} className="h-14 w-14 shrink-0 rounded-xl bg-base-200 object-cover" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-base-content">{m.name}</p>
                                <p className="text-xs text-base-content/60">{m.type} • {m.company}</p>
                                <div className="mt-1 flex flex-wrap gap-1.5"><span className="cm-chip cm-tone-slate">{m.category}</span><span className={`cm-chip ${stockTone(m.stock)}`}>{m.stock} units</span></div>
                            </div>
                            <p className="font-bold text-base-content">{money(m.price)}</p>
                        </div>
                        <div className="mt-3 border-t border-base-content/10 pt-3">{actionBtns(m)}</div>
                    </div>
                ))}
            </div>

            {/* ── Add medicine popup (theme + dark/light adaptive) ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
                    <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-base-content/10 bg-base-100 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} aria-label="Close" className="absolute right-5 top-5 text-xl text-base-content/50 hover:text-base-content"><FiX /></button>
                        <h3 className="text-xl font-bold text-base-content">Add New Medicine</h3>
                        <p className="mb-5 mt-0.5 text-xs text-base-content/60">Fill in the details to list a new medicine in the shop.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Field label="Medicine Name*" error={errors.name}>
                                <input type="text" placeholder="Medicine Name" {...register("name", { required: "Medicine Name is required" })} className={inputCls} />
                            </Field>
                            <Field label="Short Description*" error={errors.details}>
                                <textarea placeholder="Details" {...register("details", { required: "Details are required" })} className="textarea textarea-bordered h-20 w-full border-base-content/15 bg-base-100" />
                            </Field>
                            <Field label="Upload Image*" error={errors.image}>
                                <input type="file" accept="image/*" {...register("image", { required: "Image is required" })} className="file-input file-input-bordered w-full border-base-content/15 bg-base-100" />
                            </Field>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Type*" error={errors.type}>
                                    <input type="text" placeholder="e.g., Pain Relief" {...register("type", { required: "Type is required" })} className={inputCls} />
                                </Field>
                                <Field label="Per Unit Price*" error={errors.price}>
                                    <input type="number" step="0.01" placeholder="e.g., 3.50" {...register("price", { required: "Price is required" })} className={inputCls} />
                                </Field>
                                <Field label="Stock*" error={errors.stock}>
                                    <input type="number" placeholder="e.g., 80" {...register("stock", { required: "Stock is required" })} className={inputCls} />
                                </Field>
                                <Field label="Category*" error={errors.category}>
                                    <select {...register("category", { required: "Please select a category" })} className={selectCls}>
                                        <option value="">{categories.length === 0 ? "Loading categories..." : "Select category"}</option>
                                        {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </Field>
                                <Field label="Discount">
                                    <select {...register("discount")} className={selectCls}>
                                        <option value="false">No discount</option>
                                        <option value="true">Has discount</option>
                                    </select>
                                </Field>
                                <Field label="Discount Percentage">
                                    <select {...register("discountPercentage")} disabled={!hasDiscount} className={`${selectCls} disabled:opacity-50`}>
                                        {["0", "25", "40", "50", "70"].map((p) => <option key={p} value={p}>{p}%</option>)}
                                    </select>
                                </Field>
                                <Field label="Company*" error={errors.company}>
                                    <select {...register("company", { required: "Please select a company" })} className={selectCls}>
                                        <option value="">Company Name</option>
                                        {["Pfizer", "Novartis", "Roche", "Sanofi", "GSK"].map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                                <Field label="Item Mass Unit">
                                    <select {...register("unit")} className={selectCls}>
                                        <option value="Mg">Mg</option>
                                        <option value="ML">ML</option>
                                    </select>
                                </Field>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-base-content/10 pt-4">
                                <button type="button" onClick={closeModal} className="rounded-xl border border-base-content/20 px-5 py-2 text-sm font-semibold text-base-content hover:bg-base-200">Cancel</button>
                                <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{submitting ? "Adding..." : "Add Medicine"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMedicines;