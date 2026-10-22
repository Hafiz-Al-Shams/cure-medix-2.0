import { Helmet } from "react-helmet-async";
import MarqueeText from "../MarqueeText";
import Swal from "sweetalert2";
import { useState } from "react";
import { useForm } from "react-hook-form";
// import { useEffect } from "react";
// import Swal from "sweetalert2";



const OnlineDoctor = () => {

    // State to control modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initialize react-hook-form with reset function to clear form fields
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    // Form submission handler for online doctor booking
    const onSubmit = (data) => {
        // Show processing SweetAlert with 5-second timer
        Swal.fire({
            title: 'Processing...',
            html: 'We are processing your request. Please wait <b></b> seconds.',
            timer: 1600,
            timerProgressBar: true,

            didOpen: () => {
                Swal.showLoading();
                // Change loader color to emerald (emerald-600: #059669)
                // const spinner = document.querySelector('.swal2-spinner');
                // if (spinner) {
                //     spinner.style.borderTopColor = '#059669';
                //     spinner.style.borderRightColor = '#059669';
                //     spinner.style.borderBottomColor = '#059669';
                //     spinner.style.borderLeftColor = 'transparent';
                // }
                const b = Swal.getHtmlContainer().querySelector('b');
                let timerInterval = setInterval(() => {
                    b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 100);
                // Clear interval when SweetAlert closes
                Swal.willClose = () => {
                    clearInterval(timerInterval);
                };
            },
            customClass: {
                loader: 'emerald-loader'
            }
        }).then((result) => {
            // After timer, show success message
            if (result.dismiss === Swal.DismissReason.timer) {
                Swal.fire({
                    title: 'Request Received!',
                    text: 'Thank you! You will be contacted soon via phone or email.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'px-4 py-2 rounded border text-gray-800 bg-white hover:bg-gray-100'
                    }
                });
                // Clear all input fields after successful submission
                reset();
                // Close modal after success
                setIsModalOpen(false);
            }
        });
    };

    // Handler for inpatient doctor button click
    const handleInpatientClick = () => {
        // Show searching SweetAlert with 5-second timer
        Swal.fire({
            title: 'Searching...',
            html: 'Looking for doctors near you. Please wait <b></b> seconds.',
            timer: 2500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                // Change loader color to emerald (emerald-600: #059669)
                // const spinner = document.querySelector('.swal2-spinner');
                // if (spinner) {
                //     spinner.style.borderTopColor = '#059669';
                //     spinner.style.borderRightColor = '#059669';
                //     spinner.style.borderBottomColor = '#059669';
                //     spinner.style.borderLeftColor = 'transparent';
                // }
                const b = Swal.getHtmlContainer().querySelector('b');
                let timerInterval = setInterval(() => {
                    b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 100);
                // Clear interval when SweetAlert closes
                Swal.willClose = () => {
                    clearInterval(timerInterval);
                };
            },
            customClass: {
                loader: 'emerald-loader'
            }
        }).then((result) => {
            // After timer, show no doctors available message
            if (result.dismiss === Swal.DismissReason.timer) {
                Swal.fire({
                    title: "No Doctors Available",
                    text: "Sorry, there are no doctors available near you at this moment.",
                    icon: 'error',
                    confirmButtonText: 'OK',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'px-4 py-2 rounded border text-gray-800 bg-white hover:bg-gray-100'
                    }
                });
            }
        });
    };

    return (
        <>
            <Helmet>
                <title>CureMedix | Online Doctor</title>
            </Helmet>
            <div className="px-16 pb-12 md:pb-16 lg:pb-24">
                <div className="flex flex-col lg:flex-row items-start justify-between px-4 sm:px-8 py-12 min-h-screen">
                    {/* Text Section */}
                    <div className="lg:w-1/2 space-y-4 px-4 sm:px-6">
                        <MarqueeText />
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            Goodbye waiting room. <br /> Hello online doctor
                        </h2>
                        <p className="text-gray-600">
                            Speak to a qualified specialist from Germany online in just a few
                            minutes via CureMedix. You can receive a sick note and electronic
                            prescription directly via the app.
                        </p>
                        <div className="space-x-0 sm:space-x-4 mt-4 sm:mt-6 flex flex-col sm:flex-row">
                            {/* Button to open modal */}
                            <button
                                className="btn bg-emerald-600 text-gray-100 w-full sm:w-auto mb-2 sm:mb-0"
                                onClick={() => setIsModalOpen(true)}
                            >
                                To the CureMedix Online Doctor
                            </button>
                            {/* Button for inpatient doctor search */}
                            <button
                                className="btn btn-ghost w-full sm:w-auto"
                                onClick={handleInpatientClick}
                            >
                                Find an inpatient doctor near you
                            </button>
                        </div>
                    </div>
                    {/* Image Section */}
                    <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center px-4 sm:px-6">
                        <img
                            src="https://i.ibb.co/b5zPg2by/online-doctor.jpg"
                            alt="Online Doctor"
                            className="rounded-lg shadow-lg w-80 sm:w-96 lg:w-104"
                        />
                    </div>
                </div>
                {/* Modal for online doctor booking with z-50 to ensure it appears above marquee */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="modal modal-open">
                            <div className="modal-box p-10">
                                <form onSubmit={handleSubmit(onSubmit)}>


                                    {/* Full Name */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Full Name*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            {...register("fullName", { required: "Full Name is required" })}
                                            className="input input-bordered w-full"
                                        />
                                        {errors.fullName && (
                                            <p className="text-red-500">{errors.fullName.message}</p>
                                        )}
                                    </div>

                                    {/* Age */}
                                    <div className="form-control my-4">
                                        <label className="label">
                                            <span className="label-text">Age*</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter your age"
                                            {...register("age", { required: "Age is required" })}
                                            className="input input-bordered w-full"
                                        />
                                        {errors.age && (
                                            <p className="text-red-500">{errors.age.message}</p>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Gender*</span>
                                        </label>
                                        <select
                                            {...register("gender", { required: "Gender is required" })}
                                            className="select select-bordered w-full"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.gender && (
                                            <p className="text-red-500">{errors.gender.message}</p>
                                        )}
                                    </div>

                                    {/* Contact Number */}
                                    <div className="form-control my-4">
                                        <label className="label">
                                            <span className="label-text">Contact Number*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., +1234567890"
                                            {...register("contact", { required: "Contact number is required" })}
                                            className="input input-bordered w-full"
                                        />
                                        {errors.contact && (
                                            <p className="text-red-500">{errors.contact.message}</p>
                                        )}
                                    </div>

                                    {/* Email Address */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Email Address*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            {...register("email", { required: "Email is required" })}
                                            className="input input-bordered w-full"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Symptoms/Reason for Visit */}
                                    <div className="form-control my-4">
                                        <label className="label">
                                            <span className="label-text-alt">Symptoms / Reason for Visit*</span>
                                        </label>
                                        <textarea
                                            {...register("symptoms", { required: "Please describe your symptoms" })}
                                            className="textarea textarea-bordered h-20"
                                            placeholder="Describe your symptoms or reason for consultation"
                                        ></textarea>
                                        {errors.symptoms && (
                                            <p className="text-red-500">{errors.symptoms.message}</p>
                                        )}
                                    </div>

                                    {/* Allergies / Medical History */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text-alt">Allergies / Medical History</span>
                                        </label>
                                        <textarea
                                            {...register("medicalHistory")}
                                            className="textarea textarea-bordered h-20"
                                            placeholder="List any known allergies or medical history"
                                        ></textarea>
                                    </div>

                                    {/* Preferred Date */}
                                    <div className="form-control my-4">
                                        <label className="label">
                                            <span className="label-text">Preferred Date*</span>
                                        </label>
                                        <input
                                            type="date"
                                            {...register("preferredDate", { required: "Preferred date is required" })}
                                            className="input input-bordered w-full"
                                        />
                                        {errors.preferredDate && (
                                            <p className="text-red-500">{errors.preferredDate.message}</p>
                                        )}
                                    </div>

                                    {/* Preferred Time */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Preferred Time*</span>
                                        </label>
                                        <input
                                            type="time"
                                            {...register("preferredTime", { required: "Preferred time is required" })}
                                            className="input input-bordered w-full"
                                        />
                                        {errors.preferredTime && (
                                            <p className="text-red-500">{errors.preferredTime.message}</p>
                                        )}
                                    </div>

                                    {/* Location */}
                                    <div className="form-control my-4">
                                        <label className="label">
                                            <span className="label-text-alt">Your Location*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="City, State or Location"
                                            {...register("location", { required: "Location is required" })}
                                            className="input input-bordered w-full"
                                        />
                                        {errors.location && (
                                            <p className="text-red-500">{errors.location.message}</p>
                                        )}
                                    </div>

                                    {/* Insurance Provider */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Insurance Provider</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Insurance (if any)"
                                            {...register("insurance")}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="modal-action flex justify-between mt-4">
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setIsModalOpen(false)} // close modal on cancel
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-success text-white">
                                            Submit
                                        </button>
                                    </div>




                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OnlineDoctor;