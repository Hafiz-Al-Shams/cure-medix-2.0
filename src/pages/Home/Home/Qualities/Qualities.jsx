import { BiSupport } from "react-icons/bi";
import { GiReturnArrow } from "react-icons/gi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";

// Same 4 services as before, now driven by one array + new card style
const services = [
    { icon: <MdOutlineLocalShipping />, title: "Free Shipping", text: "Free shipping worldwide on qualifying medical orders.", color: "text-orange-500 bg-orange-50" },
    { icon: <BiSupport />, title: "Support 24/7", text: "Contact our pharmacy desk 24 hours a day.", color: "text-blue-500 bg-blue-50" },
    { icon: <RiSecurePaymentLine />, title: "Secure Payments", text: "100% encrypted payment security protection.", color: "text-emerald-600 bg-emerald-50" },
    { icon: <GiReturnArrow />, title: "Easy Return", text: "Simple and hassle-free returns policy.", color: "text-purple-500 bg-purple-50" },
];

const Qualities = () => {
    return (
        <section className="bg-base-100 py-12 lg:py-16">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center">
                    <p className="text-[11px] font-semibold tracking-wider text-emerald-600">ADDED VALUE</p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-base-content">Our Awesome Services</h2>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map((s) => (
                        <div key={s.title} className="flex flex-col items-center text-center border border-base-content/10 rounded-2xl p-5 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
                            <h3 className="mt-3 font-semibold text-sm text-base-content">{s.title}</h3>
                            <p className="text-xs text-base-content/60 mt-1">{s.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Qualities;