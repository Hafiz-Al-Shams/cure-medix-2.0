// 📁 PATH: src/pages/SignUp/SignUp.jsx  (MODIFIED existing file – replace the whole file; dark mode + fully responsive on mobile)
import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext/AuthContext";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SocialLogin from "../SocialLogin/SocialLogin";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus, FiUserCheck, FiUploadCloud, FiChevronDown } from "react-icons/fi";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY; // imgbb key (unchanged)
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const SignUp = () => {
    const axiosPublic = useAxiosPublic();
    const { register, handleSubmit, reset, formState: { errors } } = useForm(); // react-hook-form (unchanged)
    const { createUser, updateUserProfile, signOutUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false); // eye icon toggle

    // ✅ Whole sign-up flow unchanged: upload image -> create user -> update profile -> save in DB -> sign out -> go to login
    const onSubmit = async (data) => {
        const imageFile = { image: data.image[0] };
        const res = await axiosPublic.post(image_hosting_api, imageFile, {
            headers: { "content-type": "multipart/form-data" },
        });
        if (res.data.success) {
            createUser(data.email, data.password)
                .then(() => {
                    updateUserProfile({ displayName: data.name, photoURL: res.data.data.display_url })
                        .then(() => {
                            // creating user entry in the database
                            const userInfo = { name: data.name, email: data.email, role: data.role };
                            axiosPublic.post("/users", userInfo).then((res) => {
                                if (res.data.insertedId) {
                                    signOutUser()
                                        .then(() => {
                                            Swal.fire({
                                                title: "Sign Up Successful",
                                                text: "Now please Login to Continue",
                                                icon: "success",
                                                confirmButtonText: "ok",
                                                buttonsStyling: false, // teal button to match the theme
                                                customClass: { popup: "rounded-2xl", confirmButton: "px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold" },
                                            });
                                            reset();
                                            navigate("/signIn");
                                        })
                                        .catch((error) => console.log("ERROR", error.message));
                                }
                            });
                        })
                        .catch((error) => console.log(error));
                });
        }
    };

    // Shared input look + red error text
    // 📱 text-base on phones (16px stops iOS from zooming the page on focus), text-sm from sm: upward (same as before)
    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:text-slate-100 [[data-theme=dark]_&]:placeholder:text-slate-500 [[data-theme=dark]_&]:[color-scheme:dark]";
    const labelClass = "text-sm font-semibold text-slate-800 [[data-theme=dark]_&]:text-slate-100";
    const errClass = "text-xs text-red-600 mt-1 [[data-theme=dark]_&]:text-red-400";

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4 py-6 sm:py-10">
            <Helmet>
                <title>CureMedix | Sign Up</title>
            </Helmet>

            {/* ONE card with the same border on left, right, top and bottom */}
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl [[data-theme=dark]_&]:bg-slate-900 [[data-theme=dark]_&]:border-slate-700 [[data-theme=dark]_&]:shadow-black/50">
                {/* ── Form area inside the card (smaller padding on small phones) ── */}
                <div className="p-5 min-[400px]:p-6 sm:p-10 lg:p-12">
                    {/* Sign In / Sign Up tab switch – full width on phones, compact pill from sm: upward */}
                    <div className="flex w-full sm:w-fit mx-auto bg-slate-100 border border-slate-200 rounded-2xl p-1 [[data-theme=dark]_&]:bg-slate-800 [[data-theme=dark]_&]:border-slate-700 text-sm font-semibold">
                        <Link to="/signIn" className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-8 py-2 rounded-xl text-slate-500 hover:text-teal-700 [[data-theme=dark]_&]:text-slate-400 [[data-theme=dark]_&]:hover:text-teal-300"><FiLogIn /> Sign In</Link>
                        <span className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-8 py-2 rounded-xl bg-white text-teal-700 shadow-sm [[data-theme=dark]_&]:bg-slate-700 [[data-theme=dark]_&]:text-teal-300"><FiUserPlus /> Sign Up</span>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 sm:mt-6 space-y-4">
                        {/* Name */}
                        <div>
                            <label className={labelClass}>Name <span className="text-red-500">*</span></label>
                            <div className="relative mt-1.5">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" {...register("name", { required: true })} placeholder="Enter full name" className={inputClass} />
                            </div>
                            {errors.name && <p className={errClass}>Name is required</p>}
                        </div>

                        {/* Image upload (dashed box) */}
                        <div>
                            <label className={labelClass}>Upload Image<span className="text-red-500">*</span></label>
                            <div className="mt-1.5 flex items-center gap-3 border border-dashed border-slate-300 bg-slate-50 rounded-xl p-3 [[data-theme=dark]_&]:border-slate-600 [[data-theme=dark]_&]:bg-slate-800">
                                <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-200 text-slate-500 [[data-theme=dark]_&]:bg-slate-700 [[data-theme=dark]_&]:text-slate-300 flex items-center justify-center text-xl"><FiUploadCloud /></div>
                                {/* flex-1 + min-w-0 + w-full on the input: long file names can never push the card wider than the screen */}
                                <div className="min-w-0 flex-1">
                                    <input
                                        {...register("image", { required: "Image is required" })}
                                        type="file"
                                        accept="image/*"
                                        className="block w-full max-w-full text-xs text-slate-500 [[data-theme=dark]_&]:text-slate-400 [[data-theme=dark]_&]:file:bg-slate-100 [[data-theme=dark]_&]:file:text-slate-900 file:mr-2 file:rounded-md file:border-0 file:bg-slate-900 file:text-white file:text-[11px] file:font-bold file:uppercase file:px-3 file:py-1.5 file:cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-400 [[data-theme=dark]_&]:text-slate-500 mt-1">JPG, PNG or WEBP (Max 5MB)</p>
                                </div>
                            </div>
                            {errors.image && <p className={errClass}>{errors.image.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                            <div className="relative mt-1.5">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email" {...register("email", { required: true })} placeholder="email@domain.com" className={inputClass} />
                            </div>
                            {errors.email && <p className={errClass}>Email is required</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <label className={labelClass}>Select Role <span className="text-red-500">*</span></label>
                            <div className="relative mt-1.5">
                                <FiUserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select {...register("role", { required: "Role is required" })} className={`${inputClass} appearance-none font-semibold`}>
                                    <option value="user">User</option>
                                    <option value="seller">Seller</option>
                                </select>
                                <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {errors.role && <p className={errClass}>{errors.role.message}</p>}
                        </div>

                        {/* Password (same validation rules) */}
                        <div>
                            <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                            <div className="relative mt-1.5">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: true,
                                        minLength: 6,
                                        maxLength: 20,
                                        pattern: /(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z])/,
                                    })}
                                    placeholder="password"
                                    className={inputClass}
                                />
                                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password" className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 [[data-theme=dark]_&]:hover:text-slate-200"> {/* p-1 = bigger tap area for thumbs */}
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.password?.type === "required" && <p className={errClass}>Password is required</p>}
                            {errors.password?.type === "minLength" && <p className={errClass}>Password must be 6 characters</p>}
                            {errors.password?.type === "maxLength" && <p className={errClass}>Password must be less than 20 characters</p>}
                            {errors.password?.type === "pattern" && <p className={errClass}>Password must have one Uppercase one lower case, one number and one special character.</p>}
                        </div>

                        {/* Submit */}
                        <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/30 hover:brightness-110 transition">
                            <FiUserPlus /> Sign Up
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 [[data-theme=dark]_&]:text-slate-400 mt-4">
                        Already have an account? <Link to="/signIn" className="font-bold text-teal-600 hover:underline [[data-theme=dark]_&]:text-teal-400">Sign In</Link>
                    </p>

                    <SocialLogin label="Continue with Google" /> {/* same text as the Sign In page */}
                </div>
            </div>
        </div>
    );
};

export default SignUp;