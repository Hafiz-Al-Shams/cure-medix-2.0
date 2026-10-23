// 📁 PATH: src/pages/SocialLogin/SocialLogin.jsx  (MODIFIED existing file – replace the whole file; now adapts to dark mode)
import { useContext } from "react";
import Swal from "sweetalert2";
import AuthContext from "../../context/AuthContext/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { FcGoogle } from "react-icons/fc";

// `label` sets the button text (default: "Continue with Google", used on both pages)
const SocialLogin = ({ label = "Continue with Google" }) => {
    const { signInWithGoogle } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/"; // kept from your original (not used, as before)

    // ✅ Google login logic unchanged
    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then((result) => {
                const userInfo = {
                    name: result.user?.displayName,
                    email: result.user?.email,
                    role: "user",
                };
                axiosPublic.post("/users", userInfo).then(() => {
                    Swal.fire({ position: "center", icon: "success", title: "Google Login Successful", showConfirmButton: false, timer: 1000 });
                    navigate("/");
                });
            })
            .catch((error) => {
                console.log("ERROR", error.message);
            });
    };

    return (
        <div className="mt-4">
            {/* "— OR —" divider with thin lines */}
            <div className="flex items-center gap-3 text-[11px] font-bold tracking-widest text-slate-400">
                <span className="flex-1 h-px bg-slate-200 [[data-theme=dark]_&]:bg-slate-700" /> OR <span className="flex-1 h-px bg-slate-200 [[data-theme=dark]_&]:bg-slate-700" />
            </div>
            <button type="button" onClick={handleGoogleSignIn} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-semibold text-slate-700 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:hover:bg-slate-700 [[data-theme=dark]_&]:text-slate-200 transition-colors">
                <FcGoogle className="text-lg" /> {label}
            </button>
        </div>
    );
};

export default SocialLogin;