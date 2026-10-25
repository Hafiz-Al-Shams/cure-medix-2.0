// 📁 PATH: src/pages/Dashboard/Payment.jsx  (MODIFIED existing file – replace the whole file)
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_Payment_Gateway_PK);

const Payment = () => {
    const location = useLocation();
    const isConsult = !!location.state?.booking; // ✅ NEW: true when we came from "Book Appointment"

    return (
        <div className="mx-auto w-full max-w-5xl">
            {/* Page heading */}
            <header className="mb-6 border-b border-base-content/10 pb-4">
                <h1 className="text-2xl font-bold text-base-content sm:text-3xl">{isConsult ? "Pay for your video consultation:" : "Pay for your ordered medicines here:"}</h1>
                <p className="mt-1 text-sm text-base-content/60">{isConsult ? "Review your booking and complete the payment securely to confirm your appointment." : "Complete your medicine payment securely via encrypted checkout."}</p>
            </header>

            <Elements stripe={stripePromise}>
                <CheckoutForm />
            </Elements>
        </div>
    );
};

export default Payment;