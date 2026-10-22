import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaTrashAlt, FaUsers } from "react-icons/fa";
import Swal from "sweetalert2";
// import useAuth from "../../hooks/useAuth";



const AllUsers = () => {
    // const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { data: users = [], refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        }
    })

    const handleMakeAdmin = user => {
        axiosSecure.patch(`/users/admin/${user._id}`)
            .then(res => {
                // console.log(res.data);
                if (res.data.modifiedCount > 0) {
                    refetch();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `You made ${user.name} an Admin!`,
                        showConfirmButton: false,
                        timer: 1000
                    });
                }
            })
    }

    const handleMakeUser = user => {
        axiosSecure.patch(`/users/makeUser/${user._id}`)
            .then(res => {
                // console.log(res.data);
                if (res.data.modifiedCount > 0) {
                    refetch();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `You've downgraded ${user.name} into user!!!`,
                        showConfirmButton: false,
                        timer: 1000
                    });
                }
            })
    }

    const handleMakeSeller = user => {
        axiosSecure.patch(`/users/makeSeller/${user._id}`)
            .then(res => {
                // console.log(res.data);
                if (res.data.modifiedCount > 0) {
                    refetch();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: `You made ${user.name} a Seller!`,
                        showConfirmButton: false,
                        timer: 1000
                    });
                }
            })
    }

    const handleDeleteUser = user => {
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

                axiosSecure.delete(`/users/${user._id}`)
                    .then(res => {
                        if (res.data.deletedCount > 0) {
                            refetch();
                            Swal.fire({
                                title: "Deleted!",
                                // text: "user has been deleted.",
                                icon: "success"
                            });
                        }
                    })
            }
        });
    }

    return (
        <div>
            <style>{`
            .users-table-wrap {
                border-radius: 12px;
                overflow: hidden;
                border: 0.5px solid rgba(0,0,0,0.08);
            }
            .dark .users-table-wrap {
                border-color: rgba(255,255,255,0.08);
            }
            .users-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }
            .users-table thead tr {
                background: #57CEA7;
            }
            .users-table thead th {
                padding: 13px 16px;
                text-align: left;
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0.07em;
                text-transform: uppercase;
                color: #085041;
                border: none;
            }
            .users-table tbody tr {
                border-bottom: 0.5px solid rgba(0,0,0,0.06);
                transition: background 0.15s ease;
            }
            .dark .users-table tbody tr {
                border-color: rgba(255,255,255,0.06);
            }
            .users-table tbody tr:last-child {
                border-bottom: none;
            }
            .users-table tbody tr:hover {
                background: #e6f9f3;
            }
            .dark .users-table tbody tr:hover {
                background: rgba(87,206,167,0.07);
            }
            .users-table td, .users-table th {
                padding: 12px 16px;
                vertical-align: middle;
            }
            .role-badge {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                font-size: 11px;
                font-weight: 500;
                padding: 3px 10px;
                border-radius: 20px;
                letter-spacing: 0.04em;
            }
            .role-admin  { background: #e6f9f3; color: #0f6e56; }
            .role-seller { background: #EEEDFE; color: #3C3489; }
            .role-user   { background: #E6F1FB; color: #185FA5; }
            .action-btn {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 11px;
                font-weight: 500;
                padding: 4px 10px;
                border-radius: 6px;
                border: 0.5px solid transparent;
                cursor: pointer;
                transition: opacity 0.15s, transform 0.1s;
                margin: 2px 3px;
                white-space: nowrap;
            }
            .action-btn:hover  { opacity: 0.85; }
            .action-btn:active { transform: scale(0.97); }
            .btn-make-seller { background: #FAEEDA; color: #633806; border-color: #FAC775; }
            .btn-make-admin  { background: #e6f9f3; color: #0f6e56; border-color: #9FE1CB; }
            .btn-make-user   { background: #E6F1FB; color: #185FA5; border-color: #B5D4F4; }
            .btn-delete      { background: #FCEBEB; color: #A32D2D; border-color: #F7C1C1; padding: 5px 10px; }
            .idx-cell        { color: #9ca3af; font-size: 12px; width: 40px; }
            .email-cell      { color: #6b7280; font-size: 13px; }
        `}</style>

            {/* Header bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#57CEA7',
                borderRadius: '12px 12px 0 0',
                padding: '14px 20px',
                marginBottom: '0',
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#085041', margin: 0 }}>
                    All Users
                </h2>
                <span style={{
                    background: '#085041',
                    color: '#9FE1CB',
                    fontSize: '12px',
                    fontWeight: '500',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    letterSpacing: '0.05em',
                }}>
                    {users.length} total
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto users-table-wrap" style={{ borderRadius: '0 0 12px 12px' }}>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th className="idx-cell">#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td className="idx-cell">{index + 1}</td>

                                <td style={{ fontWeight: '500' }}>{user.name}</td>

                                <td className="email-cell">{user.email}</td>

                                {/* Role badge */}
                                <td>
                                    {user.role === 'admin' && (
                                        <span className="role-badge role-admin">● Admin</span>
                                    )}
                                    {user.role === 'seller' && (
                                        <span className="role-badge role-seller">● Seller</span>
                                    )}
                                    {user.role === 'user' && (
                                        <span className="role-badge role-user">● User</span>
                                    )}
                                </td>

                                {/* Action buttons */}
                                <td>
                                    {user.role === 'admin' && (
                                        <>
                                            <button onClick={() => handleMakeSeller(user)} className="action-btn btn-make-seller">
                                                Make Seller
                                            </button>
                                            <button onClick={() => handleMakeUser(user)} className="action-btn btn-make-user">
                                                Make User
                                            </button>
                                        </>
                                    )}
                                    {user.role === 'seller' && (
                                        <>
                                            <button onClick={() => handleMakeUser(user)} className="action-btn btn-make-user">
                                                Make User
                                            </button>
                                            <button onClick={() => handleMakeAdmin(user)} className="action-btn btn-make-admin">
                                                Make Admin
                                            </button>
                                        </>
                                    )}
                                    {user.role === 'user' && (
                                        <>
                                            <button onClick={() => handleMakeSeller(user)} className="action-btn btn-make-seller">
                                                Make Seller
                                            </button>
                                            <button onClick={() => handleMakeAdmin(user)} className="action-btn btn-make-admin">
                                                Make Admin
                                            </button>
                                        </>
                                    )}
                                </td>

                                {/* Delete */}
                                <td>
                                    <button onClick={() => handleDeleteUser(user)} className="action-btn btn-delete">
                                        <FaTrashAlt style={{ fontSize: '11px' }} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllUsers;