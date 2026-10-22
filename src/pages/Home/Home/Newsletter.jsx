import { FiMail } from "react-icons/fi";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { useState } from "react";
import Swal from "sweetalert2";



const Newsletter = () => {

    const [email, setEmail] = useState("");

    const validateEmail = (email) => {
        // Basic email validation: something@something.something
        const re = /^\S+@\S+\.\S+$/;
        return re.test(email);
    };

    const handleSubscribe = () => {
        if (!email.trim()) {
            // Empty input → immediate warning
            Swal.fire({
                title: "Oops!",
                text: "Please enter your email to subscribe.",
                icon: "warning",
                confirmButtonText: "OK",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "px-4 py-2 rounded border text-gray-800 bg-white hover:bg-gray-100"
                }
            });
            return;
        }

        if (!validateEmail(email)) {
            // Invalid format → immediate error
            Swal.fire({
                title: "Invalid Email",
                text: "Please enter a valid email address (e.g. demo@example.com).",
                icon: "error",
                confirmButtonText: "Got it",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "px-4 py-2 rounded border text-gray-800 bg-white hover:bg-gray-100"
                }
            });
            return;
        }

        // Valid email → delay 5 seconds then show success
        Swal.fire({
            title: "Processing...",
            html: "Subscribing you in <b></b> seconds.",
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const b = Swal.getHtmlContainer().querySelector("b");
                let timerInterval = setInterval(() => {
                    b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 100);
                Swal.willClose = () => {
                    clearInterval(timerInterval);
                };
            },
            customClass: {
                loader: 'emerald-loader'
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                Swal.fire({
                    title: "Subscribed!",
                    text: `You are now subscribed with ${email}!`,
                    icon: "success",
                    confirmButtonText: "Great",
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: "px-4 py-2 rounded border text-gray-800 bg-white hover:bg-gray-100"
                    }
                });
                setEmail("");
            }
        });
    };


    const themeClasses = useThemeClasses();


    return (
        <div>
            <div className={`bg-gradient-to-r from-emerald-200/90 to-emerald-600/85 text-base-100 px-6 py-5 md:px-8 md:py-7 lg:py-16 shadow-lg flex flex-col items-center text-center ${themeClasses}`}>
                {/* Heading */}
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 lg:mb-4">
                    Subscribe to Our Weekly Newsletter
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-base-300 max-w-lg mb-2.5 lg:mb-6">
                    Get the latest updates, promotions, and medicines insights delivered straight to your inbox.
                </p>

                {/* Input & Button */}
                <div className="flex flex-col sm:flex-row w-full max-w-md sm:max-w-lg md:max-w-xl gap-3">
                    <div className="relative w-full">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input input-bordered w-full pl-10 text-gray-900 text-sm md:text-base"
                        />
                    </div>
                    <button className="btn px-6 py-2" onClick={handleSubscribe}>
                        Subscribe
                    </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs md:text-sm text-base-100/90 mt-4">
                    We respect your privacy. Unsubscribe anytime.
                </p>
            </div>
        </div>
    );
};

export default Newsletter;