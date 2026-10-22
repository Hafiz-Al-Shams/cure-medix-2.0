import { FaTrash } from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { NavLink } from "react-router-dom";
import { useState } from "react";


const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;


const AllCategories = () => {

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const { data: categories = [], refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosSecure.get('/categories');
            return res.data;
        }
    });



    // testing area
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        // console.log(data);
        const imageFile = { image: data.image[0] }
        const res = await axiosPublic.post(image_hosting_api, imageFile, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
        // console.log(res.data);
        if (res.data.success) {
            const newCategory = {
                name: data.name,
                count: 0,
                image: res.data.data.display_url,
                details: data.details,
            }
            // console.log(newCategory);
            const categoryRes = await axiosSecure.post('/categories', newCategory);
            // console.log(categoryRes.data);

            if (categoryRes.data.insertedId) {

                // adding to new DBcollection
                const categoryImage = {
                    categoryName: data.name,
                    imageUrl: res.data.data.display_url,
                };
                await axiosSecure.post('/categoryImages', categoryImage);



                reset();
                refetch();
                setIsModalOpen(false);
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `${data.name} is added to the category`,
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        }


        // setIsModalOpen(false); // Closing modal after submission
    };


    // testing area





    const handleDelete = (category) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await axiosSecure.delete(`/categories/${category._id}`);

                if (res.data.deletedCount > 0) {

                    refetch();
                    Swal.fire({
                        position: "center-left",
                        icon: "success",
                        title: `${category.name} has been deleted`,
                        showConfirmButton: false,
                        timer: 1000
                    });
                }


            }
        });
    }


    return (
        <div className="p-6 max-w-screen-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 mt-7">All Categories</h1>

            {/* Add category Button */}
            <div className="my-10">
                <button className="btn btn-wide" onClick={() => setIsModalOpen(true)}>
                    Add Category
                </button>
            </div>

            <table className="min-w-full bg-base-100 border-collapse shadow-xl border border-gray-300 rounded-lg">
                <thead>
                    <tr className="bg-emerald-800/90 text-white">
                        <th className="py-3 px-4 border-b text-left">No.</th>
                        <th className="py-3 px-4 border-b text-left">Image</th>
                        <th className="py-3 px-4 border-b text-left">Name</th>
                        <th className="py-3 px-4 border-b text-left">Medicines</th>
                        <th className="py-3 px-4 border-b text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, i) => (
                        <tr
                            key={i}
                            className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b hover:bg-gray-100 transition duration-300`}
                        >
                            <td className="py-3 px-4">{i + 1}</td>
                            <td>
                                <div className="mask mask-squircle w-12 h-12">
                                    <img src={category.image} alt="image" />
                                </div>
                            </td>
                            <td className="py-3 px-4">{category.name}</td>

                            <td className="py-3 px-4">{category.count}</td>
                            <td className="py-3 px-4">

                                <NavLink to={`/dashboard/updateCategory/${category._id}`}>
                                    <button className="btn bg-blue-200 btn-sm">Update</button>
                                </NavLink>
                                <button
                                    onClick={() => handleDelete(category)}
                                    className="ml-5"
                                >
                                    <div className="text-xl text-red-500"
                                    >
                                        <FaTrash></FaTrash>
                                    </div>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>



            {/* add category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal modal-open">
                        <div className="modal-box p-10">
                            {/* <h2 className="mt-10 mb-5 text-3xl font-semibold">Add New Category</h2> */}

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Category Name*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Category Name"
                                        {...register("name", { required: "Category Name is required" })}
                                        className="input input-bordered w-full"
                                    />
                                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                                </div>

                                <div className="form-control my-4">
                                    <label className="label">
                                        <span className="label-text-alt">Category Details*</span>
                                    </label>
                                    <textarea
                                        {...register("details", { required: "Details are required" })}
                                        className="textarea textarea-bordered h-16"
                                        placeholder="Details"
                                    ></textarea>
                                    {errors.details && <p className="text-red-500">{errors.details.message}</p>}
                                </div>

                                <div className="form-control mb-5">
                                    <label className="label">
                                        <span className="label-text">Upload Image*</span>
                                    </label>
                                    <input
                                        {...register("image", { required: "Image is required" })}
                                        type="file"
                                        className="file-input w-full max-w-xs"
                                    />
                                    {errors.image && <p className="text-red-500">{errors.image.message}</p>}
                                </div>

                                <div className="modal-action flex justify-between mt-4">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success text-white">
                                        Add Category
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AllCategories;