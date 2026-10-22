import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
    return (
        <div>
            <Helmet>
                <title>ERROR</title>
            </Helmet>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 to-orange-300 text-gray-800">
                <div className="text-center">
                    <h1 className="text-9xl font-extrabold text-primary/75 drop-shadow-md">404</h1>
                    <p className="mt-4 text-xl md:text-4xl font-semibold">Oops! The page you are looking for does not exist.</p>
                    <p className="mt-3 text-neutral/85 text-xl font-medium">It seems like you may have taken a wrong turn. Lets get you back home!</p>
                    <Link to="/" className="mt-6 inline-block bg-primary/70 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition duration-300">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;