// 📁 PATH: src/pages/Dashboard/CheckoutForm.jsx  (MODIFIED existing file – replace the whole file)
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaCcAmex, FaCcMastercard, FaCcVisa, FaCreditCard, FaPills } from "react-icons/fa";
import { FiCalendar, FiLock, FiShield, FiUser } from "react-icons/fi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { errorAlert, successAlert } from "../../utils/adminAlerts";

// Follows the site's light / dark mode (the Dashboard sets data-theme on <html>)
const useIsDark = () => {
    const [dark, setDark] = useState(() => document.documentElement.getAttribute("data-theme") === "dark");
    useEffect(() => {
        const el = document.documentElement;
        const obs = new MutationObserver(() => setDark(el.getAttribute("data-theme") === "dark"));
        obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
        return () => obs.disconnect();
    }, []);
    return dark;
};

const money = (n) => `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2)}`;

// Box that wraps one Stripe input (icon on the left, teal ring while focused)
const FieldBox = ({ icon, focused, children, right }) => (
    <div className={`flex items-center gap-3 rounded-xl border bg-base-200/60 px-3.5 py-3 transition-colors ${focused ? "border-teal-500 ring-2 ring-teal-500/25" : "border-base-content/15"}`}>
        <span className="text-base text-base-content/50">{icon}</span>
        <div className="min-w-0 flex-1">{children}</div>
        {right}
    </div>
);
const Label = ({ children }) => <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-base-content/70">{children}</label>;

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const [cart, refetch] = useCart();
    const navigate = useNavigate();
    const dark = useIsDark();

    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [paid, setPaid] = useState(false); // hides the "empty cart" message while we move to the invoice
    const [holder, setHolder] = useState(user?.displayName || "");
    const [brand, setBrand] = useState("unknown"); // detected by Stripe while typing the card number
    const [focus, setFocus] = useState("");

    // fill the name when the logged-in user loads (editable)
    useEffect(() => {
        if (user?.displayName) setHolder((h) => h || user.displayName);
    }, [user]);

    // ✅ FIX: quantity now comes straight from the database (saved by the Cart page), fallback 1
    const getQty = (item) => item.quantity ?? 1;

    // total = price × quantity for every medicine
    const totalPrice = Math.round(cart.reduce((total, item) => total + Number(item.price) * getQty(item), 0) * 100) / 100;
    const totalPieces = cart.reduce((sum, item) => sum + getQty(item), 0); // total number of pieces (e.g. 18)

    useEffect(() => {
        if (totalPrice > 0) {
            axiosSecure.post("/create-payment-intent", { price: totalPrice }).then((res) => setClientSecret(res.data.clientSecret));
        }
    }, [axiosSecure, totalPrice]);

    // Stripe inputs live in iframes, so their colours are set here (light / dark)
    const elementOptions = {
        style: {
            base: {
                fontSize: "15px",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                color: dark ? "#e2e8f0" : "#0f172a",
                iconColor: dark ? "#94a3b8" : "#64748b",
                "::placeholder": { color: dark ? "#64748b" : "#94a3b8" },
            },
            invalid: { color: dark ? "#fda4af" : "#be123c", iconColor: dark ? "#fda4af" : "#be123c" },
        },
    };

    const handleChange = (e) => setError(e.error ? e.error.message : "");

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) return;
        const card = elements.getElement(CardNumberElement);
        if (!card) return;

        setProcessing(true);
        setError("");
        try {
            // confirm payment (card number + expiry + cvc elements are read automatically)
            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card,
                    billing_details: {
                        email: user?.email || "anonymous",
                        name: holder.trim() || user?.displayName || "anonymous",
                    },
                },
            });

            if (confirmError) {
                setError(confirmError.message);
                errorAlert("Payment failed", confirmError.message);
                return;
            }

            if (paymentIntent.status === "succeeded") {
                // ✅ NEW: a snapshot of every medicine bought (so the invoice can list them later,
                // even if the medicine is edited/deleted afterwards)
                const items = cart.map((item) => ({
                    cartId: item._id,
                    medicineId: item.medicineId,
                    name: item.name,
                    image: item.image,
                    type: item.type,
                    company: item.company,
                    seller: item.seller,
                    unitPrice: Number(item.price),
                    quantity: getQty(item),
                    lineTotal: Math.round(Number(item.price) * getQty(item) * 100) / 100,
                }));

                // saving the payment in the database (same data as before + items list)
                const payment = {
                    email: user.email,
                    price: totalPrice,
                    transactionId: paymentIntent.id,
                    date: new Date(),
                    cartIds: cart.map((item) => item._id),
                    medicineIds: cart.map((item) => item.medicineId),
                    items, // ✅ NEW
                    totalItems: totalPieces, // ✅ NEW
                    status: "pending",
                };
                const res = await axiosSecure.post("/payments", payment);
                refetch();
                if (res.data?.paymentResult?.insertedId) {
                    setPaid(true);
                    await successAlert("Payment successful", `Transaction ID: ${paymentIntent.id}`);
                    navigate("/invoice", { state: { transactionId: paymentIntent.id } }); // tells the invoice which payment is the current one
                } else {
                    errorAlert("Payment received but not saved", `Please keep your transaction ID: ${paymentIntent.id}`);
                }
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong while processing the payment.");
            errorAlert("Something went wrong", "Please try again in a moment.");
        } finally {
            setProcessing(false);
        }
    };

    // Nothing to pay for
    if (cart.length === 0 && !paid) {
        return (
            <div className="rounded-2xl border border-dashed border-base-content/20 bg-base-100 px-6 py-14 text-center">
                <Helmet><title>CureMedix | Checkout</title></Helmet>
                <p className="font-semibold text-base-content">Your cart is empty</p>
                <p className="mt-1 text-sm text-base-content/60">Add some medicines to your cart before checking out.</p>
                <Link to="/shop" className="mt-5 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Go to Shop</Link>
            </div>
        );
    }

    const brands = [
        { id: "visa", icon: <FaCcVisa /> },
        { id: "mastercard", icon: <FaCcMastercard /> },
        { id: "amex", icon: <FaCcAmex /> },
    ];

    return (
        <>
            <Helmet><title>CureMedix | Checkout</title></Helmet>
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_1fr]">

                {/* ───────── Card payment form ───────── */}
                <form onSubmit={handleSubmit} className="order-2 rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm sm:p-7 lg:order-1">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <span className="cm-chip cm-tone-green border border-emerald-500/30 !px-3 !py-1 text-[11px] font-bold tracking-wider">CARD PAYMENT</span>
                        <div className="flex items-center gap-1.5 text-2xl">
                            {brands.map((b) => (
                                <span key={b.id} className={`transition-opacity ${brand === b.id ? "text-teal-600 opacity-100" : brand === "unknown" ? "text-base-content/40" : "text-base-content/20"}`}>{b.icon}</span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Cardholder Name</Label>
                            <FieldBox icon={<FiUser />} focused={focus === "name"}>
                                <input type="text" required value={holder} onChange={(e) => setHolder(e.target.value)} onFocus={() => setFocus("name")} onBlur={() => setFocus("")} placeholder="Name on card" autoComplete="cc-name" className="w-full bg-transparent text-[15px] text-base-content outline-none placeholder:text-base-content/40" />
                            </FieldBox>
                        </div>

                        <div>
                            <Label>Card Number</Label>
                            <FieldBox icon={<FaCreditCard />} focused={focus === "number"} right={<FiLock className="text-teal-600" />}>
                                <CardNumberElement options={{ ...elementOptions, showIcon: false }} onChange={(e) => { handleChange(e); setBrand(e.brand || "unknown"); }} onFocus={() => setFocus("number")} onBlur={() => setFocus("")} />
                            </FieldBox>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Expiration</Label>
                                <FieldBox icon={<FiCalendar />} focused={focus === "expiry"}>
                                    <CardExpiryElement options={elementOptions} onChange={handleChange} onFocus={() => setFocus("expiry")} onBlur={() => setFocus("")} />
                                </FieldBox>
                            </div>
                            <div>
                                <Label>CVC / CVV</Label>
                                <FieldBox icon={<FiShield />} focused={focus === "cvc"}>
                                    <CardCvcElement options={elementOptions} onChange={handleChange} onFocus={() => setFocus("cvc")} onBlur={() => setFocus("")} />
                                </FieldBox>
                            </div>
                        </div>
                    </div>

                    {error && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 [[data-theme=dark]_&]:text-rose-300">{error}</p>}

                    <button type="submit" disabled={!stripe || !clientSecret || processing} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-base font-bold text-white shadow-md shadow-teal-600/25 transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                        {processing ? (<><span className="loading loading-spinner loading-sm"></span> Processing...</>) : `Pay ${money(totalPrice)}`}
                    </button>

                    <p className="mt-5 flex items-center justify-center gap-2 border-t border-base-content/10 pt-4 text-xs text-base-content/60"><FiLock className="text-teal-600" /> Encrypted &amp; secured by Stripe</p>
                </form>

                {/* ───────── Order summary (your real cart) ───────── */}
                <aside className="order-1 rounded-2xl border border-base-content/10 bg-base-100 p-5 shadow-sm sm:p-6 lg:order-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/70">Order Summary</h2>

                    <ul className="mt-4 max-h-80 divide-y divide-base-content/10 overflow-y-auto">
                        {cart.map((item) => (
                            <li key={item._id} className="flex items-center gap-3 py-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-500/10 text-teal-600">
                                    {item.image ? <img src={item.image} alt={item.name} onError={(e) => { e.currentTarget.style.display = "none"; }} className="h-full w-full object-cover" /> : <FaPills />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-base-content">{item.name}</p>
                                    <p className="truncate text-xs text-base-content/50">Qty: {getQty(item)}{item.type ? ` • ${item.type}` : ""}</p>
                                </div>
                                <p className="text-sm font-bold text-base-content">{money(Number(item.price) * getQty(item))}</p>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-3 space-y-2 border-t border-base-content/10 pt-4 text-sm">
                        <div className="flex justify-between text-base-content/70"><span>Items</span><span>{totalPieces}</span></div>
                        <div className="flex justify-between text-base-content/70"><span>Subtotal</span><span>{money(totalPrice)}</span></div>
                        <div className="flex items-center justify-between border-t border-base-content/10 pt-3">
                            <span className="font-bold text-base-content">Total Due</span>
                            <span className="text-xl font-bold text-teal-600">{money(totalPrice)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default CheckoutForm;