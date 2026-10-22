import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../pages/shared/NavBar/NavBar";
import Footer from "../pages/shared/Footer/Footer";



const MainLayout = () => {

    const location = useLocation();
    // console.log(location);

    const noFooter1 = location.pathname.includes('/signIn')
    const noFooter2 = location.pathname.includes('/signUp')


    return (
        <>

            <NavBar></NavBar>

            <div className="min-h-screen bg-base-100">
                <Outlet></Outlet>
            </div>
            {noFooter1 || noFooter2 ? null : <Footer></Footer>}
        </>
    );
};

export default MainLayout;