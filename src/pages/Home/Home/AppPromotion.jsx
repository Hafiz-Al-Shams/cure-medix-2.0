import { FaApple, FaGooglePlay } from "react-icons/fa";



const AppPromotion = () => {
    return (
        <div className="mb-0 mt-0 md:mt-1.5 lg:mt-2.5">
            <section className="px-6 py-5 sm:px-10 md:py-7 lg:py-9 flex flex-col md:flex-row items-center justify-around gap-8">
                {/* Text & QR Code Section */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
                    <h2 className="text-2xl sm:text-3xl md:text-3xl text-base-content">
                        Even Easier <br /> with our free App
                    </h2>
                    <p className="text-base-content/90 text-sm md:text-lg mt-2 lg:mt-4">
                        <strong>Download Now</strong> <br />
                        Scan the QR code with your smartphone or tablet camera.
                    </p>

                    {/* QR Code & Store Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                        <img
                            src="https://i.ibb.co.com/tMnCQpb6/sample-qr.jpg"
                            alt="QR Code"
                            className="w-24 h-24 rounded-md shadow-md"
                        />
                        <div className="flex flex-col gap-3">

                            <a
                                href="https://play.google.com/store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className=""
                            >
                                <button className="btn btn-outline btn-dark flex items-center gap-2 px-4 py-2 w-48">
                                    <FaGooglePlay className="text-lg" />
                                    <span>Get it on Google Play</span>
                                </button>

                            </a>


                            <a
                                href="https://www.apple.com/store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className=""
                            >
                                <button className="btn btn-outline btn-dark flex items-center gap-2 px-0.5 py-2 w-48">
                                    <FaApple className="text-lg" />
                                    <span>Download on App Store</span>
                                </button>

                            </a>
                        </div>
                    </div>
                </div>

                {/* App Image */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <img
                        src="https://i.ibb.co/rf0kTT6M/2966983.webp"
                        alt="App Preview"
                        className="
      w-3/4 sm:w-1/2 md:w-full
      max-w-xs md:max-w-sm lg:max-w-md
      drop-shadow-lg rounded-lg
      animate-[pulse_5s_ease-in-out_infinite]
    "
                    />
                </div>
            </section>
        </div>
    );
};

export default AppPromotion;