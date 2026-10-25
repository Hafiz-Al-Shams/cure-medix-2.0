import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiShoppingCart } from "react-icons/fi";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCart from "../../../hooks/useCart";

const Discount = () => {
    const [medicines, setMedicines] = useState([]);
    const swiperRef = useRef(null); // holds the swiper instance (used by autoplay + arrow buttons)

    // 🔥 Auth + cart hooks (same as Shop page)
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosSecure = useAxiosSecure();
    const [, refetch] = useCart();

    // Load only discounted medicines (unchanged logic)
    useEffect(() => {
        fetch("https://cure-medix-server.vercel.app/medicines")
            .then((response) => response.json())
            .then((data) => setMedicines(data.filter((medicine) => medicine.discount)));
    }, []);

    // Restart autoplay after slides arrive (unchanged fix)
    useEffect(() => {
        if (medicines.length > 0 && swiperRef.current) {
            const swiper = swiperRef.current;
            setTimeout(() => {
                swiper.update();
                swiper.autoplay?.start();
            }, 100);
        }
    }, [medicines]);

    // ✅ NEW: Add to cart – same logic as the Shop page
    const handleAddToCart = (med, quantity = 1) => {
        if (user?.email) {
            const { name, image, price, _id, type, description, seller, company } = med;
            axiosSecure
                .post("/carts", { medicineId: _id, email: user.email, name, image, price, type, description, seller, company, quantity })
                .then((res) => {
                    if (res.data.insertedId) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: `${name} added to your cart`,
                            showConfirmButton: false,
                            timer: 1000,
                        });
                        refetch(); // refresh navbar cart count
                    }
                })
                .catch((err) => {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Something went wrong",
                        text: "Could not add this medicine to your cart. Please try again.",
                    });
                });
        } else {
            // Not logged in -> popup -> redirect to login
            Swal.fire({
                title: "You are not Logged In",
                text: "Please login to add to the cart?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, login!",
                buttonsStyling: false,
                reverseButtons: true,
                customClass: {
                    popup: "rounded-2xl",
                    title: "text-xl font-bold",
                    actions: "gap-3",
                    confirmButton: "px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors",
                    cancelButton: "px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium transition-colors",
                },
            }).then((result) => {
                if (result.isConfirmed) navigate("/signIn", { state: { from: location } });
            });
        }
    };

    return (
        <section className="bg-base-200/60 py-12 lg:py-16">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Heading + custom prev/next arrows */}
                <div className="flex items-end justify-between">
                    <div>
                        <span className="text-[10px] font-semibold bg-red-100 text-red-500 rounded px-2 py-0.5">EXCLUSIVE SAVINGS</span>
                        <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-base-content">Medicines with Super Discounts!</h2>
                    </div>
                    <div className="flex gap-2">
                        <button aria-label="Previous" onClick={() => swiperRef.current?.slidePrev()} className="btn btn-sm btn-circle btn-outline border-base-content/20"><FiArrowLeft /></button>
                        <button aria-label="Next" onClick={() => swiperRef.current?.slideNext()} className="btn btn-sm btn-circle btn-outline border-base-content/20"><FiArrowRight /></button>
                    </div>
                </div>

                <Swiper
                    onSwiper={(swiper) => { swiperRef.current = swiper; }}
                    slidesPerView={1}
                    spaceBetween={20}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                    }}
                    autoplay={{ delay: 1780, disableOnInteraction: false, pauseOnMouseEnter: false }}
                    modules={[Autoplay]}
                    className="mt-6"
                >
                    {medicines.map((medicine, index) => (
                        <SwiperSlide key={index} className="!h-auto">
                            <div className="relative bg-base-100 border border-base-content/10 rounded-2xl p-4 h-full flex flex-col shadow-sm">
                                <span className="absolute left-4 top-4 z-[1] text-[10px] font-semibold bg-red-500 text-white rounded px-2 py-0.5 uppercase">
                                    {medicine.discountPercentage} discount
                                </span>
                                <div className="h-44 rounded-xl bg-base-200 flex items-center justify-center overflow-hidden">
                                    <img src={medicine.image} alt={medicine.name} className="object-cover h-full w-full" />
                                </div>
                                <h3 className="mt-3 font-semibold text-base-content">{medicine.name}</h3>
                                {/* Shows price only if your API provides it */}
                                {medicine.price && <p className="text-lg font-bold text-emerald-600 mt-auto pt-2">${medicine.price}</p>}
                                {/* ✅ Now a real, active Add To Cart button */}
                                <button
                                    onClick={() => handleAddToCart(medicine, 1)}
                                    className="btn btn-sm mt-3 border-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full"
                                >
                                    <FiShoppingCart /> Add To Cart
                                </button>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default Discount;