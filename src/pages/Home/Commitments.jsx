import { FiUserCheck, FiThermometer, FiAward, FiZap } from "react-icons/fi";

// NEW section: 4 commitment cards (static content)
const items = [
    { icon: <FiUserCheck />, title: "Certified Pharmacists", text: "Every order is double-checked and verified by licensed pharmacists before dispatch.", color: "text-emerald-600 bg-emerald-50" },
    { icon: <FiThermometer />, title: "Cold-Chain Storage", text: "Temperature-sensitive biologics & insulin are handled with insulated packaging.", color: "text-teal-600 bg-teal-50" },
    { icon: <FiAward />, title: "Lab-Tested Quality", text: "Direct sourcing from WHO-GMP certified manufacturers ensuring 100% active potency.", color: "text-emerald-700 bg-emerald-50" },
    { icon: <FiZap />, title: "Express Local Delivery", text: "Dedicated fleet delivery guaranteeing urgent orders arrive in under 2 hours.", color: "text-indigo-600 bg-indigo-50" },
];

const Commitments = () => (
    <section className="py-12 lg:py-16 bg-base-100">
        <div className="max-w-screen-xl mx-auto px-4">
            <div className="text-center">
                <p className="text-[11px] font-semibold tracking-wider text-emerald-600">UNCOMPROMISING STANDARDS</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-base-content">Our Core Healthcare Commitments</h2>
                <p className="text-xs text-base-content/60 mt-1">How CureMedix sets the industry benchmark for safety, reliability, and precision.</p>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((it) => (
                    <div key={it.title} className="bg-base-100 border border-base-content/10 rounded-2xl p-5 shadow-sm">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${it.color}`}>{it.icon}</div>
                        <h3 className="mt-3 font-semibold text-base-content">{it.title}</h3>
                        <p className="text-xs text-base-content/60 mt-1">{it.text}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Commitments;