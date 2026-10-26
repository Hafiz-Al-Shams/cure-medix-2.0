import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../pages/shared/NavBar/NavBar";
import Footer from "../pages/shared/Footer/Footer";



const MainLayout = () => {

    const location = useLocation();
    // console.log(location);

    const noFooter1 = location.pathname.includes('/signIn')
    const noFooter2 = location.pathname.includes('/signUp')
    const noFooter3 = location.pathname.includes('/forgot-password') // NEW: no footer on the forgot password page


    return (
        <>

            <NavBar></NavBar>

            <div className="min-h-screen bg-base-100">
                <Outlet></Outlet>
            </div>
            {noFooter1 || noFooter2 || noFooter3 ? null : <Footer></Footer>}
        </>
    );
};

export default MainLayout;