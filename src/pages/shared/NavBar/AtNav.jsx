import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { IoMdHome } from 'react-icons/io';
import logo from '../../src/assets/logo.png'

const Navbar = () => {


    const { user, signOutUser } = useContext(AuthContext);

    const navigate = useNavigate();

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [userName, setUserName] = useState('');
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setProfilePhoto(user.photoURL);
            setUserName(user.displayName);
            // setLoading(false);
            // console.log(user.photoURL);
            // console.log(user.displayName);
        }
        // setLoading(false);
    }, [user]);


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

                    // confirmButtonText: 'ok'
                });
                // setProfilePhoto('');
                // setUserName('');
            })
            .catch(error => console.log('ERROR', error.message))
    }


    const links = <>
        <li><NavLink to="/">
            <div className="flex justify-center items-center gap-0.5">
                <IoMdHome className="text-xl" />
                <h5>Home</h5>
            </div>
        </NavLink></li>

        <li><NavLink to="/gift-catalog">
            <div className="flex justify-center items-center gap-1">
                <h5>Gift Catalog</h5>
            </div>
        </NavLink></li>

        <li><NavLink to="/make-gift">
            <div className="flex justify-center items-center gap-1">
                <h5>Make Gift</h5>
            </div>
        </NavLink></li>

        <li><NavLink to="">
            <div className="flex justify-center items-center gap-1">
                <h5>About Us</h5>
            </div>
        </NavLink></li>
    </>


    const dropdownLinks = (
        <>
            <li>
                <NavLink to="/dashboard">
                    <h5>Dashboard</h5>
                </NavLink>
            </li>

            {/* <li>
        <NavLink>{userName}</NavLink>
      </li> */}

            <li><a onClick={handleLogOut}>Logout</a></li>
        </>
    );


    return (
        <>
            <div className="navbar bg-base-100 px-7">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            {links}
                        </ul>
                    </div>

                    <NavLink to='/'>
                        <div className="flex justify-center items-center gap-1">
                            <div className="">
                                <img src={logo} alt="" className='w-7' />
                            </div>
                            <h3 className="text-xl text-p font-bold">Giftify</h3>
                        </div>
                    </NavLink>

                    {/* <a href='/' className="text-xl text-p font-bold">Giftify</a> */}
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {links}
                    </ul>
                </div>
                <div className="navbar-end">
                    {/* <a className="btn">Button</a> */}
                    {user ? (
                        <div className="flex justify-center items-center gap-3">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <div className="w-10 rounded-full">
                                        <img
                                            alt="photo"
                                            src={profilePhoto} />
                                    </div>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-[1] mt-3 w-52 p-4 shadow space-y-2"
                                >
                                    {dropdownLinks}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <NavLink to="/signIn">
                            <button className="btn btn-p text-white/90">Sign in</button>
                        </NavLink>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;