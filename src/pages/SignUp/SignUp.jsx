import { useContext } from "react";
import AuthContext from "../../context/AuthContext/AuthContext";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SocialLogin from "../SocialLogin/SocialLogin";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../hooks/useAxiosPublic";
// import { db } from "../../firebase/firebase.init";



const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;



const SignUp = () => {

    const axiosPublic = useAxiosPublic();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createUser, updateUserProfile, signOutUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (data) => {


        const imageFile = { image: data.image[0] }
        const res = await axiosPublic.post(image_hosting_api, imageFile, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
        if (res.data.success) {

            createUser(data.email, data.password)
                .then(result => {
                    const loggedUser = result.user;
                    // console.log(loggedUser);
                    updateUserProfile({ displayName: data.name, photoURL: res.data.data.display_url })
                        .then(() => {
                            // creating user entry in the database
                            const userInfo = {
                                name: data.name,
                                email: data.email,
                                role: data.role,
                            }
                            axiosPublic.post('/users', userInfo)
                                .then(res => {
                                    if (res.data.insertedId) {
                                        // console.log('user added to the database');

                                        signOutUser()
                                            .then(() => {
                                                // console.log('user signOut successful');
                                                Swal.fire({
                                                    title: 'Sign Up Successful',
                                                    text: 'Now please Login to Continue',
                                                    icon: 'success',
                                                    confirmButtonText: 'ok'
                                                });
                                                reset();
                                                navigate('/signIn');
                                            })
                                            .catch(error => console.log('ERROR', error.message))




                                        // old
                                        // Swal.fire({
                                        //     position: 'center-left',
                                        //     icon: 'success',
                                        //     title: 'Sign Up successful.',
                                        //     showConfirmButton: false,
                                        //     timer: 1000
                                        // });
                                        // navigate('/');
                                    }
                                })


                        })
                        .catch(error => console.log(error))
                })


        }

        // console.log(data.email);
        // console.log(data.name);
        // console.log(data.password);
        // console.log(data.photoURL);
        // console.log(data.role);


    };


    return (
        <>
            <div className="hero bg-base-100 min-h-[60vh] mt-3 mb-4 md:mb-10 lg:mb-20">
                <Helmet>
                    <title>CureMedix | Sign Up</title>
                </Helmet>

                <div className="hero-content flex-col lg:flex-row gap-4 md:gap-7 lg:gap-12 p-6 items-start">
                    {/* Left Side Text */}
                    <div className="flex flex-col justify-center text-center lg:text-left lg:w-1/2 space-y-4 mt-5 md:mt-8 lg:mt-40">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content">Join the CureMedix Community</h1>
                        <p className="text-lg text-base-content/85">
                            Sign up to access premium healthcare products and services. It is quick and easy.
                        </p>
                    </div>

                    {/* Right Side Form */}
                    <div className="card w-full max-w-lg mx-auto lg:w-96 bg-white shadow-xl rounded-xl p-8">

                        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-neutral">Name</span>
                                </label>
                                <input type="text"  {...register("name", { required: true })} name="name" placeholder="Name" className="input input-bordered" />
                                {errors.name && <span className="text-red-600">Name is required</span>}
                            </div>


                            {/* old photoUrl taking input */}
                            {/* <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Photo URL</span>
                                </label>
                                <input type="text"  {...register("photoURL", { required: true })} placeholder="Photo URL" className="input input-bordered" />
                                {errors.photoURL && <span className="text-red-600">Photo URL is required</span>}
                            </div> */}


                            {/* testing area */}
                            {/* Image Upload */}
                            <div className="form-control my-2.5">
                                <label className="label">
                                    <span className="label-text text-neutral">Upload Image*</span>
                                </label>
                                <input
                                    {...register("image", { required: "Image is required" })}
                                    type="file"
                                    className="file-input w-full max-w-xs"
                                />
                                {errors.image && <p className="text-red-500">{errors.image.message}</p>}
                            </div>

                            {/* testing area */}




                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-neutral">Email</span>
                                </label>
                                <input type="email"  {...register("email", { required: true })} name="email" placeholder="email" className="input input-bordered" />
                                {errors.email && <span className="text-red-600">Email is required</span>}
                            </div>

                            {/* Select Role */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-neutral">Select Role</span>
                                </label>
                                <select
                                    {...register("role", { required: "Role is required" })}
                                    className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="seller">Seller</option>
                                </select>
                                {errors.role && <span className="text-red-600">{errors.role.message}</span>}
                            </div>


                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-neutral">Password</span>
                                </label>
                                <input type="password"  {...register("password", {
                                    required: true,
                                    minLength: 6,
                                    maxLength: 20,
                                    pattern: /(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z])/
                                })} placeholder="password" className="input input-bordered" />
                                {errors.password?.type === 'required' &&
                                    <p className="text-red-600">Password is required</p>}
                                {errors.password?.type === 'minLength' && <p className="text-red-600">Password must be 6 characters</p>}
                                {errors.password?.type === 'maxLength' && <p className="text-red-600">Password must be less than 20 characters</p>}
                                {errors.password?.type === 'pattern' && <p className="text-red-600">Password must have one Uppercase one lower case, one number and one special character.</p>}
                                {/* <label className="label">
                                    <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                                </label> */}
                            </div>
                            <div className="form-control mt-6">
                                <input className="btn bg-emerald-600 text-white border-0 w-full py-2 mt-4 hover:text-neutral" type="submit" value="Sign Up" />
                            </div>
                        </form>



                        {/* Already have an account? */}
                        <div className="text-center mt-4">
                            <p className="text-neutral lg:text-lg">Already have an account?</p>
                            <Link to="/signIn">
                                <button className="btn btn-outline border-emerald-600 text-neutral mt-1.5 w-full">Sign In</button>
                            </Link>
                        </div>

                        {/* Social Login */}
                        <div className="mt-6">
                            <SocialLogin />
                        </div>
                    </div>

                </div>
            </div>
        </>
    );

};

export default SignUp;