import useAuth from "../../hooks/useAuth";




const UserHome = () => {
    const { user } = useAuth();
    return (
        <div>
            <h2 className="text-3xl font-semibold">
                <span>Hello User, Welcome Home</span>
                {/* {
                    user?.displayName ? `User (${user.displayName})` : 'to home'
                } */}
            </h2>
        </div>
    );
};

export default UserHome;