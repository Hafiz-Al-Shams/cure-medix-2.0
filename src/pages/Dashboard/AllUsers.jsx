// 📁 PATH: src/pages/Dashboard/AllUsers.jsx  (MODIFIED existing file – replace the whole file)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaTrashAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import AdminPageHeader from "../../components/AdminPageHeader";
import { confirmAction, successAlert, errorAlert } from "../../utils/adminAlerts";

const roleTone = { admin: "green", seller: "purple", user: "slate" };

// Role badge: User / Seller / Admin
const RoleBadge = ({ role }) => {
    const r = role || "user";
    return <span className={`cm-chip cm-tone-${roleTone[r] || "slate"}`}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>;
};

// The two role buttons that fit the user's current role (same rules as before)
const RoleButtons = ({ user, onSeller, onAdmin, onUser }) => {
    const seller = <button key="s" onClick={() => onSeller(user)} className="cm-chip cm-chip-btn cm-tone-amber">Make Seller</button>;
    const admin = <button key="a" onClick={() => onAdmin(user)} className="cm-chip cm-chip-btn cm-tone-green">Make Admin</button>;
    const plain = <button key="u" onClick={() => onUser(user)} className="cm-chip cm-chip-btn cm-tone-slate">Make User</button>;
    if (user.role === "admin") return <>{seller}{plain}</>;
    if (user.role === "seller") return <>{admin}{plain}</>;
    return <>{seller}{admin}</>;
};

const AllUsers = () => {
    const axiosSecure = useAxiosSecure();
    const [search, setSearch] = useState("");

    const { data: users = [], refetch } = useQuery({
        queryKey: ["users"],
        queryFn: async () => (await axiosSecure.get("/users")).data,
    });

    // Same 3 role endpoints as before, now with success / error modals
    const changeRole = async (endpoint, message) => {
        try {
            const res = await axiosSecure.patch(endpoint);
            if (res.data.modifiedCount > 0) {
                refetch();
                successAlert("Role updated", message);
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not update role", "Please try again in a moment.");
        }
    };
    const handleMakeAdmin = (user) => changeRole(`/users/admin/${user._id}`, `You made ${user.name} an Admin!`);
    const handleMakeUser = (user) => changeRole(`/users/makeUser/${user._id}`, `You've downgraded ${user.name} to User.`);
    const handleMakeSeller = (user) => changeRole(`/users/makeSeller/${user._id}`, `You made ${user.name} a Seller!`);

    // Confirm → delete → success modal
    const handleDeleteUser = async (user) => {
        const ok = await confirmAction({
            title: "Delete this user?",
            text: `${user.name} will be removed permanently. You won't be able to revert this.`,
            confirmText: "Yes, delete user",
            danger: true,
        });
        if (!ok) return;
        try {
            const res = await axiosSecure.delete(`/users/${user._id}`);
            if (res.data.deletedCount > 0) {
                refetch();
                successAlert("User deleted", `${user.name} has been removed.`);
            }
        } catch (err) {
            console.error(err);
            errorAlert("Could not delete user", "Please try again in a moment.");
        }
    };

    // Client-side search by name, email or role
    const q = search.trim().toLowerCase();
    const filtered = q
        ? users.filter((u) => [u.name, u.email, u.role || "user"].some((v) => String(v || "").toLowerCase().includes(q)))
        : users;

    const trashBtn = (user) => (
        <button onClick={() => handleDeleteUser(user)} aria-label={`Delete ${user.name}`} className="rounded-lg p-2 text-base-content/40 transition-colors hover:bg-rose-500/10 hover:text-rose-500"><FaTrashAlt /></button>
    );

    return (
        <div>
            <Helmet><title>CureMedix | All Users</title></Helmet>
            <AdminPageHeader title="Manage All Users" subtitle="View user roster, assign seller or admin privileges, and manage accounts." />

            {/* Toolbar: total + search */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="cm-chip cm-tone-green border border-emerald-500/30 !px-3 !py-1 text-xs">{users.length} Total Users</span>
                    <span className="text-xs text-base-content/60">
                        {q ? `Showing ${filtered.length} result${filtered.length === 1 ? "" : "s"}` : "Manage user authorization & roles"}
                    </span>
                </div>
                <label className="flex w-full items-center gap-2 rounded-xl border border-base-content/15 px-3 py-2 sm:w-72">
                    <FiSearch className="text-base-content/50" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user or email..." className="grow bg-transparent text-sm outline-none" />
                </label>
            </div>

            {filtered.length === 0 && (
                <p className="rounded-2xl border border-dashed border-base-content/20 py-12 text-center text-sm text-base-content/60">No users match “{search}”.</p>
            )}

            {/* Desktop / tablet table */}
            {filtered.length > 0 && (
                <div className="hidden overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-sm md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead>
                                <tr className="bg-teal-600 text-left text-xs font-bold uppercase tracking-wider text-white">
                                    <th className="w-14 px-4 py-3">#</th>
                                    <th className="px-4 py-3">User Details</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Role Management</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/10">
                                {filtered.map((user, i) => (
                                    <tr key={user._id} className="transition-colors hover:bg-base-200/60">
                                        <td className="px-4 py-3 text-xs text-base-content/50">{i + 1}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-base-content">{user.name}</p>
                                            <p className="text-xs text-base-content/60">{user.email}</p>
                                        </td>
                                        <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                                        <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><RoleButtons user={user} onSeller={handleMakeSeller} onAdmin={handleMakeAdmin} onUser={handleMakeUser} /></div></td>
                                        <td className="px-4 py-3 text-right">{trashBtn(user)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Phone cards */}
            <div className="space-y-3 md:hidden">
                {filtered.map((user, i) => (
                    <div key={user._id} className="rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[11px] text-base-content/40">#{i + 1}</p>
                                <p className="truncate font-semibold text-base-content">{user.name}</p>
                                <p className="truncate text-xs text-base-content/60">{user.email}</p>
                            </div>
                            <RoleBadge role={user.role} />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-base-content/10 pt-3">
                            <RoleButtons user={user} onSeller={handleMakeSeller} onAdmin={handleMakeAdmin} onUser={handleMakeUser} />
                            <span className="ml-auto">{trashBtn(user)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllUsers;