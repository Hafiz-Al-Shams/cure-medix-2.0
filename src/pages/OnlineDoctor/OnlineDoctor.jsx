// 📁 PATH: src/pages/OnlineDoctor/OnlineDoctor.jsx  (MODIFIED existing file – replace the whole file)
import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import { FaStethoscope } from "react-icons/fa";
import { FiShield, FiFileText, FiUserCheck, FiMapPin, FiCalendar, FiVideo, FiMic, FiMaximize, FiPhoneOff, FiZap, FiX, FiSearch, FiCheck, FiDownload, FiArrowRight } from "react-icons/fi";

// ───────────── Static data (edit freely) ─────────────
// "group" decides which filter chip a doctor appears under
const doctors = [
    { name: "Dr. Sarah Jenkins", specialty: "General Practitioner", group: "General Practice", rating: 4.9, reviews: 142, years: 12, next: "Today 11:00 AM", fee: 35, img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop" },
    { name: "Dr. Mateo Novak", specialty: "Dermatology", group: "Dermatology", rating: 4.8, reviews: 98, years: 9, next: "Today 02:15 PM", fee: 45, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop" },
    { name: "Dr. Elena Petrova", specialty: "Pediatrics", group: "Pediatrics", rating: 5.0, reviews: 210, years: 15, next: "Tomorrow 09:30 AM", fee: 40, img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop" },
    { name: "Dr. Oliver Dupont", specialty: "Cardiology", group: "Cardiology", rating: 4.9, reviews: 87, years: 18, next: "Oct 26, 10:00 AM", fee: 60, img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop" },
    { name: "Dr. Sophie Müller", specialty: "General Practitioner", group: "General Practice", rating: 4.7, reviews: 115, years: 8, next: "Today 04:30 PM", fee: 30, img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop" },
    { name: "Dr. Luca Moretti", specialty: "Neurology", group: "Neurology", rating: 4.9, reviews: 76, years: 14, next: "Tomorrow 01:00 PM", fee: 55, img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop" },
];
const filters = ["All Specialists", "General Practice", "Dermatology", "Pediatrics", "Cardiology"]; // chips exactly like the design
const steps = [
    { icon: <FiUserCheck />, title: "1. Choose Specialist", text: "Select from verified general practitioners, pediatricians, dermatologists, and specialists." },
    { icon: <FiCalendar />, title: "2. Pick Time Slot", text: "Book an immediate consultation or schedule a convenient appointment for later." },
    { icon: <FiVideo />, title: "3. Video Consult", text: "Connect via encrypted high-definition video call right from your browser or phone." },
    { icon: <FiFileText />, title: "4. RX & Sick Note", text: "Receive instant e-prescriptions sent to our pharmacy shop or download certified sick notes." },
];
const timeSlots = ["09:30 AM", "11:00 AM", "02:15 PM", "04:00 PM", "05:30 PM", "07:00 PM"];
const hospitals = [
    { name: "Charité Central Hospital Inpatient Clinic", address: "Charitéplatz 1, 10117 Berlin", distance: "1.2 km away", tag: "24/7 ER Available" },
    { name: "St. Hedwig Hospital & Emergency Care", address: "Große Hamburger Str. 5, 10115 Berlin", distance: "2.8 km away", tag: "Open Now" },
];
const faqs = [
    { q: "Is an online sick note recognized by my employer?", a: "Yes. Our licensed doctors issue digitally signed sick notes that are accepted by most employers and health insurers." },
    { q: "How do I get my prescribed medicine after the call?", a: "Your e-prescription is sent instantly to the CureMedix shop, where you can order it for home delivery." },
    { q: "What medical issues can be treated via online doctor consultations?", a: "Common conditions such as colds, skin issues, allergies, minor infections and follow-up care. Emergencies need in-person care." },
];

// Doctor photo with a fallback (initials) if the image link is broken
const DoctorImg = ({ doc }) => {
    const [failed, setFailed] = useState(false);
    const initials = doc.name.replace("Dr. ", "").split(" ").map((w) => w[0]).join("");
    return failed ? (
        <div className="w-14 h-14 shrink-0 rounded-xl bg-emerald-100 text-teal-700 font-bold flex items-center justify-center">{initials}</div>
    ) : (
        <img src={doc.img} alt={doc.name} onError={() => setFailed(true)} className="w-14 h-14 shrink-0 rounded-xl object-cover" />
    );
};

// Reusable popup shell (dark backdrop, rounded white box, X button) used by all 3 popups
const Modal = ({ title, subtitle, onClose, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4" onClick={onClose}> {/* click outside = close */}
        <div className="w-full max-w-xl bg-base-100 text-base-content rounded-3xl shadow-2xl border border-base-content/10 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-6 py-5 border-b border-base-content/10">
                <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    {subtitle && <p className="text-sm font-semibold text-teal-600">{subtitle}</p>}
                </div>
                <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center"><FiX /></button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const OnlineDoctor = () => {
    const doctorsRef = useRef(null); // the doctor list section (hero button scrolls here)
    const [activeFilter, setActiveFilter] = useState("All Specialists");
    const [bookingDoc, setBookingDoc] = useState(null); // doctor shown in the booking popup
    const [dateIdx, setDateIdx] = useState(0); // selected day (0 = today)
    const [time, setTime] = useState("11:00 AM"); // selected time slot
    const [showRx, setShowRx] = useState(false); // sample sick note / e-prescription popup
    const [showClinics, setShowClinics] = useState(false); // inpatient hospitals popup
    const [cityInput, setCityInput] = useState("");
    const [clinicQuery, setClinicQuery] = useState("");

    // Next 3 days built from today's real date: Today / Tomorrow / weekday name
    const days = [0, 1, 2].map((n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return { label: n === 0 ? "Today" : n === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "long" }), sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    });
    const todayText = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); // issue date on the certificate

    const visibleDoctors = activeFilter === "All Specialists" ? doctors : doctors.filter((d) => d.group === activeFilter);
    const visibleClinics = hospitals.filter((h) => `${h.name} ${h.address}`.toLowerCase().includes(clinicQuery.toLowerCase()));

    const scrollToDoctors = () => doctorsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); // "To the CureMedix Online Doctor"
    const openBooking = (doc) => { setDateIdx(0); setTime("11:00 AM"); setBookingDoc(doc); };

    // "Next: Patient Details" -> closes popup and confirms the chosen slot
    const confirmSlot = () => {
        const summary = `${bookingDoc.name} • ${days[dateIdx].label} (${days[dateIdx].sub}) at ${time}`;
        setBookingDoc(null);
        Swal.fire({ icon: "success", title: "Appointment Requested", text: summary, confirmButtonText: "OK", buttonsStyling: false, customClass: { popup: "rounded-2xl", confirmButton: "px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold" } });
    };

    return (
        <>
            <Helmet>
                <title>CureMedix | Online Doctor</title>
            </Helmet>

            {/* ═════════ 1. HERO ═════════ */}
            <section className="bg-gradient-to-br from-[#04111f] via-[#06232b] to-[#052e2b] text-white">
                <div className="max-w-screen-xl mx-auto px-4 pt-14 pb-24 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Your online doctor 24/7 at your Service...
                        </span>
                        <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
                            Goodbye waiting room.<br /><span className="text-emerald-300">Hello online doctor.</span>
                        </h1>
                        <p className="mt-5 text-base md:text-lg text-white/75 max-w-xl">
                            Speak to a qualified specialist online in just a few minutes via CureMedix. You can receive a certified sick note (AU) and electronic prescriptions directly via the platform.
                        </p>
                        <div className="mt-7 flex flex-col sm:flex-row gap-3">
                            <button onClick={scrollToDoctors} className="btn border-0 bg-gradient-to-r from-emerald-600 to-teal-500 text-white gap-2 shadow-lg shadow-emerald-600/30"><FaStethoscope /> To the CureMedix Online Doctor</button>
                            <button onClick={() => setShowClinics(true)} className="btn bg-white/5 border border-white/15 text-white hover:bg-white/10 gap-2"><FiMapPin className="text-emerald-400" /> Find an inpatient doctor near you</button>
                        </div>
                        <div className="mt-10 pt-5 border-t border-white/10 flex flex-wrap gap-x-10 gap-y-3 text-xs text-white/70">
                            <span className="flex items-center gap-2"><FiShield className="text-emerald-400" /> GDPR &amp; HIPAA Compliant</span>
                            <span className="flex items-center gap-2"><FiFileText className="text-emerald-400" /> Official E-Prescriptions</span>
                            <span className="flex items-center gap-2"><FiUserCheck className="text-emerald-400" /> Licensed Specialists</span>
                        </div>
                    </div>

                    {/* Video-call mockup */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/5 p-2.5 shadow-2xl">
                            <div className="relative h-[26rem] rounded-3xl overflow-hidden bg-slate-800">
                                <img src="https://i.ibb.co/b5zPg2by/online-doctor.jpg" alt="Online Doctor" className="w-full h-full object-cover" /> {/* your original doctor image */}
                                <span className="absolute left-3 top-3 flex items-center gap-1.5 text-[11px] font-semibold bg-black/55 rounded-full px-3 py-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Dr. Sarah Jenkins</span>
                                <span className="absolute right-3 top-3 text-[11px] font-mono text-emerald-300 bg-black/55 rounded px-2 py-1">12:45 Live</span>
                                <div className="absolute right-4 top-1/2 w-20 h-28 rounded-xl border-2 border-white/30 bg-gradient-to-b from-slate-500 to-slate-700" /> {/* small self-view */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 bg-black/60 rounded-2xl px-4 py-2.5">
                                    <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><FiMic /></span>
                                    <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><FiVideo /></span>
                                    <span className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center"><FiMaximize /></span>
                                    <span className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center"><FiPhoneOff /></span>
                                </div>
                            </div>
                        </div>
                        {/* Floating wait-time card */}
                        <div className="absolute -bottom-8 left-2 sm:left-6 lg:-left-6 flex items-center gap-3 bg-white text-slate-800 rounded-2xl px-4 py-3 shadow-xl">
                            <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><FiZap /></span>
                            <div className="text-xs"><p className="font-semibold">Avg. Wait Time</p><p className="font-bold text-teal-600">&lt; 4 Minutes</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═════════ 2. HOW IT WORKS ═════════ */}
            <section className="bg-base-100 py-14 lg:py-16">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="text-center">
                        <p className="text-[11px] font-semibold tracking-wider text-teal-600">SEAMLESS TELEHEALTH</p>
                        <h2 className="text-2xl lg:text-3xl font-bold">How CureMedix Online Doctor Works</h2>
                    </div>
                    <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {steps.map((s, i) => (
                            <div key={s.title} className="relative border border-base-content/10 rounded-2xl p-5 bg-base-100">
                                <span className="absolute right-5 top-4 text-3xl font-bold text-base-content/10">{`0${i + 1}`}</span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-teal-600 flex items-center justify-center text-lg">{s.icon}</div>
                                <h3 className="mt-5 font-semibold">{s.title}</h3>
                                <p className="text-xs text-base-content/60 mt-1.5">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═════════ 3. DOCTOR LIST (hero button scrolls here) ═════════ */}
            <section ref={doctorsRef} className="bg-base-200/60 py-14 lg:py-16 scroll-mt-16">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold tracking-wider text-teal-600">AVAILABLE MEDICAL TEAM</p>
                            <h2 className="text-2xl lg:text-3xl font-bold">Book an Online Consultation</h2>
                            <p className="text-xs text-base-content/60 mt-1">All doctors are board-certified with active license credentials.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filters.map((f) => (
                                <button key={f} onClick={() => setActiveFilter(f)} className={`text-xs font-semibold px-4 py-2 rounded-full border ${activeFilter === f ? "bg-teal-600 border-teal-600 text-white" : "bg-base-100 border-base-content/10 text-base-content/80 hover:border-teal-500"}`}>{f}</button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleDoctors.map((doc) => (
                            <div key={doc.name} className="bg-base-100 border border-base-content/10 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <DoctorImg doc={doc} />
                                    <div>
                                        <span className="text-[9px] font-bold tracking-wider text-teal-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 uppercase">{doc.specialty}</span>
                                        <h3 className="font-bold mt-1 leading-tight">{doc.name}</h3>
                                        <p className="text-[11px] text-base-content/60"><span className="text-amber-500 font-bold">★ {doc.rating.toFixed(1)}</span> ({doc.reviews}) • {doc.years} Yrs Exp.</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-end bg-base-200/70 rounded-xl px-4 py-3">
                                    <div><p className="text-[10px] text-base-content/50">Next Availability</p><p className="text-xs font-bold text-teal-700">{doc.next}</p></div>
                                    <div className="text-right"><p className="text-[10px] text-base-content/50">Consultation Fee</p><p className="text-xs font-bold">{doc.fee}$</p></div>
                                </div>
                                <button onClick={() => openBooking(doc)} className="btn btn-sm w-full mt-4 border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2"><FiCalendar /> Book Appointment</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═════════ 4. DIGITAL DOCUMENTS ═════════ */}
            <section className="bg-base-100 py-14 lg:py-20">
                <div className="max-w-screen-xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1"><FiShield /> Digital Medical Documents</span>
                        <h2 className="mt-5 text-3xl lg:text-4xl font-bold leading-tight">Get official E-Prescriptions &amp; Sick Notes directly on your phone</h2>
                        <p className="mt-5 text-sm text-base-content/70 max-w-lg">No need to travel to a clinic when feeling unwell. Our online doctors can issue digitally signed sick notes (Arbeitsunfähigkeitsbescheinigung) accepted by employers and health insurance, as well as instant electronic prescriptions redeemable in our online shop.</p>
                        <ul className="mt-6 space-y-4">
                            {[["Accepted by Health Insurances", "Compliant with European telemedicine standards."], ["Direct Pharmacy Transfer", "Automatically send prescribed medicine to CureMedix shop for home delivery."]].map(([t, d]) => (
                                <li key={t} className="flex gap-3">
                                    <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-50 text-teal-600 flex items-center justify-center text-xs"><FiCheck /></span>
                                    <div><p className="text-xs font-bold">{t}</p><p className="text-[11px] text-base-content/60">{d}</p></div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowRx(true)} className="btn btn-sm mt-7 border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2"><FiFileText /> View Sample Sick Note &amp; RX</button>
                    </div>

                    {/* Sample certificate card */}
                    <div className="max-w-md w-full mx-auto bg-base-100 border border-base-content/10 rounded-3xl p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center"><FaStethoscope /></span>
                                <div><p className="text-xs font-bold">CureMedix Health Network</p><p className="text-[10px] text-base-content/50">Official Electronic Certificate</p></div>
                            </div>
                            <span className="text-[9px] font-bold text-teal-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">VALID &amp; VERIFIED</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 border border-base-content/10 rounded-xl p-3 text-xs">
                            <div><p className="text-[9px] text-base-content/50 uppercase">Patient Name</p><p className="font-bold">Alex Morgan</p></div>
                            <div><p className="text-[9px] text-base-content/50 uppercase">Issue Date</p><p className="font-bold">{todayText}</p></div>
                        </div>
                        <div className="mt-3 border border-base-content/10 rounded-xl p-3 text-xs">
                            <p className="text-[9px] text-base-content/50 uppercase">Diagnosis / Prescribed Care</p>
                            <p className="font-bold mt-0.5">Acute Respiratory Infection (ICD-10 J06.9)</p>
                            <p className="text-[10px] text-base-content/60">Prescribed: Budesonide Suspension 0.5mg &amp; Paracetamol 500mg</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-base-200 text-[10px] font-bold flex items-center justify-center">DR</span>
                                <div><p className="text-[11px] font-bold">Dr. Markus Webber</p><p className="text-[9px] text-base-content/50">License #DE-894210</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-0.5">{[0, 1, 2, 3].map((i) => <span key={i} className="w-3.5 h-3.5 border-2 border-base-content rounded-sm" />)}</div> {/* mini QR icon */}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═════════ 5. FAQ ═════════ */}
            <section className="bg-base-100 border-t border-base-content/10 py-14 lg:py-16 pb-20">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center">
                        <p className="text-[11px] font-semibold tracking-wider text-teal-600">PATIENT QUESTIONS</p>
                        <h2 className="text-2xl lg:text-3xl font-bold">Frequently Asked Telehealth Questions</h2>
                    </div>
                    <div className="mt-8 space-y-3">
                        {faqs.map((f) => (
                            <div key={f.q} className="collapse collapse-arrow bg-base-100 border border-base-content/10 rounded-xl">
                                <input type="radio" name="doctor-faq" /> {/* radio = only one item open at a time */}
                                <div className="collapse-title text-sm font-semibold">{f.q}</div>
                                <div className="collapse-content text-xs text-base-content/70"><p>{f.a}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═════════ POPUP: Book Video Consultation ═════════ */}
            {bookingDoc && (
                <Modal title="Book Video Consultation" subtitle={bookingDoc.name} onClose={() => setBookingDoc(null)}>
                    <p className="text-sm font-semibold mb-3">1. Select Date</p>
                    <div className="grid grid-cols-3 gap-3">
                        {days.map((d, i) => (
                            <button key={d.label} onClick={() => setDateIdx(i)} className={`rounded-xl border py-2.5 text-center ${dateIdx === i ? "border-teal-500 bg-emerald-50 text-teal-700" : "border-base-content/10 hover:border-teal-400"}`}>
                                <p className="text-sm font-bold">{d.label}</p><p className="text-[11px] opacity-70">{d.sub}</p>
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-semibold mt-6 mb-3">2. Available Time Slots</p>
                    <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((t) => (
                            <button key={t} onClick={() => setTime(t)} className={`rounded-xl border py-2.5 text-sm font-bold ${time === t ? "border-teal-500 bg-emerald-50 text-teal-700" : "border-base-content/10 hover:border-teal-400"}`}>{t}</button>
                        ))}
                    </div>
                    <button onClick={confirmSlot} className="btn w-full mt-5 border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 rounded-xl">Next: Patient Details <FiArrowRight /></button>
                </Modal>
            )}

            {/* ═════════ POPUP: Sample E-Prescription ═════════ */}
            {showRx && (
                <Modal title="Sample E-Prescription Download" onClose={() => setShowRx(false)}>
                    <div className="bg-base-200/70 rounded-2xl p-4 text-sm">
                        <div className="flex justify-between gap-3"><p className="font-bold">Prescription ID: #RX-2026-9912</p><p className="font-bold text-emerald-600 text-xs sm:text-sm">Active / Unredeemed</p></div>
                        <p className="text-base-content/70 mt-3">1× Budesonide Nebuliser Suspension BP (0.5mg/2ml)</p>
                        <p className="text-base-content/70 mt-2">1× Paracetamol 500mg (20× Tablets)</p>
                    </div>
                    {/* Demo button: shows a notice, since this is only a sample document */}
                    <button onClick={() => Swal.fire({ icon: "info", title: "Sample only", text: "This is a demo document, so there is no file to download.", buttonsStyling: false, customClass: { popup: "rounded-2xl", confirmButton: "px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold" } })} className="btn w-full mt-4 border-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl"><FiDownload /> Download PDF Copy</button>
                </Modal>
            )}

            {/* ═════════ POPUP: Inpatient hospitals ═════════ */}
            {showClinics && (
                <Modal title="Find Inpatient Hospitals & Local Clinics" onClose={() => setShowClinics(false)}>
                    <div className="flex gap-3">
                        <input value={cityInput} onChange={(e) => setCityInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setClinicQuery(cityInput)} placeholder="Enter City or Zip Code (e.g., Berlin, 10115)..." className="flex-1 min-w-0 bg-base-200/70 border border-base-content/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
                        <button onClick={() => setClinicQuery(cityInput)} className="btn border-0 bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2"><FiSearch className="hidden sm:block" /> Search</button>
                    </div>
                    <div className="mt-5 space-y-3">
                        {visibleClinics.length === 0 && <p className="text-center text-sm text-base-content/60 py-6">No clinics found for that search.</p>}
                        {visibleClinics.map((h) => (
                            <div key={h.name} className="flex items-center justify-between gap-3 bg-base-200/60 border border-base-content/10 rounded-2xl p-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-sm">{h.name}</p>
                                    <p className="text-xs text-base-content/60">{h.address} • {h.distance}</p>
                                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-md px-2 py-0.5">{h.tag}</span>
                                </div>
                                {/* Opens the real place in Google Maps */}
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name} ${h.address}`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline border-teal-600 text-teal-700 hover:bg-teal-600 hover:border-teal-600 hover:text-white rounded-lg">Directions</a>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default OnlineDoctor;