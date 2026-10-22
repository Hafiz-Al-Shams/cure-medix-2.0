import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Link } from "react-router-dom";
import { FaEye, FaTrashAlt } from "react-icons/fa";

const Cart = () => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    const [cart, refetch] = useCart();
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (user?.email) {
            fetch(`https://cure-medix-server.vercel.app/carts?email=${user.email}`)
                .then(res => res.json())
                .then(data => setCartItems(data));
        }
    }, [user?.email]);

    // const increaseQuantity = (item) => {
    //     setCartItems(cartItems.map(cartItem =>
    //         cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
    //     ));
    //     updateCartItem(item._id, { ...item, quantity: item.quantity + 1 });
    // };

    // const decreaseQuantity = (item) => {
    //     if (item.quantity > 1) {
    //         setCartItems(cartItems.map(cartItem =>
    //             cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
    //         ));
    //         updateCartItem(item._id, { ...item, quantity: item.quantity - 1 });
    //     }
    // };

    // const removeItem = (item) => {
    //     fetch(`https://cure-medix-server.vercel.app/carts/${item._id}`, {
    //         method: 'DELETE',
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             if (data.deletedCount > 0) {
    //                 setCartItems(cartItems.filter(cartItem => cartItem._id !== item._id));
    //                 Swal.fire({
    //                     position: "center",
    //                     icon: "success",
    //                     title: 'item removed from your Cart',
    //                     showConfirmButton: false,
    //                     timer: 2000
    //                 });
    //             }
    //         })
    //         .catch(error => console.error('Error:', error));
    // };

    // const clearCart = () => {
    //     cartItems.forEach(item => removeItem(item));
    // };

    // const calculateTotal = () => {
    //     return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    // };

    // const updateCartItem = (id, updatedItem) => {
    //     fetch(`https://cure-medix-server.vercel.app/carts/${id}`, {
    //         method: 'PUT',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(updatedItem),
    //     })
    //         .catch(error => console.error('Error:', error));
    // };

    const handleViewDetails = (item) => {
        Swal.fire({
            title: item.name,
            // text: `${item.description}`,
            imageUrl: item.image,
            imageWidth: 400,
            imageHeight: 300,
            imageAlt: item.name,
            html: `
                        <div class="text-left ml-10 space-y-1.5">
                        <p><strong>Price per Unit:</strong> $${item.price}</p>
                        <p><strong>Type:</strong> ${item.type}</p>
                        <p><strong>Description:</strong> ${item.description}</p>
                        <p><strong>Company:</strong> ${item.company}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        
                    </div>
                    `,
            showCloseButton: true,
            // draggable: true
        });
    };

    const handleDelete = id => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {

                axiosSecure.delete(`/carts/${id}`)
                    .then(res => {
                        if (res.data.deletedCount > 0) {
                            refetch();
                            Swal.fire({
                                title: "Deleted!",
                                text: "Your order has been deleted.",
                                icon: "success"
                            });
                        }
                    })
            }
        });
    };

    const handleClearCart = async () => {
        try {
            const email = user.email;
            const deleteRes = await axiosSecure.delete(`/clearCarts`, { params: { email } });
            // console.log(deleteRes.data);
            if (deleteRes.data.deletedCount > 0) {
                refetch();
                Swal.fire({
                    title: "Cleared!",
                    text: "All Your Orders Have been Deleted",
                    icon: "success"
                });
            }

            // if (response.data.success) {
            //     console.log(response.data.message);
            //     console.log('successful');
            // } else {
            //     // console.log(response.data.message);
            // }
        } catch (error) {
            console.error("Failed to clear cart:", error);
        }
        // console.log(user.email);
    };


    return (
        <div className="px-6 pt-4 max-w-screen-xl mx-auto">
            {/* <h1 className="text-3xl font-bold mb-6">All({cartItems.length})</h1> */}
            <div className="flex justify-evenly mb-8 bg-base-200 py-5 items-center">
                <h2 className="text-4xl">Ordered Medicine: {cart.length}</h2>
                <h2 className="text-4xl">Total Price: {totalPrice}</h2>
                {cart.length ? <Link to="/dashboard/payment">
                    <button className="btn primary-btn btn-lg">Checkout</button>
                </Link> :
                    <button disabled className="btn btn-primary">Checkout</button>
                }

            </div>
            <div className="mb-5 ml-24">
                {/* <button className="btn btn-warning"
                    onClick={handleClearCart}
                >Clear Cart</button> */}

                {cart.length ? <button className="btn btn-neutral"
                    onClick={handleClearCart}
                >Clear Cart</button> :
                    <button disabled className="btn btn-warning">Clear Cart</button>
                }

            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr className="bg-emerald-600 text-white">
                            <th>
                                No.
                            </th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            cart.map((item, index) => <tr key={item._id}>
                                <th>
                                    {index + 1}
                                </th>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={item.image} alt="Avatar Tailwind CSS Component" />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {item.name}
                                </td>
                                <td>{1}</td>
                                <td>${item.price}</td>
                                <td className="py-3 px-4">
                                    <button
                                        className="mr-5 mt-2"
                                    >
                                        <div className="text-xl text-emerald-950 mr-2"
                                            onClick={() => handleViewDetails(item)}
                                        >
                                            <FaEye />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="text-lg">
                                        <FaTrashAlt className="text-red-600"></FaTrashAlt>
                                    </button>
                                </td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Cart;
