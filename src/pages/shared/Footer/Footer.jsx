import logo from "../../../assets/logo.png"; // same original logo as the navbar
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

// Link columns kept in arrays so they're easy to edit
const columns = [
    { title: "SERVICES", items: ["Prescription Refills", "Online Doctor Consult", "Lab Testing Kits", "OTC Wellness Products"] },
    { title: "COMPANY", items: ["About Us", "Contact Us", "Careers / Jobs", "Press Release Kit"] },
    { title: "LEGAL", items: ["Terms of Use", "Privacy Policy", "Cookie Policy", "Rx Guidelines"] },
];

const Footer = () => {
    return (
        <footer className="bg-[#04201f] text-white/70">
            <div className="max-w-screen-xl mx-auto px-4 pt-12 pb-6">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
                    {/* Brand block */}
                    <div>
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
                            <h3 className="text-xl font-bold text-white">Cure<span className="text-emerald-400">Medix</span></h3>
                        </div>
                        <p className="text-xs mt-3 max-w-xs leading-relaxed">
                            CureMedix Company Ltd. - Providing reliable and authentic healthcare service since 2002. Licensed by the state medical board.
                        </p>
                        <div className="flex gap-2 mt-4">
                            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, i) => (
                                <a key={i} href="#" aria-label="social link" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-xs transition-colors">
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {columns.map((col) => (
                        <nav key={col.title} className="flex flex-col gap-2">
                            <h6 className="text-[11px] font-bold tracking-wider text-white mb-1">{col.title}</h6>
                            {col.items.map((item) => (
                                <a key={item} className="text-xs hover:text-emerald-400 cursor-pointer">{item}</a>
                            ))}
                        </nav>
                    ))}
                </div>

                {/* Bottom bar: copyright (auto year) + tagline */}
                <div className="mt-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-white/50">
                    <p>© {new Date().getFullYear()} All Rights Reserved by CureMedix Company Ltd.</p>
                    <p>Designed for modern digital pharmacy standards</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;