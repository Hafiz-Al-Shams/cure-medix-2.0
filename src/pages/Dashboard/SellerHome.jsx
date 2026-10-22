// import useAuth from "../../hooks/useAuth";

import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";


const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;


const SellerHome = () => {
    const { user } = useAuth();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const axiosPublic = useAxiosPublic();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch banner requests for the current seller
    const { data: banners = [], refetch } = useQuery({
        queryKey: ['banners', user?.email],
        queryFn: async () => {
            const res = await axiosPublic.get(`/banners/seller/${user.email}`);
            return res.data;
        }
    });

    useEffect(() => {
        // Placeholder for future useEffect if needed
    }, []);

    const onSubmit = async (data) => {
        const imageFile = { image: data.image[0] };
        const res = await axiosPublic.post(image_hosting_api, imageFile, {
            headers: {
                'content-type': 'multipart/form-data',
            },
        });

        if (res.data.success) {
            const bannerRequest = {
                image: res.data.data.display_url,
                reason: data.reason,
                isBanner: false, // Default value, to be changed by admin
                seller: user.email,
            };

            const requestRes = await axiosPublic.post('/banners', bannerRequest);

            if (requestRes.data.insertedId) {
                reset();
                setIsModalOpen(false);
                refetch(); // Refresh the banner list
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Banner request submitted successfully",
                    showConfirmButton: false,
                    timer: 1000,
                });
            } else {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Failed to submit banner request",
                    showConfirmButton: false,
                    timer: 1000,
                });
            }
        } else {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Failed to upload image",
                showConfirmButton: false,
                timer: 1000,
            });
        }
    };

    return (
        <>
            <div className="px-10 mb-24">
                <div className="my-10 text-center text-4xl font-semibold">
                    Welcome Home Seller
                </div>
                <div className="my-10">
                    <button className="btn btn-wide" onClick={() => setIsModalOpen(true)}>
                        Request Homepage Banner
                    </button>
                </div>

                {/* Banner Requests Display */}
                <div className="my-10">
                    {banners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                            {banners.map((banner) => (
                                <div key={banner._id} className="card bg-base-100 shadow-xl transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-2xl">
                                    <figure>
                                        <img src={banner.image} alt="Banner" className="w-full h-48 object-cover" />
                                    </figure>
                                    <div className="card-body">
                                        <p>
                                            {/* Status: {banner.isBanner ? 'Accepted' : 'Pending'} */}
                                            Status: {banner.isBanner ? (
                                                <span className="text-green-400">Accepted</span>
                                            ) : (
                                                <span className="text-yellow-400">Pending</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No banner requests yet.</p>
                    )}
                </div>

                {/* Modal */}
                <div>
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="modal modal-open">
                                <div className="modal-box p-10">
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        {/* Image Upload */}
                                        <div className="form-control mb-5">
                                            <label className="label">
                                                <span className="label-text">Upload Banner Image*</span>
                                            </label>
                                            <input
                                                {...register("image", { required: "Image is required" })}
                                                type="file"
                                                className="file-input w-full max-w-xs"
                                            />
                                            {errors.image && <p className="text-red-500">{errors.image.message}</p>}
                                        </div>

                                        {/* Reason for Advertisement */}
                                        <div className="form-control my-4">
                                            <label className="label">
                                                <span className="label-text-alt">Detail Reason for Advertisement or Specialty of Medicine*</span>
                                            </label>
                                            <textarea
                                                {...register("reason", { required: "Reason is required" })}
                                                className="textarea textarea-bordered h-16"
                                                placeholder="Explain why your product should be featured"
                                            ></textarea>
                                            {errors.reason && <p className="text-red-500">{errors.reason.message}</p>}
                                        </div>

                                        {/* Modal Actions */}
                                        <div className="modal-action flex justify-between mt-4">
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-success text-white">
                                                Submit Request
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SellerHome;