// 📁 PATH: src/pages/ForgotPassword/ForgotPassword.jsx  (BRAND NEW file – create the folder + file)
import { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AuthContext from "../../context/AuthContext/AuthContext"; // gives us resetPassword from AuthProvider
import { FiMail, FiSend, FiArrowLeft, FiKey } from "react-icons/fi";

// Same teal popup buttons used on the other pages (dark mode is handled globally by index.css)
const swalButtons = { popup: "rounded-2xl", confirmButton: "px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold" };

const ForgotPassword = () => {
    const { resetPassword } = useContext(AuthContext); // 🔥 Firebase call lives in AuthProvider
    const navigate = useNavigate();
    const [sending, setSending] = useState(false); // disables the button while the request is running

    const handleReset = async (e) => {
        e.preventDefault();
        const email = e.target.email.value.trim();

        setSending(true);
        try {
            await resetPassword(email); // 🔥 Firebase sends the reset email (via AuthProvider)
            await Swal.fire({
                icon: "success",
                title: "Reset Link Sent",
                text: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox (and spam folder).`,
                confirmButtonText: "Back to Sign In",
                buttonsStyling: false,
                customClass: swalButtons,
            });
            e.target.reset();
            navigate("/signIn"); // after the popup, send the user back to login
        } catch (error) {
            console.log("ERROR from Firebase", error.code, error.message);
            // Turn Firebase error codes into friendly messages
            const messages = {
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/user-not-found": "No account found with this email.",
                "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
                "auth/network-request-failed": "Network error. Please check your connection and try again.",
            };
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: messages[error.code] || "Something went wrong. Please try again.",
                confirmButtonText: "Try Again",
                buttonsStyling: false,
                customClass: swalButtons,
            });
        } finally {
            setSending(false); // always re-enable the button
        }
    };

    // Same input look as the Sign In / Sign Up pages (with dark-mode variants)
    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:text-slate-100 [[data-theme=dark]_&]:placeholder:text-slate-500 [[data-theme=dark]_&]:[color-scheme:dark]";

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 py-10">
            <Helmet>
                <title>CureMedix | Forgot Password</title>
            </Helmet>

            {/* Same card as Sign In / Sign Up: border on all four sides */}
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl [[data-theme=dark]_&]:bg-slate-900 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:shadow-black/50">
                <div className="p-6 sm:p-10 lg:p-12">
                    {/* Key icon + heading */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-teal-600 flex items-center justify-center text-2xl [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:text-teal-300"><FiKey /></div>
                        <h1 className="mt-4 text-2xl font-extrabold text-slate-800 [[data-theme=dark]_&]:text-slate-100">Forgot Password?</h1>
                        <p className="mt-2 text-sm text-slate-500 max-w-sm [[data-theme=dark]_&]:text-slate-400">
                            Enter the email linked to your account and we&apos;ll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleReset} className="mt-8 space-y-5">
                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-slate-800 [[data-theme=dark]_&]:text-slate-100">Email Address <span className="text-red-500">*</span></label>
                            <div className="relative mt-1.5">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email" name="email" placeholder="Enter your email" className={inputClass} required />
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/30 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed">
                            <FiSend /> {sending ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    {/* Back to login */}
                    <p className="text-center text-sm text-slate-500 mt-5 [[data-theme=dark]_&]:text-slate-400">
                        <Link to="/signIn" className="inline-flex items-center gap-1.5 font-bold text-teal-600 hover:underline [[data-theme=dark]_&]:text-teal-400"><FiArrowLeft /> Back to Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;