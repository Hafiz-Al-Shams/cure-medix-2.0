import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useCart from "../../hooks/useCart";
import Swal from "sweetalert2";



const DetailsCard = () => {
    const { categoryName } = useParams();

    const [medicines, setMedicines] = useState([]);

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosSecure = useAxiosSecure();
    const [, refetch] = useCart();


    useEffect(() => {
        axios.get("https://cure-medix-server.vercel.app/medicines")
            .then(res => {
                const filteredMedicines = res.data.filter(medicine => medicine.category === categoryName);
                setMedicines(filteredMedicines);
            })
            .catch(error => {
                console.error("Error happened while fetching data:", error);
            });
    }, [categoryName]);




    const handleViewDetails = (medicine) => {
        Swal.fire({
            title: medicine.name,
            // text: `${medicine.description}`,
            imageUrl: medicine.image,
            imageWidth: 400,
            imageHeight: 250,
            imageAlt: medicine.name,
            html: `
                    <div class="text-left ml-10 space-y-1.5">
                        <p><strong>Category:</strong> ${medicine.category}</p>
                        <p><strong>Type:</strong> ${medicine.type}</p>
                        <p><strong>Price per Unit:</strong> $${medicine.price}</p>
                        <p><strong>Stock:</strong> ${medicine.stock}</p>
                        <p><strong>Discount:</strong> ${medicine.discount ? medicine.discountPercentage : "NA"}</p>
                        <p><strong>Description:</strong> ${medicine.description}</p>
                        <p><strong>Company:</strong> ${medicine.company}</p>
                        <p><strong>Seller:</strong> ${medicine.seller}</p>
                    </div>
                `,
            showCloseButton: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'px-4 py-2 rounded border text-gray-800 bg-gray-200 hover:bg-gray-100'
            }
            // draggable: true
        });
    };


    const handleAddToCart = (medicine) => {
        const { name, image, price, _id, type, description, seller, company } = medicine;
        if (user && user.email) {
            const cartItem = {
                medicineId: _id,
                email: user.email,
                name,
                image,
                price,
                type,
                description,
                seller,
                company
            }
            axiosSecure.post('/carts', cartItem)
                .then(res => {
                    // console.log(res.data)
                    if (res.data.insertedId) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: `${name} added to your cart`,
                            showConfirmButton: false,
                            timer: 1000
                        });
                        refetch();
                    }

                })
        }
        else {
            Swal.fire({
                title: "You are not Logged In",
                text: "Please login to add to the cart?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, login!"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/signIn', { state: { from: location } })
                }
            });
        }
    };



    return (
        <>
            <Helmet>
                <title>CureMedix | Category - {categoryName}</title>
            </Helmet>
            <div className="px-6 max-w-screen-2xl min-h-screen mx-auto pt-16 pb-24">
                <h1 className="text-3xl font-bold mb-6">Medicines for {categoryName}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2.5 lg:gap-6">
                    {medicines.map((medicine, index) => (
                        <div
                            key={medicine._id || index}
                            className="card bg-base-100 shadow-xl rounded-lg border border-white/25 max-w-xs mx-auto transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-2xl"
                        >
                            <figure className="w-full h-40 overflow-hidden rounded-t-lg">
                                <img
                                    src={medicine.image}
                                    alt={medicine.name}
                                    className="object-cover w-full h-full"
                                />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">{medicine.name}</h2>
                                <p className="text-base-content/90">
                                    {`Per unit: ${medicine.price}$ ${medicine.discountPercentage ? `(${medicine.discountPercentage}% discount)` : ""}`}
                                </p>
                                <p className="text-sm">Stock: {medicine.stock} boxes available today</p>
                                <p className="text-sm">Type: {medicine.type}</p>
                                <div className="card-actions justify-end mt-2">
                                    <button
                                        onClick={() => handleViewDetails(medicine)}
                                        className="btn btn-outline btn-xs"
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(medicine)}
                                        className="btn btn-xs bg-emerald-600 text-white border-0"
                                    >
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </>
    );
};

export default DetailsCard;