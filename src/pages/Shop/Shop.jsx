import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useCart from "../../hooks/useCart";
import { Helmet } from "react-helmet-async";
import useMedicines from "../../hooks/useMedicines";


const Shop = () => {
    // 🔥 Fetch medicines once
    const { medicines, isLoading, error } = useMedicines();

    // 🔥 Auth + cart hooks
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosSecure = useAxiosSecure();
    const [, refetch] = useCart();

    // 🔥 Local UI state
    const [resultMedicines, setResultMedicines] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortOrder, setSortOrder] = useState("");
    const [viewMode, setViewMode] = useState("card"); // "table" | "card"

    // 🔥 Guarded effect to seed state only once when data arrives
    useEffect(() => {
        if (resultMedicines.length === 0 && medicines.length > 0) {
            setResultMedicines(medicines);
            setCurrentPage(1);
        }
    }, [medicines, resultMedicines.length]);

    // 🔥 Loading / Error UI
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <span className="loading loading-bars loading-xl"></span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="alert alert-error my-10 mx-auto max-w-lg">
                <span>Error loading medicines: {error.message}</span>
            </div>
        );
    }

    // 🔥 Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMedicines = resultMedicines.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(resultMedicines.length / itemsPerPage);

    // 🔥 Handlers
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };
    const handleViewDetails = (med) => {
        Swal.fire({
            title: med.name,
            imageUrl: med.image,
            imageWidth: 400,
            imageHeight: 250,
            imageAlt: med.name,
            html: `
          <div class="text-left ml-10 space-y-1.5">
            <p><strong>Category:</strong> ${med.category}</p>
            <p><strong>Type:</strong> ${med.type}</p>
            <p><strong>Price per Unit:</strong> $${med.price}</p>
            <p><strong>Stock:</strong> ${med.stock}</p>
            <p><strong>Discount:</strong> ${med.discountPercentage ?? "NA"}</p>
            <p><strong>Description:</strong> ${med.description}</p>
            <p><strong>Company:</strong> ${med.company}</p>
            <p><strong>Seller:</strong> ${med.seller}</p>
          </div>
        `,
            showCloseButton: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'px-4 py-2 rounded border text-gray-800 bg-gray-200 hover:bg-gray-100'
            }
        });
    };
    const handleAddToCart = (med) => {
        if (user?.email) {
            const { name, image, price, _id, type, description, seller, company } =
                med;
            axiosSecure
                .post("/carts", {
                    medicineId: _id,
                    email: user.email,
                    name,
                    image,
                    price,
                    type,
                    description,
                    seller,
                    company,
                })
                .then((res) => {
                    if (res.data.insertedId) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: `${name} added to your cart`,
                            showConfirmButton: false,
                            timer: 1000,
                        });
                        refetch();
                    }
                });
        } else {
            Swal.fire({
                title: "You are not Logged In",
                text: "Please login to add to the cart?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, login!",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/signIn", { state: { from: location } });
                }
            });
        }
    };
    const handleSearch = async (query) => {
        try {
            const res = await fetch(
                `https://cure-medix-server.vercel.app/searchMedicines?search=${encodeURIComponent(
                    query
                )}`
            );
            const data = await res.json();
            setResultMedicines(data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
        }
    };
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (debounceTimer) clearTimeout(debounceTimer);
        setDebounceTimer(setTimeout(() => handleSearch(value), 300));
    };
    const handleSortByName = () => {
        setResultMedicines((prev) =>
            [...prev].sort((a, b) => a.name.localeCompare(b.name))
        );
    };
    const handleSortByPrice = (order) => {
        setResultMedicines((prev) =>
            [...prev].sort((a, b) =>
                order === "asc" ? a.price - b.price : b.price - a.price
            )
        );
        setSortOrder(order);
    };

    // 🔥 Render
    return (
        <div className="px-6 pt-2.5 max-w-screen-2xl mx-auto pb-24">
            <Helmet>
                <title>CureMedix | Shop</title>
            </Helmet>

            <h1 className="text-3xl font-bold mb-2.5 mt-5">
                Shop Your Necessary Medicines Here
            </h1>

            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                {/* Sort */}
                <div className="flex flex-wrap gap-2">
                    <button className="btn primary-btn" onClick={handleSortByName}>
                        Sort by Name (A-Z)
                    </button>
                    <select
                        className="select select-bordered border-2 border-emerald-500 text-lg"
                        value={sortOrder}
                        onChange={(e) => handleSortByPrice(e.target.value)}
                    >
                        <option value="">Sort by Price</option>
                        <option value="asc">Low to High</option>
                        <option value="desc">High to Low</option>
                    </select>
                </div>

                {/* View Mode Toggle */}
                <select
                    className="select select-bordered w-auto"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                >
                    <option value="table">Table View</option>
                    <option value="card">Card View</option>
                </select>

                {/* Search */}
                <div className="w-full sm:w-auto">
                    <h5 className="text-base-content font-medium mb-1">
                        Search by Name or Type
                    </h5>
                    <label className="input input-bordered border-emerald-800 input-primary flex items-center gap-2">
                        <input
                            type="text"
                            name="search"
                            className="grow"
                            placeholder="Search Medicines"
                            value={searchValue}
                            onChange={handleInputChange}
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-6 w-6 opacity-95 text-neutral-content"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </label>
                </div>
            </div>

            {/* Table View */}
            {viewMode === "table" && (
                <table className="min-w-full bg-base-100 border-collapse shadow-xl border border-gray-300 rounded-lg">
                    <thead>
                        <tr className="bg-emerald-800/90 text-white">
                            {[
                                "No.",
                                "Name",
                                "Price",
                                "Discount",
                                "Stock",
                                "Type",
                                "Actions",
                            ].map((title) => (
                                <th
                                    key={title}
                                    className="py-3 px-4 border-b text-left"
                                >
                                    {title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentMedicines.map((med, i) => (
                            <tr
                                key={med._id || i}
                                className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } border-b hover:bg-gray-100 transition duration-300 text-neutral`}
                            >
                                <td className="py-3 px-4">
                                    {indexOfFirstItem + i + 1}
                                </td>
                                <td className="py-3 px-4">{med.name}</td>
                                <td className="py-3 px-4">${med.price}</td>
                                <td className="py-3 px-4">
                                    {med.discountPercentage ?? "NA"}
                                </td>
                                <td className="py-3 px-4">{med.stock}</td>
                                <td className="py-3 px-4">{med.type}</td>
                                <td className="py-3 px-4">
                                    <button
                                        className="mr-5 mt-2"
                                        onClick={() => handleViewDetails(med)}
                                    >
                                        <div className="text-xl text-emerald-950">
                                            <FaEye />
                                        </div>
                                    </button>
                                    <button
                                        className="btn btn-sm bg-emerald-600 text-white border-0"
                                        onClick={() => handleAddToCart(med)}
                                    >
                                        Select
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Card View */}
            {viewMode === "card" && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2.5 lg:gap-6">
                    {currentMedicines.map((med, i) => (
                        <div
                            key={med._id || i}
                            className="card bg-base-100 shadow-xl rounded-lg border border-white/25 max-w-xs mx-auto transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-2xl"
                        // style={{ backfaceVisibility: 'hidden' }}

                        // transform scale-100 transition duration-400 ease-in-out hover:scale-105 will-change-transform
                        // transition-transform duration-300 ease-in-out hover:scale-105

                        >
                            <figure className="w-full h-40 overflow-hidden rounded-t-lg">
                                <img
                                    src={med.image}
                                    alt={med.name}
                                    className="object-cover w-full h-full"
                                />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">{med.name}</h2>
                                <p className="text-base-content/90">
                                    {`Per unit: ${med.price}$ (${med.discountPercentage ?? ""} discount price)`}
                                </p>
                                <p className="text-sm">Stock: {med.stock} boxes available today</p>
                                <p className="text-sm">Type: {med.type}</p>
                                <div className="card-actions justify-end mt-2">
                                    <button
                                        onClick={() => handleViewDetails(med)}
                                        className="btn btn-outline btn-xs"
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(med)}
                                        className="btn btn-xs bg-emerald-600 text-white border-0"
                                    >
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 px-1 space-y-4 md:space-y-0">
                <select
                    className="border p-2 rounded-md"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                >
                    {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                            {n} per page
                        </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2">
                    <button
                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? "bg-gray-300" : ""}`}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Shop;