import { FiFileText, FiUpload } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// Prescription CTA section
const PrescriptionCTA = () => {
    // WhatsApp number in international format
    const whatsappNumber = "8801581198040";

    // Pre-filled message when a user opens WhatsApp
    const whatsappMessage = encodeURIComponent(
        "Hello CureMedix! I would like to order medicines. Please guide me through the process."
    );

    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    // Shared sizing and alignment for both action elements
    // min-height (not fixed height) so longer text can wrap on very small screens without clipping
    const actionClass =
        "flex min-h-[3.5rem] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/30 px-4 py-3 text-center text-xs sm:text-sm font-medium leading-snug";

    return (
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 lg:-mt-16 relative z-[1]">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-5 sm:p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 lg:gap-8 shadow-xl">

                {/* Left: icon + text */}
                <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0 lg:flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-white/15 flex items-center justify-center text-xl sm:text-2xl">
                        <FiFileText />
                    </div>

                    <div className="min-w-0">
                        <span className="inline-block text-[10px] font-semibold bg-white/15 rounded px-2 py-0.5 tracking-wide">
                            FAST PROCESS
                        </span>

                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mt-1.5 leading-snug break-words">
                            Have a Doctor&apos;s Prescription?
                        </h3>

                        <p className="text-xs sm:text-sm text-white/75 mt-1 sm:mt-1.5 max-w-xl leading-relaxed">
                            Prescription upload is coming soon. In the meantime,
                            contact our team on WhatsApp for assistance with
                            prescription-based medicine orders.
                        </p>
                    </div>
                </div>

                {/* Responsive actions with equal sizing:
                    mobile = stacked, tablet = 2 columns full width, desktop = fixed-width side block */}
                <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Static label: prescription upload is not implemented yet */}
                    <span className={`${actionClass} bg-white/15`}>
                        <FiUpload className="shrink-0" />
                        <span>Prescription Upload Coming Soon</span>
                    </span>

                    {/* Opens WhatsApp with a pre-filled order message */}
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${actionClass} bg-transparent hover:bg-white/10 transition-colors`}
                    >
                        <FaWhatsapp className="shrink-0 text-base" />
                        <span>Order via WhatsApp</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default PrescriptionCTA;