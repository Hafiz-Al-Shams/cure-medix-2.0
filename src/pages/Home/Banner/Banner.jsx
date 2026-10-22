import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiCheckCircle, FiThermometer, FiUserCheck } from "react-icons/fi";
import useBanners from "../../../hooks/useBanners"; // your existing banner data hook

const Banner = () => {
    const [banners] = useBanners(); // [{ image }, ...] from your API
    const [active, setActive] = useState(0); // current featured slide
    const [query, setQuery] = useState(""); // search box text
    const navigate = useNavigate();

    // Auto-advance the featured card every 3s; cleanup prevents leaks/duplicate timers
    useEffect(() => {
        if (!banners.length) return;
        const timer = setInterval(() => setActive((i) => (i + 1) % banners.length), 3000);
        return () => clearInterval(timer);
    }, [banners.length]);

    // Search -> sends the user to the shop with the typed text in the URL (?search=...)
    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    };

    return (
        <section className="bg-gradient-to-br from-[#031a1a] via-[#052e2b] to-[#0b4a3f] text-white">
            <div className="max-w-screen-xl mx-auto px-4 pt-12 pb-28 lg:pt-20 lg:pb-36 grid lg:grid-cols-2 gap-10 items-center">
                {/* ── Left: headline, search, trust badges ── */}
                <div>
                    <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide bg-white/10 border border-white/10 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        CERTIFIED PHARMACY PLATFORM
                    </span>
                    <h1 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                        Your Trusted Partner for <span className="text-emerald-400">Genuine Medicines</span> &amp; Healthcare.
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-white/70 max-w-lg">
                        Access authentic pharmaceutical supplies, instant online doctor consultations, and doorstep express delivery with total peace of mind.
                    </p>

                    {/* Search bar (functional) */}
                    <form onSubmit={handleSearch} className="mt-6 flex items-center bg-white/10 border border-white/15 rounded-xl p-1.5 max-w-lg">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by Medicine Name, Brand, or Formula..."
                            className="flex-1 bg-transparent outline-none px-3 text-sm placeholder:text-white/50"
                        />
                        <button type="submit" className="btn btn-sm md:btn-md border-0 bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                            <FiSearch /> Find Medicines
                        </button>
                    </form>

                    {/* Trust badges */}
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
                        <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-400" /> 100% Genuine Guarantee</span>
                        <span className="flex items-center gap-1.5"><FiThermometer className="text-emerald-400" /> Temperature Controlled</span>
                        <span className="flex items-center gap-1.5"><FiUserCheck className="text-emerald-400" /> Licensed Doctors</span>
                    </div>
                </div>

                {/* ── Right: featured banner card (uses your banners data) ── */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur">
                    <div className="relative h-48 md:h-60 lg:h-64 rounded-2xl overflow-hidden bg-white/10">
                        {banners.map((b, i) => (
                            <img
                                key={i}
                                src={b.image}
                                alt="Featured banner"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
                            />
                        ))}
                        <span className="absolute left-3 bottom-3 text-[10px] font-semibold bg-emerald-500 px-2 py-0.5 rounded">Featured Banner</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">Need Urgent Prescription Refills?</h3>
                    <p className="text-xs text-white/60 mt-1">Our pharmacists verify and dispatch orders instantly across major metropolitan areas.</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-white/80"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ISO 9001 Certified Pharmacy</span>
                        <Link to="/shop" className="font-semibold underline">Explore Store →</Link>
                    </div>
                    {/* Slide dots (clickable) */}
                    <div className="mt-3 flex gap-1.5">
                        {banners.map((_, i) => (
                            <button key={i} onClick={() => setActive(i)} aria-label={`Slide ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-emerald-400" : "w-1.5 bg-white/30"}`} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;