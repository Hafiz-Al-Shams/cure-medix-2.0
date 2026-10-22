import { Helmet } from "react-helmet-async";
import useAuth from "../hooks/useAuth";
import logo from '../../src/assets/logo.png';
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";


const InvoicePage = () => {
    // const invoiceRef = useRef();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    // const navigate = useNavigate();

    const { data: payments = [] } = useQuery({
        queryKey: ['payments', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments/${user.email}`)
            return res.data;
        }
    })


    const handlePrint = () => {

        const invoiceElement = document.getElementById("invoice");

        if (!invoiceElement) {
            Swal.fire({
                title: 'Error!',
                text: 'Invoice content not found!',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        html2pdf()
            .set({
                margin: 10,
                filename: `Invoice_${user?.displayName || 'Customer'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(invoiceElement)
            .save()
            .then(() => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Downloading PDF Executed successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            })
            .catch((err) => {
                console.error("PDF Download Error:", err);
                Swal.fire({
                    title: 'Opps!!!',
                    text: 'Failed to generate PDF!!!',
                    icon: 'error',
                    confirmButtonText: 'ok'
                });
            });




        // older code
        // content: () => invoiceRef.current,
        // documentTitle: "Invoice",
        // Swal.fire({
        //     title: 'Opps!!!',
        //     text: 'useReactToPrint not working!!',
        //     icon: 'error',
        //     confirmButtonText: 'ok'
        // });
        // navigate('/dashboard/paymentHistory');
    }

    if (!payments.length || !user) {
        return (
            <div className="flex justify-center items-center h-screen text-4xl">
                <Helmet>
                    <title>CureMedix | Invoice</title>
                </Helmet>
                Loading...</div>
        );
    }

    return (
        <>
            <Helmet>
                <title>CureMedix | Invoice</title>
            </Helmet>
            <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 px-4 pt-4 pb-20">

                <h2 className="text-4xl font-bold my-3">Invoice</h2>

                <div id="invoice" className="w-full max-w-3xl bg-white shadow-xl rounded-lg p-8">
                    {payments.map((payment) => (
                        <div key={payment._id}>
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <img src={logo} alt="Website Logo" className="h-16" />
                                <div className="text-right">
                                    <p className="text-sm text-gray-900">Transaction ID: {payment.transactionId}</p>
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="mb-6 flex items-center space-x-4">
                                <img
                                    src={user.photoURL}
                                    alt={`${user.displayName}'s photo`}
                                    className="w-16 h-16 rounded-full border"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold">Customer Information</h3>
                                    <p className="text-sm text-gray-600">Name: {user.displayName}</p>
                                    <p className="text-sm text-gray-600">Email: {user.email}</p>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold">Purchase Details</h3>
                                <p className="text-sm text-gray-600">
                                    Transaction Date: {new Date(payment.date).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">Total Price: ${payment.price}</p>
                                <p className="text-sm text-green-600">
                                    Payment Received successfully
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="text-center border-t pt-4 mt-6 text-sm text-gray-800">
                                <p>Thank you for your purchase!</p>
                                <p>CureMedix Company Limited | www.curemedix-company.com</p>
                            </div>
                            <div className="divider divider-secondary"></div>
                        </div>
                    ))}
                </div>

                {/* Print Button */}
                <button
                    onClick={handlePrint}
                    className="mt-6 btn bg-[#57CEA7]"
                >
                    Download PDF
                </button>
            </div>
        </>
    );
};

export default InvoicePage;