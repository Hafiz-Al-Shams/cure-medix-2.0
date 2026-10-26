// 📁 PATH: src/pages/Dashboard/ManageMedicines.jsx  (MODIFIED existing file – replace the whole file)
// Add / Search (unchanged) + Update / Delete now REAL, and only for this seller's own medicines.
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { confirmAction, successAlert, errorAlert } from "../../utils/adminAlerts";

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

const defaultValues = { discount: "false", discountPercentage: "0", unit: "Mg", company: "", category: "" };
const baseCompanies = ["Pfizer", "Novartis", "Roche", "Sanofi", "GSK"];
// 🔧 FIX: "0" removed from this list – 0% is not a real discount, so it can't be chosen when "Has discount" is on
const basePercents = ["25", "40", "50", "70"];

const ManageMedicines = () => {
    const { user } = useAuth();
    // 🔧 FIX: added setValue (used to reset the percentage when the Discount dropdown changes)
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ defaultValues });
    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = "Add" mode, a medicine = "Update" mode
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");

    // This seller's medicines (same endpoint as before)
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

    // after any change, refresh the list AND the Seller Home numbers
    const refreshAll = () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard", user?.email] });
    };

    const closeModal = () => {
        if (submitting) return;
        reset(defaultValues);
        setEditing(null);
        setIsModalOpen(false);
    };

    // Open the popup empty (Add mode)
    const openAdd = () => {
        reset(defaultValues);
        setEditing(null);
        setIsModalOpen(true);
    };

    // Open the popup filled with this medicine (Update mode)
    const openEdit = (m) => {
        const pct = String(parseInt(m.discountPercentage, 10) || 0);
        const discountOn = String(m.discount) === "true" && pct !== "0";
        reset({
            name: m.name || "",
            details: m.description || "",
            type: m.type || "",
            price: m.price ?? "",
            stock: m.stock ?? "",
            category: m.category || "",
            discount: discountOn ? "true" : "false",
            discountPercentage: discountOn ? pct : "0",
            company: m.company || "",
            unit: m.unit || "Mg",
        });
        setEditing(m);
        setIsModalOpen(true);
    };

    // Add OR update (same image upload as before; on update the image is optional)
    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            let imageUrl = editing?.image;
            if (data.image && data.image.length > 0) {
                const res = await axiosPublic.post(image_hosting_api, { image: data.image[0] }, { headers: { "content-type": "multipart/form-data" } });
                if (!res.data.success) {
                    errorAlert("Failed to upload image", "Please try a different image.");
                    return;
                }
                imageUrl = res.data.data.display_url;
            }
            const discountOn = data.discount === "true";

            if (editing) {
                // ───── UPDATE one of this seller's medicines ─────
                await axiosSecure.patch(`/medicines/${editing._id}`, {
                    name: data.name,
                    description: data.details,
                    image: imageUrl,
                    type: data.type,
                    price: parseFloat(data.price),
                    stock: parseInt(data.stock, 10),
                    discount: discountOn,
                    discountPercentage: discountOn ? parseInt(data.discountPercentage, 10) : 0,
                    category: data.category,
                    company: data.company,
                    unit: data.unit,
                });
                const name = data.name;
                reset(defaultValues);
                setEditing(null);
                setIsModalOpen(false);
                refreshAll();
                successAlert("Medicine updated", `${name} was updated successfully.`);
            } else {
                // ───── ADD (unchanged logic) ─────
                const newMedicine = {
                    name: data.name,
                    description: data.details,
                    image: imageUrl,
                    type: data.type,
                    price: parseFloat(data.price),
                    stock: parseInt(data.stock, 10),
                    discount: discountOn, // real true/false
                    discountPercentage: `${discountOn ? parseInt(data.discountPercentage, 10) : 0}%`,
                    category: data.category,
                    company: data.company,
                    unit: data.unit,
                    seller: user.email,
                };
                const medicineRes = await axiosSecure.post("/medicines", newMedicine);
                if (medicineRes.data.insertedId) {
                    await axiosSecure.patch(`/categories/addCount/${data.category}`, {});
                    reset(defaultValues);
                    setIsModalOpen(false);
                    refreshAll();
                    successAlert("Medicine added", `${data.name} is added to your medicines.`);
                }
            }
        } catch (err) {
            console.error(err);
            errorAlert(editing ? "Could not update medicine" : "Could not add medicine", err.response?.data?.message || "Please check the details and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Delete one of this seller's medicines (asks first, server double-checks ownership)
    const handleDelete = async (medicine) => {
        const ok = await confirmAction({
            title: "Delete this medicine?",
            text: `${medicine.name} will be removed from your list and the shop. Your past sales of it stay in your sales report.`,
            confirmText: "Yes, delete it",
            danger: true,
        });
        if (!ok) return;
        try {
            await axiosSecure.delete(`/medicines/${medicine._id}`);
            refreshAll();
            successAlert("Medicine deleted", `${medicine.name} was removed.`);
        } catch (err) {
            console.error(err);
            errorAlert("Could not delete medicine", err.response?.data?.message || "Please try again in a moment.");
        }
    };

    // Client-side search (unchanged)
    const q = search.trim().toLowerCase();
    const filtered = q
        ? medicines.filter((m) => [m.name, m.category, m.type, m.company].some((v) => String(v || "").toLowerCase().includes(q)))
        : medicines;

    const money = (n) => `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2)}`;
    const stockTone = (s) => (Number(s) <= 40 ? "cm-tone-amber" : "cm-tone-green"); // low stock = amber

    // dropdown lists that always include the medicine's current value (so editing never loses it)
    const companyOptions = [...new Set([...baseCompanies, editing?.company].filter(Boolean))];
    const categoryNames = categories.map((c) => c.name);
    const categoryOptions = [...new Set([...categoryNames, editing?.category].filter(Boolean))];
    // 🔧 FIX: "0" is filtered out here too, so an old medicine's 0% can never appear as a choice
    const percentOptions = [...new Set([...basePercents, editing ? String(parseInt(editing.discountPercentage, 10) || 0) : null].filter((v) => v !== null && v !== "0"))].sort((a, b) => a - b);

    const actionBtns = (m) => (
        <div className="flex items-center justify-end gap-2">
            <button onClick={() => openEdit(m)} className="cm-chip cm-chip-btn cm-tone-blue">Update</button>
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
                    <button onClick={openAdd} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"><FiPlus /> Add Medicine</button>
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

            {/* ── Add / Update medicine popup (theme + dark/light adaptive) ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-4" onClick={closeModal}>
                    <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-3xl border border-base-content/10 bg-base-100 p-5 shadow-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} aria-label="Close" className="absolute right-4 top-4 text-xl text-base-content/50 hover:text-base-content sm:right-5 sm:top-5"><FiX /></button>
                        <h3 className="pr-8 text-xl font-bold text-base-content">{editing ? "Update Medicine" : "Add New Medicine"}</h3>
                        <p className="mb-5 mt-0.5 text-xs text-base-content/60">{editing ? "Change the details below and save. Only your own medicine is updated." : "Fill in the details to list a new medicine in the shop."}</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Field label="Medicine Name*" error={errors.name}>
                                <input type="text" placeholder="Medicine Name" {...register("name", { required: "Medicine Name is required" })} className={inputCls} />
                            </Field>
                            <Field label="Short Description*" error={errors.details}>
                                <textarea placeholder="Details" {...register("details", { required: "Details are required" })} className="textarea textarea-bordered h-20 w-full border-base-content/15 bg-base-100" />
                            </Field>
                            <Field label={editing ? "Change Image (optional)" : "Upload Image*"} error={errors.image}>
                                {editing?.image && (
                                    <div className="mb-2 flex items-center gap-3">
                                        <img src={editing.image} alt={editing.name} className="h-12 w-12 rounded-xl bg-base-200 object-cover" />
                                        <p className="text-xs text-base-content/60">Current image. Choose a file only if you want to replace it.</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" {...register("image", { required: editing ? false : "Image is required" })} className="file-input file-input-bordered w-full border-base-content/15 bg-base-100" />
                            </Field>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Type*" error={errors.type}>
                                    <input type="text" placeholder="e.g., Pain Relief" {...register("type", { required: "Type is required" })} className={inputCls} />
                                </Field>
                                <Field label="Per Unit Price*" error={errors.price}>
                                    <input type="number" step="0.01" min="0" placeholder="e.g., 3.50" {...register("price", { required: "Price is required", min: { value: 0, message: "Price can't be negative" } })} className={inputCls} />
                                </Field>
                                <Field label="Stock*" error={errors.stock}>
                                    <input type="number" min="0" placeholder="e.g., 80" {...register("stock", { required: "Stock is required", min: { value: 0, message: "Stock can't be negative" } })} className={inputCls} />
                                </Field>
                                <Field label="Category*" error={errors.category}>
                                    <select {...register("category", { required: "Please select a category" })} className={selectCls}>
                                        <option value="">{categories.length === 0 ? "Loading categories..." : "Select category"}</option>
                                        {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                                <Field label="Discount">
                                    {/* 🔧 FIX: when the seller changes this dropdown, the percentage is reset:
                                        "Has discount" -> empty (seller must pick a real %), "No discount" -> "0" */}
                                    <select
                                        {...register("discount", {
                                            onChange: (e) => setValue("discountPercentage", e.target.value === "true" ? "" : "0"),
                                        })}
                                        className={selectCls}
                                    >
                                        <option value="false">No discount</option>
                                        <option value="true">Has discount</option>
                                    </select>
                                </Field>
                                <Field label="Discount Percentage" error={errors.discountPercentage}>
                                    {/* 🔧 FIX: no 0% choice when "Has discount" is on; a real percentage is required */}
                                    <select
                                        {...register("discountPercentage", {
                                            validate: (v) => !hasDiscount || parseInt(v, 10) > 0 || "Please select a discount percentage",
                                        })}
                                        disabled={!hasDiscount}
                                        className={`${selectCls} disabled:opacity-50`}
                                    >
                                        {hasDiscount ? (
                                            <>
                                                <option value="">Select percentage</option>
                                                {percentOptions.map((p) => <option key={p} value={p}>{p}%</option>)}
                                            </>
                                        ) : (
                                            <option value="0">0%</option>
                                        )}
                                    </select>
                                </Field>
                                <Field label="Company*" error={errors.company}>
                                    <select {...register("company", { required: "Please select a company" })} className={selectCls}>
                                        <option value="">Company Name</option>
                                        {companyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                                <Field label="Item Mass Unit">
                                    <select {...register("unit")} className={selectCls}>
                                        <option value="Mg">Mg</option>
                                        <option value="ML">ML</option>
                                    </select>
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t border-base-content/10 pt-4 sm:flex sm:justify-end">
                                <button type="button" onClick={closeModal} disabled={submitting} className="rounded-xl border border-base-content/20 px-5 py-2 text-sm font-semibold text-base-content hover:bg-base-200">Cancel</button>
                                <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">
                                    {submitting ? (editing ? "Saving..." : "Adding...") : editing ? "Save Changes" : "Add Medicine"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMedicines;