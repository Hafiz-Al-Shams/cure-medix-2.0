// 📁 PATH: src/pages/Cart/Cart.jsx  (MODIFIED existing file – replace the whole file)
import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FiEye, FiTrash2, FiX, FiCreditCard, FiAlertTriangle, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// Same column layout for the table header and every row (phones use a stacked card layout instead)
const cols = "md:grid md:grid-cols-[48px_72px_1fr_140px_110px_100px]";

// Reusable themed popup shell (adapts to light/dark through your theme colors)
const Modal = ({ onClose, size = "max-w-md", children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4" onClick={onClose}> {/* click outside = close */}
        <div className={`w-full ${size} bg-base-100 text-base-content rounded-3xl shadow-2xl border border-base-content/10 max-h-[92vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
);

// Small "success" alert after delete / clear (auto-closes; dark mode handled globally in index.css)
const done = (title, text) => Swal.fire({ icon: "success", title, text, showConfirmButton: false, timer: 1500, buttonsStyling: false, customClass: { popup: "rounded-2xl" } });

const Cart = () => {
    const { user } = useAuth();
    const [cart, refetch] = useCart(); // cart items from your hook (unchanged)
    const axiosSecure = useAxiosSecure();

    const [detailsItem, setDetailsItem] = useState(null); // item shown in the details popup
    const [deleteItem, setDeleteItem] = useState(null); // item waiting for delete confirmation
    const [showClear, setShowClear] = useState(false); // clear-cart confirmation popup
    const [qtys, setQtys] = useState({}); // quantity overrides by item id (visual for now – see TODO below)

    // Quantity of an item: local change > saved quantity from the shop > 1
    const getQty = (item) => qtys[item._id] ?? item.quantity ?? 1;
    // TODO (later): after changing the number, also save it to your server, e.g. axiosSecure.put(`/carts/${id}`, { quantity })
    const changeQty = (item, delta) => setQtys((prev) => ({ ...prev, [item._id]: Math.max(1, getQty(item) + delta) }));

    const orderedCount = cart.reduce((sum, item) => sum + getQty(item), 0); // "Ordered Medicine: N"
    const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * getQty(item), 0);
    const fmt = (n) => +Number(n).toFixed(2); // 11.4 instead of 11.40

    // ✅ Original delete logic (now runs after the themed confirm popup)
    const handleDelete = (id) => {
        axiosSecure.delete(`/carts/${id}`).then((res) => {
            if (res.data.deletedCount > 0) {
                refetch();
                setDeleteItem(null);
                done("Deleted!", "Your order has been deleted.");
            }
        });
    };

    // ✅ Original clear-cart logic (now runs after the themed confirm popup)
    const handleClearCart = async () => {
        try {
            const email = user.email;
            const deleteRes = await axiosSecure.delete(`/clearCarts`, { params: { email } });
            if (deleteRes.data.deletedCount > 0) {
                refetch();
                setShowClear(false);
                done("Cleared!", "All Your Orders Have been Deleted");
            }
        } catch (error) {
            console.error("Failed to clear cart:", error);
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto space-y-5 sm:space-y-6">
            {/* ── Header card: counts + Clear Cart + Checkout ── */}
            <div className="relative overflow-hidden bg-emerald-50/70 [[data-theme=dark]_&]:bg-emerald-500/10 border border-base-content/10 rounded-2xl p-5 sm:p-6">
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ordered Medicine: {orderedCount}</h2>
                            <span className="text-xs font-bold text-teal-700 bg-emerald-100 border border-emerald-200 rounded-full px-3 py-1 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:border-emerald-500/30 [[data-theme=dark]_&]:text-emerald-300">Total Price: ${fmt(totalPrice)}</span>
                        </div>
                        <p className="mt-1 text-sm text-base-content/60">Review your prescription items before initiating checkout.</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Clear Cart – disabled when the cart is empty (same rule as before) */}
                        <button disabled={!cart.length} onClick={() => setShowClear(true)} className="btn btn-sm sm:btn-md flex-1 lg:flex-none border-0 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 [[data-theme=dark]_&]:bg-slate-700">Clear Cart</button>
                        {cart.length ? (
                            <Link to="/dashboard/payment" className="btn btn-sm sm:btn-md flex-1 lg:flex-none border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg shadow-teal-600/30"><FiCreditCard /> Checkout</Link>
                        ) : (
                            <button disabled className="btn btn-sm sm:btn-md flex-1 lg:flex-none border-0 bg-teal-600 text-white gap-2 opacity-50"><FiCreditCard /> Checkout</button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Empty state ── */}
            {cart.length === 0 && (
                <div className="bg-base-100 border border-dashed border-base-content/20 rounded-2xl py-16 px-4 text-center">
                    <span className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-teal-600 flex items-center justify-center text-2xl [[data-theme=dark]_&]:bg-emerald-500/15"><FiShoppingBag /></span>
                    <p className="mt-4 font-bold">Your cart is empty</p>
                    <p className="text-sm text-base-content/60 mt-1">Add medicines from the shop and they will appear here.</p>
                    <Link to="/shop" className="btn btn-sm mt-5 border-0 bg-teal-600 hover:bg-teal-700 text-white">Go to Shop</Link>
                </div>
            )}

            {/* ── Cart table (stacked cards on phones) ── */}
            {cart.length > 0 && (
                <div className="bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden shadow-sm">
                    {/* Green header bar (desktop/tablet) */}
                    <div className={`hidden ${cols} items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold uppercase tracking-wide px-5 py-3.5`}>
                        <span>No.</span><span>Image</span><span>Name</span><span className="text-center">Quantity</span><span className="text-right">Total Price</span><span className="text-right">Actions</span>
                    </div>

                    {cart.map((item, index) => {
                        const qty = getQty(item);
                        return (
                            <div key={item._id} className={`flex flex-wrap items-center gap-x-3 gap-y-3 px-4 py-4 md:py-3.5 md:px-5 md:gap-0 ${cols} border-b border-base-content/10 last:border-0`}>
                                <span className="hidden md:block text-sm text-base-content/70">{index + 1}</span>
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-base-200" />
                                <div className="flex-1 min-w-0 md:pr-3">
                                    <p className="font-semibold truncate">{item.name}</p>
                                    <p className="text-xs text-base-content/50 truncate">{item.type}{item.company ? ` • ${item.company}` : ""}</p>
                                </div>
                                {/* On phones: quantity, price and actions sit in one row under the name; on larger screens they become table columns (md:contents) */}
                                <div className="flex w-full items-center justify-between gap-3 md:contents">
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center border border-base-content/15 rounded-lg overflow-hidden text-sm">
                                            <button onClick={() => changeQty(item, -1)} aria-label="Decrease" className="w-8 h-8 flex items-center justify-center hover:bg-base-200"><FiMinus className="text-xs" /></button>
                                            <span className="w-8 text-center font-semibold">{qty}</span>
                                            <button onClick={() => changeQty(item, 1)} aria-label="Increase" className="w-8 h-8 flex items-center justify-center hover:bg-base-200"><FiPlus className="text-xs" /></button>
                                        </div>
                                    </div>
                                    <span className="font-bold md:text-right">${fmt(item.price * qty)}</span>
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => setDetailsItem(item)} aria-label="View details" className="w-9 h-9 rounded-lg bg-base-200 hover:bg-base-300 flex items-center justify-center"><FiEye /></button>
                                        <button onClick={() => setDeleteItem(item)} aria-label="Delete" className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 flex items-center justify-center [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300"><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═════════ POPUP: item details (replaces the old Swal details box) ═════════ */}
            {detailsItem && (
                <Modal onClose={() => setDetailsItem(null)} size="max-w-lg">
                    <div className="p-6 relative">
                        <button onClick={() => setDetailsItem(null)} aria-label="Close" className="absolute right-5 top-5 w-9 h-9 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center"><FiX /></button>
                        <div className="flex items-center gap-4 pr-10">
                            <img src={detailsItem.image} alt={detailsItem.name} className="w-20 h-20 shrink-0 rounded-2xl object-cover bg-base-200" />
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold tracking-wider bg-teal-50 text-teal-700 rounded-full px-2.5 py-0.5 uppercase [[data-theme=dark]_&]:bg-teal-500/15 [[data-theme=dark]_&]:text-teal-300">{detailsItem.type}</span>
                                <h3 className="mt-1 text-xl sm:text-2xl font-bold leading-tight break-words">{detailsItem.name}</h3>
                            </div>
                        </div>
                        <div className="mt-5 bg-base-200/70 rounded-2xl p-4">
                            <p className="text-sm font-semibold">Price per Unit:</p>
                            <p className="text-2xl font-bold text-teal-600">${detailsItem.price}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                            {[["Type", detailsItem.type], ["Company", detailsItem.company], ["Seller", detailsItem.seller]].map(([label, value]) => (
                                <div key={label} className="min-w-0"><p className="text-base-content/50">{label}</p><p className="font-semibold truncate">{value || "NA"}</p></div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-semibold">Description:</p>
                            <p className="text-xs text-base-content/70 mt-1">{detailsItem.description || "No description available."}</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═════════ POPUP: confirm delete ═════════ */}
            {deleteItem && (
                <Modal onClose={() => setDeleteItem(null)} size="max-w-sm">
                    <div className="p-7 text-center">
                        <span className="mx-auto w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300"><FiTrash2 /></span>
                        <h3 className="mt-4 text-lg font-bold">Are you sure?</h3>
                        <p className="mt-2 text-xs text-base-content/60">&quot;{deleteItem.name}&quot; will be removed from your cart. You won&apos;t be able to revert this!</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => setDeleteItem(null)} className="btn border-0 bg-base-200 hover:bg-base-300 rounded-xl">Cancel</button>
                            <button onClick={() => handleDelete(deleteItem._id)} className="btn border-0 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/30">Yes, delete it!</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═════════ POPUP: confirm clear cart ═════════ */}
            {showClear && (
                <Modal onClose={() => setShowClear(false)} size="max-w-sm">
                    <div className="p-7 text-center">
                        <span className="mx-auto w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300"><FiAlertTriangle /></span>
                        <h3 className="mt-4 text-lg font-bold">Clear your cart?</h3>
                        <p className="mt-2 text-xs text-base-content/60">All {cart.length} ordered {cart.length === 1 ? "item" : "items"} will be removed from your cart.</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => setShowClear(false)} className="btn border-0 bg-base-200 hover:bg-base-300 rounded-xl">Cancel</button>
                            <button onClick={handleClearCart} className="btn border-0 bg-slate-900 hover:bg-slate-800 text-white rounded-xl [[data-theme=dark]_&]:bg-slate-600">Clear Cart</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Cart;