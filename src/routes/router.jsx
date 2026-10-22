import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home/Home";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import SignIn from "../pages/SignIn/SignIn";
import SignUp from "../pages/SignUp/SignUp";
import DetailsCard from "../pages/CategoryDetails/DetailsCard";
import Shop from "../pages/Shop/Shop";
import Cart from "../pages/Cart/Cart";
import Dashboard from "../layouts/Dashboard";
import PrivateRoute from "./PrivateRoute";
import AllUsers from "../pages/Dashboard/AllUsers";
import AdminRoute from "./AdminRoute";
import AllCategories from "../pages/Dashboard/AllCategories";
import UpdateCategory from "../pages/Dashboard/UpdateCategory";
import Payment from "../pages/Dashboard/Payment";
import PaymentHistory from "../pages/Dashboard/PaymentHistory";
import UserHome from "../pages/Dashboard/UserHome";
import AdminHome from "../pages/Dashboard/AdminHome";
import ManagePayments from "../pages/Dashboard/ManagePayments";
import SellerHome from "../pages/Dashboard/SellerHome";
import ManageMedicines from "../pages/Dashboard/ManageMedicines";
import HistoryPayments from "../pages/Dashboard/HistoryPayments";
import BannerAd from "../pages/Dashboard/BannerAd";
import Categories from "../pages/Categories/Categories";
import Offer from "../pages/Offer/Offer";
import OnlineDoctor from "../pages/OnlineDoctor/OnlineDoctor";
// import UpdateProfile from "../pages/UpdateProfile/UpdateProfile";
import SalesReport from "../pages/Dashboard/SalesReport";
import ManageBannerAd from "../pages/Dashboard/ManageBannerAd";
import InvoicePage from "../pages/InvoicePage";
import Profile from "../pages/Profile/Profile";




const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout></MainLayout>,
        children: [
            {
                path: '/',
                element: <Home></Home>,
            },
            {
                path: 'shop',
                element: <Shop></Shop>,
                // loader: () => fetch(`https://cure-medix-server.vercel.app/medicines`)
            },
            {
                path: 'categories',
                element: <Categories></Categories>,
            },
            {
                path: 'offers',
                element: <Offer></Offer>,
            },
            {
                path: 'online-doctor',
                element: <OnlineDoctor></OnlineDoctor>,
            },
            {
                path: 'signUp',
                element: <SignUp></SignUp>,
            },
            {
                path: 'signIn',
                element: <SignIn></SignIn>,
            },
            {
                path: 'update-profile',
                element: <PrivateRoute><Profile></Profile></PrivateRoute>,
            },
            {
                path: 'categoryDetails/:categoryName',
                element: <DetailsCard />,
            },
        ]
    },
    {
        path: "dashboard",
        element: <PrivateRoute><Dashboard></Dashboard></PrivateRoute>,
        children: [

            // admin routes
            {
                path: 'adminHome',
                element: <AdminRoute><AdminHome></AdminHome></AdminRoute>,
            },
            {
                path: 'users',
                element: <AdminRoute><AllUsers></AllUsers></AdminRoute>,
            },
            {
                path: 'manage-payments',
                element: <AdminRoute><ManagePayments></ManagePayments></AdminRoute>,
            },
            {
                path: 'allCategories',
                element: <AdminRoute><AllCategories></AllCategories></AdminRoute>,
            },
            {
                path: 'updateCategory/:id',
                element: <AdminRoute><UpdateCategory></UpdateCategory></AdminRoute>,
                loader: ({ params }) => fetch(`https://cure-medix-server.vercel.app/categories/${params.id}`)
            },
            {
                path: 'sales-report',
                element: <AdminRoute><SalesReport></SalesReport></AdminRoute>,
            },
            {
                path: 'manage-banner',
                element: <AdminRoute><ManageBannerAd></ManageBannerAd></AdminRoute>,
            },

            // user routes
            {
                path: 'userHome',
                element: <UserHome></UserHome>,
            },
            {
                path: 'cart',
                element: <PrivateRoute><Cart></Cart></PrivateRoute>,
            },
            {
                path: 'payment',
                element: <Payment></Payment>,
            },
            {
                path: 'paymentHistory',
                element: <PaymentHistory></PaymentHistory>
            },

            // seller routes
            {
                path: 'sellerHome',
                element: <SellerHome></SellerHome>,
            },
            {
                path: 'manage-medicines',
                element: <ManageMedicines></ManageMedicines>,
            },
            {
                path: 'payments-history',
                element: <HistoryPayments></HistoryPayments>,
            },
            {
                path: 'banner-ad',
                element: <BannerAd></BannerAd>,
            },


        ]
    },
    {
        path: 'invoice',
        element: <InvoicePage></InvoicePage>,
    },
    {
        path: "*",
        element: <ErrorPage></ErrorPage>,
    },
]);

export default router;