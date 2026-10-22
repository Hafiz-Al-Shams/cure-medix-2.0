import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Helmet } from "react-helmet-async";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;


const UpdateCategory = () => {

    const { name, details, image, _id } = useLoaderData();
    const navigate = useNavigate();

    // console.log(name, image, details);
    const { register, handleSubmit, reset } = useForm();

    const axiosPublic = useAxiosPublic();
    const axiosSecure = useAxiosSecure();

    const onSubmit = async (data) => {
        // console.log(data);
        const imageFile = { image: data.image[0] };
        const res = await axiosPublic.post(image_hosting_api, imageFile, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
        // console.log(res.data);
        if (res.data.success) {
            const updatedCategory = {
                name: data.name,
                image: res.data.data.display_url,
                details: data.details,
            }
            // console.log(updatedCategory);
            const cateUpdateRes = await axiosSecure.patch(`/categories/${_id}`, updatedCategory);
            // console.log(cateUpdateRes.data);
            if (cateUpdateRes.data.modifiedCount > 0) {

                // patching to new DBcollection
                const updatedImage = {
                    // categoryName: name,
                    imageUrl: res.data.data.display_url,
                };
                await axiosSecure.patch(`/categoryImages/${name}`, updatedImage);
                reset();
                Swal.fire({
                    position: "top",
                    icon: "success",
                    title: `UPDATED`,
                    showConfirmButton: false,
                    timer: 1000
                });
                navigate('/dashboard/allCategories');
            }
        }
        // console.log(res.data.data.display_url);
        // console.log(res.data.display_url);
        // console.log('with image url', res.data);
    };


    return (
        <>
            <Helmet>
                <title>CureMedix | Update Category</title>
            </Helmet>
            <div className="max-w-screen-lg mx-auto">
                <h3 className="text-4xl my-16 font-semibold">Update {name}</h3>
                <div className="mb-16">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Category Name*</span>
                            </label>
                            <input
                                defaultValue={name}
                                type="text"
                                // placeholder={loadedCategory.name}
                                {...register("name", { required: true })}
                                className="input input-bordered w-full" />

                        </div>
                        <div className="form-control my-4">
                            <label className="label">
                                <span className="label-text-alt">Category Details</span>
                            </label>
                            <textarea defaultValue={details} {...register("details", { required: true })} className="textarea textarea-bordered h-16"></textarea>
                        </div>
                        <div className="form-control mb-5">
                            <input {...register("image", { required: true })} type="file" className="file-input w-full max-w-xs" />
                        </div>
                        <button className="btn btn-success text-white">
                            Update Category
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UpdateCategory;