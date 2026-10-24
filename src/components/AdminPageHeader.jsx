// 📁 PATH: src/components/AdminPageHeader.jsx  (NEW file)
// Top header of every admin page: page title + subtitle on the left,
// logged-in admin's name / "Admin" tag / round profile picture on the right.
// (No theme toggle here – it already lives in the sidebar.)
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const AdminPageHeader = ({ title, subtitle }) => {
    const { user } = useAuth();
    const [imgFailed, setImgFailed] = useState(false);

    const name = user?.displayName || user?.name || "Admin";
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "A";

    return (
        <header className="mb-6 flex items-center justify-between gap-4 border-b border-base-content/10 pb-4">
            <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-base-content sm:text-2xl">{title}</h1>
                {subtitle && <p className="mt-0.5 text-xs text-base-content/60 sm:text-sm">{subtitle}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <div className="hidden text-right sm:block">
                    <p className="max-w-[160px] truncate text-sm font-semibold text-base-content">{name}</p>
                    <span className="cm-chip cm-tone-green !px-2 !py-0 text-[10px]">Admin</span>
                </div>
                {user?.photoURL && !imgFailed ? (
                    <img src={user.photoURL} alt={name} onError={() => setImgFailed(true)} className="h-10 w-10 rounded-full border-2 border-teal-600/40 object-cover" />
                ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">{initials}</span>
                )}
            </div>
        </header>
    );
};

export default AdminPageHeader;