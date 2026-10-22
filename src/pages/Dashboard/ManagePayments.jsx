import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";



const ManagePayments = () => {

    const axiosSecure = useAxiosSecure();

    const { data: payments = [], refetch } = useQuery({
        queryKey: ['manage-payments'],
        queryFn: async () => {
            const res = await axiosSecure.get('/manage-payments');
            return res.data;
        }
    });



    const handleAcceptPayment = async (transactionId) => {




        axiosSecure.patch(`/manage-payments/${transactionId}`)
            .then(res => {
                // console.log(res.data);
                if (res.data.modifiedCount > 0) {
                    refetch();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `Payment Accepted!`,
                        showConfirmButton: false,
                        timer: 1000
                    });
                }
            })

    };



    return (

        <>
            <h3 className="text-3xl font-semibold bg-emerald-200 p-4 ml-20 my-10">Accept pending Payments:</h3>
            <div className="overflow-x-auto w-10/12 mx-auto mb-16">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th className="">No.</th>
                            <th>Transaction ID</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, i) => (
                            <tr key={payment.transactionId}>
                                <td className="">{i + 1}</td>
                                <td>{payment.transactionId}</td>
                                <td>{payment.status}</td>
                                <td>
                                    {payment.status === 'pending' ? (
                                        <button
                                            onClick={() => handleAcceptPayment(payment.transactionId)}
                                            className="btn btn-success"
                                        >
                                            Accept Payment
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-success"
                                            disabled
                                        >
                                            Payment Accepted
                                        </button>
                                    )
                                    }

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ManagePayments;