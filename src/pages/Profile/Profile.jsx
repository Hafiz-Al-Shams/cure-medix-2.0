import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";



const Profile = () => {

    const { user, signOutUser } = useAuth();


    const userInfo = {
        image: user?.photoURL,
        name: user?.displayName || "Unknown User",
        email: user?.email || "Not Provided",
        phoneNumber: user?.phoneNumber || "Not Provided",
        lastSignInTime: user?.metadata?.lastSignInTime || "Unknown",
        creationTime: user?.metadata?.creationTime || "Unknown",
        userId: user?.uid || "Not provided"
    };

    const handleLogOut = () => {
        signOutUser()
            .then(() => {
                // console.log('user signOut successful');
                Swal.fire({
                    position: "center",
                    icon: 'warning',
                    title: 'Log out done!',
                    showConfirmButton: false,
                    timer: 1000
                });
            })
            .catch(error => console.log('ERROR', error.message))
    }

    return (
        <div className="pt-7">
            <div className="max-w-4xl mx-auto p-6 bg-base-100 rounded-lg shadow-lg min-h-[600px]">
                <div className="flex justify-center pt-10 gap-16 items-center">
                    {/* Profile Picture */}
                    <div className="">
                        <img src={userInfo.image} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-emerald-900" />
                    </div>

                    {/* User Information */}
                    <div className="space-y-4">
                        <h1 className="text-3xl font-semibold text-gray-800">Name: {userInfo.name}</h1>
                        <p className="text-2xl text-gray-500">Email: {userInfo.email}</p>
                        <p className="text-xl text-gray-400">Phone: {userInfo.phoneNumber}</p>
                        <div className="mt-2 flex space-x-4 text-xl text-gray-600">
                            <div>
                                <strong>Member Since:</strong> {new Date(userInfo.creationTime).toLocaleDateString()}
                            </div>
                            <div>
                                <strong>Last Sign-In:</strong> {new Date(userInfo.lastSignInTime).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User ID Section */}
                <div className="mt-12 p-4 bg-gray-100/60 rounded-lg pl-10">
                    <h2 className="text-xl font-semibold text-gray-800">User ID</h2>
                    <p className="text-lg text-gray-600">{userInfo.userId}</p>
                </div>
                <div className="mt-10 text-right mr-8">
                    <button onClick={handleLogOut} className="btn btn-ghost btn-lg">Logout</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;