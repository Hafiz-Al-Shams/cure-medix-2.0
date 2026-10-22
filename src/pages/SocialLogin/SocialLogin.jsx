import { useContext } from "react";
import Swal from "sweetalert2";
import AuthContext from "../../context/AuthContext/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { FcGoogle } from "react-icons/fc";



const SocialLogin = () => {

    const { signInWithGoogle } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then(result => {
                // console.log('Login successful: ', result.user.email);
                const userInfo = {
                    name: result.user?.displayName,
                    email: result.user?.email,
                    role: 'user',
                }
                axiosPublic.post('/users', userInfo)
                    .then(res => {
                        // console.log(res.data);
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: 'Google Login Successful',
                            showConfirmButton: false,
                            timer: 1000
                        });
                        navigate('/');
                    })

                // navigate(from, { replace: true });
            })
            .catch(error => {
                console.log('ERROR', error.message);
            })
    }


    return (
        <div className='m-4'>
            <div className="divider text-neutral">OR</div>
            <button onClick={handleGoogleSignIn} className='btn btn-block'>
                <FcGoogle className="md:text-lg" />Google</button>
        </div>
    );
};

export default SocialLogin;