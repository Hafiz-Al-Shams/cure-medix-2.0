// 📁 PATH: src/pages/SignIn/SignIn.jsx  (MODIFIED existing file – replace the whole file; now fully responsive on mobile)
import { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext/AuthContext";
import Swal from "sweetalert2";
import SocialLogin from "../SocialLogin/SocialLogin";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } from "react-icons/fi";

const SignIn = () => {
    const { signInUser } = useContext(AuthContext); // Firebase sign-in function (unchanged)
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false); // eye icon toggle

    const from = location.state?.from?.pathname || "/"; // where to go after login (unchanged)

    // ✅ Login logic unchanged
    const handleSignIn = (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        signInUser(email, password)
            .then(() => {
                Swal.fire({ position: "center", icon: "success", title: "Login Successful", showConfirmButton: false, timer: 1000 });
                e.target.reset();
                navigate(from, { replace: true }); // back to the page the user came from
            })
            .catch((error) => {
                console.log("ERROR from Firebase", error.message);
                Swal.fire({
                    title: "Error!",
                    text: "Invalid Email or Password!!",
                    icon: "error",
                    confirmButtonText: "Try Again",
                    buttonsStyling: false, // teal button to match the theme
                    customClass: { popup: "rounded-2xl", confirmButton: "px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold" },
                });
            });
    };

    // Shared input look (rounded, soft grey, teal focus ring)
    // 📱 text-base on phones (16px stops iOS from zooming the page on focus), text-sm from sm: upward (same as before)
    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:text-slate-100 [[data-theme=dark]_&]:placeholder:text-slate-500 [[data-theme=dark]_&]:[color-scheme:dark]";

    return (
        // Page keeps the default white background, form card centered (tighter outer spacing on phones)
        <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4 py-6 sm:py-10">
            <Helmet>
                <title>CureMedix | Sign In</title>
            </Helmet>

            {/* ONE card with the same border on left, right, top and bottom */}
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl [[data-theme=dark]_&]:bg-slate-900 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:shadow-black/50">
                {/* ── Form area inside the card (smaller padding on small phones) ── */}
                <div className="p-5 min-[400px]:p-6 sm:p-10 lg:p-12">
                    {/* Sign In / Sign Up tab switch – full width on phones, compact pill from sm: upward */}
                    <div className="flex w-full sm:w-fit mx-auto bg-slate-100 border border-slate-200 rounded-2xl p-1 [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:border-slate-700 text-sm font-semibold">
                        <span className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-8 py-2 rounded-xl bg-white text-teal-700 shadow-sm [[data-theme=dark]_&]:bg-slate-700 [[data-theme=dark]_&]:text-teal-300"><FiLogIn /> Sign In</span>
                        <Link to="/signUp" state={location.state} className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-8 py-2 rounded-xl text-slate-500 hover:text-teal-700 [[data-theme=dark]_&]:text-slate-400 [[data-theme=dark]_&]:hover:text-teal-300"><FiUserPlus /> Sign Up</Link>
                    </div>

                    <form onSubmit={handleSignIn} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-slate-800 [[data-theme=dark]_&]:text-slate-100">Email Address <span className="text-red-500">*</span></label>
                            <div className="relative mt-1.5">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email" name="email" placeholder="Enter your email" className={inputClass} required />
                            </div>
                        </div>

                        {/* Password + show/hide */}
                        <div>
                            {/* flex-wrap + gap: "Forgot password?" drops under the label on very narrow screens instead of squeezing */}
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                <label className="text-sm font-semibold text-slate-800 [[data-theme=dark]_&]:text-slate-100">Password <span className="text-red-500">*</span></label>
                                <Link to="/forgot-password" state={location.state} className="text-xs font-semibold text-teal-600 hover:underline [[data-theme=dark]_&]:text-teal-400">Forgot password?</Link> {/* opens the real page */}
                            </div>
                            <div className="relative mt-1.5">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" className={inputClass} required />
                                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password" className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 [[data-theme=dark]_&]:hover:text-slate-200"> {/* p-1 = bigger tap area for thumbs */}
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/30 hover:brightness-110 transition">
                            <FiLogIn /> Sign In
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 [[data-theme=dark]_&]:text-slate-400 mt-5">
                        New to CureMedix? <Link to="/signUp" state={location.state} className="font-bold text-teal-600 hover:underline [[data-theme=dark]_&]:text-teal-400">Create an Account</Link>
                    </p>

                    {/* Google login (same component as before) */}
                    <SocialLogin label="Continue with Google" />
                </div>
            </div>
        </div>
    );
};

export default SignIn;