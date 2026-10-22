import { Link } from "react-router-dom";
import { FiFileText, FiUpload } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// NEW component: green strip that overlaps the bottom of the hero (negative margin)
const PrescriptionCTA = () => {
    return (
        <section className="max-w-screen-xl mx-auto px-4 -mt-16 relative z-[1]">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-xl">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-white/15 flex items-center justify-center text-2xl"><FiFileText /></div>
                    <div>
                        <span className="text-[10px] font-semibold bg-white/15 rounded px-2 py-0.5">FAST PROCESS</span>
                        <h3 className="text-xl font-bold mt-1">Have a Doctor&apos;s Prescription?</h3>
                        <p className="text-sm text-white/75 max-w-xl">Upload your doctor&apos;s note or Rx slip directly. Our certified pharmacists will review and deliver your medicines within 2 hours.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                    {/* Goes to the doctor page; point it to your own upload route if you have one */}
                    <Link to="/online-doctor" className="btn btn-sm md:btn-md bg-white text-emerald-900 border-0 hover:bg-gray-100 gap-2"><FiUpload /> Upload Prescription</Link>
                    {/* Replace 8801XXXXXXXXX with your WhatsApp number */}
                    <a href="https://wa.me/8801XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="btn btn-sm md:btn-md bg-transparent text-white border border-white/30 hover:bg-white/10 gap-2"><FaWhatsapp /> Order via WhatsApp</a>
                </div>
            </div>
        </section>
    );
};

export default PrescriptionCTA;