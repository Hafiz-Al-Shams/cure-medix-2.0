import { Link } from "react-router-dom";

const KnowUs = () => {
    return (
        <section className="bg-base-100 py-12 lg:py-16">
            <div className="max-w-screen-xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
                {/* Image with floating "10k+" badge */}
                <div className="relative">
                    <img
                        src="https://i.ibb.co.com/y0Wj6xz/pexels-pavel-danilyuk-8442108.jpg"
                        alt="Team in Lab"
                        className="rounded-2xl shadow-lg w-full h-72 lg:h-96 object-cover"
                    />
                    <div className="absolute -bottom-5 right-4 bg-emerald-600 text-white rounded-xl px-5 py-3 shadow-lg">
                        <p className="text-2xl font-bold">10k+</p>
                        <p className="text-[11px]">Happy Patients Served</p>
                    </div>
                </div>

                {/* Text side */}
                <div>
                    <p className="text-[11px] font-semibold tracking-wider text-emerald-600">KNOW US</p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-base-content">
                        10+ Years Experience On <span className="text-emerald-600">Medical Industry</span>
                    </h2>
                    <p className="text-sm text-base-content/70 mt-4">
                        With over a decade of expertise in the medical field, we are committed to providing high-quality healthcare solutions. Our team has been dedicated to improving patient care and delivering trusted medical products. We focus on innovation, reliability, and customer satisfaction, ensuring that every service we offer meets the highest standards. Let us be your trusted partner in healthcare.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="border border-base-content/10 rounded-xl p-3"><p className="text-xl font-bold text-base-content">100%</p><p className="text-[11px] text-base-content/60">Genuine Medicines</p></div>
                        <div className="border border-base-content/10 rounded-xl p-3"><p className="text-xl font-bold text-base-content">24/7</p><p className="text-[11px] text-base-content/60">Doctor Support</p></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KnowUs;