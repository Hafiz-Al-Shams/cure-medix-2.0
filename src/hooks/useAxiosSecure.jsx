import axios from "axios";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";

export const axiosSecure = axios.create({
    baseURL: 'https://cure-medix-server.vercel.app'
})


const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { signOutUser } = useAuth();

    // requesting interceptor to add authorization header for every secure call to api
    axiosSecure.interceptors.request.use(function (config) {
        const token = localStorage.getItem('access-token');
        // console.log('request stopped by interceptors', token);
        config.headers.authorization = `Bearer ${token}`;
        return config;
    }, function (error) {
        return Promise.reject(error);
    });


    // intercepting 401 and 403 status
    axiosSecure.interceptors.response.use(function (response) {
        return response;
    }, async (error) => {
        const status = error.response.status;
        // for 401 or 403
        if (status === 401 || status === 403) {
            await signOutUser();
            navigate('/signIn');
        }
        return Promise.reject(error);
    })


    return axiosSecure;
};

export default useAxiosSecure;