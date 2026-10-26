import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaStethoscope, FaHospital } from "react-icons/fa";
import { FiShield, FiFileText, FiUserCheck, FiCalendar, FiVideo, FiX, FiCheck, FiArrowRight, FiClock } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import BackToTop from "../../components/BackToTop/BackToTop"; // NEW: back to top button

// ⚠️ Change this if your checkout route is different
const PAYMENT_PATH = "/dashboard/payment";

// ───────────── Static content (only text, nothing fake about doctors) ─────────────
const steps = [
    { icon: <FiUserCheck />, title: "1. Choose Specialist", text: "Select from verified general practitioners, pediatricians, dermatologists, and specialists." },
    { icon: <FiCalendar />, title: "2. Pick Time Slot", text: "Book an immediate consultation or schedule a convenient appointment for later." },
    { icon: <FiVideo />, title: "3. Video Consult", text: "Connect via encrypted high-definition video call right from your browser or phone." },
    { icon: <FiFileText />, title: "4. RX & Sick Note", text: "Receive instant e-prescriptions sent to our pharmacy shop or download certified sick notes." },
];
const faqs = [
    { q: "Is an online sick note recognized by my employer?", a: "Yes. Our licensed doctors issue digitally signed sick notes that are accepted by most employers and health insurers." },
    { q: "How do I get my prescribed medicine after the call?", a: "Your e-prescription is sent instantly to the CureMedix shop, where you can order it for home delivery." },
    { q: "What medical issues can be treated via online doctor consultations?", a: "Common conditions such as colds, skin issues, allergies, minor infections and follow-up care. Emergencies need in-person care." },
];

// "2026-10-26" in the user's LOCAL time (en-CA gives YYYY-MM-DD)
const toISO = (d) => d.toLocaleDateString("en-CA");

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

// Reusable popup shell used by both popups.
// tinted = light grey header strip (booking popup) | plain = small title + bare X + inset divider (prescription popup)
const Modal = ({ title, subtitle, onClose, size = "max-w-xl", tinted = false, plain = false, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}> {/* click outside = close */}
        <div className={`w-full ${size} bg-base-100 text-base-content rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className={plain ? "mx-6 pt-6 pb-4 border-b border-base-content/10 flex items-center justify-between" : `flex items-start justify-between px-6 py-5 border-b border-base-content/10 ${tinted ? "bg-base-200/50" : ""}`}>
                <div>
                    <h3 className={plain ? "text-base font-bold" : "text-lg font-bold"}>{title}</h3>
                    {subtitle && <p className="text-sm font-semibold text-teal-600">{subtitle}</p>}
                </div>
                <button onClick={onClose} aria-label="Close" className={plain ? "text-base-content/50 hover:text-base-content text-lg" : "w-9 h-9 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center"}><FiX /></button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const OnlineDoctor = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const location = useLocation();

    const doctorsRef = useRef(null); // the doctor list section (hero button scrolls here)
    const [activeFilter, setActiveFilter] = useState("All Specialists");
    const [bookingDoc, setBookingDoc] = useState(null); // doctor shown in the booking popup
    const [dateIdx, setDateIdx] = useState(0); // selected day (0 = tomorrow)
    const [time, setTime] = useState(""); // selected time slot (empty until the user picks one)
    const [showRx, setShowRx] = useState(false); // sample sick note / e-prescription popup
    const [step, setStep] = useState(1); // booking popup: 1 = date & time, 2 = patient details
    const [fullName, setFullName] = useState("");
    const [reason, setReason] = useState("");
    const [formError, setFormError] = useState("");

    // 🔥 Doctors come from the database
    const { data: doctors = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["doctors"],
        queryFn: async () => (await axiosSecure.get("/doctors")).data,
    });

    // Bookable days = tomorrow + the next 2 days, always built from today's REAL date
    const days = [1, 2, 3].map((n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return {
            label: n === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "long" }),
            sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            full: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
            iso: toISO(d),
        };
    });
    const selectedDay = days[dateIdx];
    const todayText = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); // issue date on the sample certificate

    // 🔥 Times already booked for this doctor on the selected day (those slots get disabled)
    const { data: bookedTimes = [], isFetching: slotsLoading } = useQuery({
        queryKey: ["booked-slots", bookingDoc?._id, selectedDay.iso],
        enabled: !!bookingDoc,
        queryFn: async () => (await axiosSecure.get("/appointment-slots", { params: { doctorId: bookingDoc._id, date: selectedDay.iso } })).data,
    });
    const validTime = bookedTimes.includes(time) ? "" : time; // a booked slot can never stay selected

    // Filter chips built from the real doctors
    const filters = ["All Specialists", ...new Set(doctors.map((d) => d.group))];
    const visibleDoctors = activeFilter === "All Specialists" ? doctors : doctors.filter((d) => d.group === activeFilter);

    const scrollToDoctors = () => doctorsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Opens the booking popup (login required)
    const openBooking = (doc) => {
        if (!user?.email) {
            Swal.fire({
                title: "You are not Logged In",
                text: "Please login to book an appointment.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, login!",
                buttonsStyling: false,
                reverseButtons: true,
                customClass: {
                    popup: "rounded-2xl",
                    title: "text-xl font-bold",
                    actions: "gap-3",
                    confirmButton: "px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors",
                    cancelButton: "px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium transition-colors",
                },
            }).then((result) => {
                if (result.isConfirmed) navigate("/signIn", { state: { from: location } }); // comes back here after login
            });
            return;
        }
        setDateIdx(0);
        setTime("");
        setStep(1);
        setFullName(user.displayName || "");
        setReason("");
        setFormError("");
        setBookingDoc(doc);
    };
    const closeBooking = () => setBookingDoc(null);

    // Step 2 button: validates, then sends the booking to the checkout page (payment comes next)
    const goToPayment = () => {
        if (!fullName.trim() || !reason.trim()) { setFormError("Please enter your name and the reason for your visit."); return; }
        const booking = {
            doctorId: bookingDoc._id,
            doctorName: bookingDoc.name,
            specialty: bookingDoc.specialty,
            doctorImg: bookingDoc.img,
            fee: bookingDoc.fee,
            dateISO: selectedDay.iso,
            dateText: selectedDay.full,
            time: validTime,
            patientName: fullName.trim(),
            reason: reason.trim(),
        };
        closeBooking();
        navigate(PAYMENT_PATH, { state: { booking } });
    };

    const selectedBtn = "border-teal-500 bg-teal-50 text-teal-700 [[data-theme=dark]_&]:bg-teal-900/30 [[data-theme=dark]_&]:text-teal-300";

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
                            <FiClock /> Your online doctor 24/7 at your Service...
                        </span>
                        <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                            Goodbye waiting room.<br /><span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Hello online doctor.</span>
                        </h1>
                        <p className="mt-5 text-base md:text-lg text-white/75 max-w-xl">
                            Speak to a qualified specialist online in just a few minutes via CureMedix. You can receive a certified sick note (AU) and electronic prescriptions directly via the platform.
                        </p>
                        <div className="mt-7">
                            <button onClick={scrollToDoctors} className="btn border-0 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 shadow-lg shadow-emerald-500/30"><FaStethoscope /> To the CureMedix Online Doctor</button>
                        </div>
                        <div className="mt-10 pt-5 border-t border-white/10 flex flex-wrap justify-between gap-x-8 gap-y-3 text-xs text-white/70 max-w-2xl">
                            <span className="flex items-center gap-2"><FiShield className="text-emerald-400" /> GDPR &amp; HIPAA Compliant</span>
                            <span className="flex items-center gap-2"><FiFileText className="text-emerald-400" /> Official E-Prescriptions</span>
                            <span className="flex items-center gap-2"><FiUserCheck className="text-emerald-400" /> Licensed Specialists</span>
                        </div>
                    </div>

                    {/* Video-call mockup */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/5 p-2.5 shadow-2xl">
                            <div className="relative h-[26rem] rounded-3xl overflow-hidden bg-slate-800">
                                <img src="https://i.ibb.co/b5zPg2by/online-doctor.jpg" alt="Online Doctor" className="w-full h-full object-cover" />
                                {doctors[0] && <span className="absolute left-3 top-3 flex items-center gap-1.5 text-[11px] font-semibold bg-black/55 rounded-full px-3 py-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {doctors[0].name}</span>}
                                <span className="absolute right-3 top-3 text-[11px] font-semibold text-emerald-300 bg-black/55 rounded-full px-3 py-1">Encrypted HD Video</span>
                            </div>
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
                                <span className="absolute right-5 top-4 text-3xl font-bold text-teal-600/15">{`0${i + 1}`}</span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-teal-600 flex items-center justify-center text-lg">{s.icon}</div>
                                <h3 className="mt-5 font-semibold">{s.title}</h3>
                                <p className="text-xs text-base-content/60 mt-1.5">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═════════ 3. DOCTOR LIST (hero button scrolls here) ═════════ */}
            <section ref={doctorsRef} className="bg-base-200/60 border-y border-base-content/5 py-14 lg:py-16 scroll-mt-28">
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

                    {/* Loading / error / empty states */}
                    {isLoading && <div className="flex justify-center py-16"><span className="loading loading-bars loading-lg"></span></div>}
                    {isError && (
                        <div className="mt-8 rounded-2xl border border-dashed border-base-content/20 bg-base-100 px-6 py-12 text-center">
                            <p className="font-semibold">Could not load doctors</p>
                            <p className="text-sm text-base-content/60 mt-1">Please check your connection and try again.</p>
                            <button onClick={() => refetch()} className="btn btn-sm mt-4 border-0 bg-teal-600 hover:bg-teal-700 text-white">Try again</button>
                        </div>
                    )}
                    {!isLoading && !isError && visibleDoctors.length === 0 && <p className="text-center text-base-content/60 py-16">No doctors available in this category right now.</p>}

                    <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleDoctors.map((doc) => (
                            <div key={doc._id} className="bg-base-100 border border-base-content/10 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <DoctorImg doc={doc} />
                                    <div>
                                        <span className="text-[9px] font-bold tracking-wider text-teal-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 uppercase">{doc.specialty}</span>
                                        <h3 className="font-bold mt-1 leading-tight">{doc.name}</h3>
                                        <p className="text-[11px] text-base-content/60"><span className="text-amber-500 font-bold">★ {Number(doc.rating).toFixed(1)}</span> ({doc.reviews}) • {doc.years} Yrs Exp.</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-end bg-base-200/70 rounded-xl px-4 py-3">
                                    {/* Always "Tomorrow", so this can never show an old date */}
                                    <div><p className="text-[10px] text-base-content/50">Next Availability</p><p className="text-xs font-bold text-teal-700">Tomorrow {doc.nextTime}</p></div>
                                    <div className="text-right"><p className="text-[10px] text-base-content/50">Consultation Fee</p><p className="text-xs font-bold">{doc.fee}$</p></div>
                                </div>
                                <button onClick={() => openBooking(doc)} className="btn btn-sm w-full mt-4 border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-md shadow-teal-600/25"><FiCalendar /> Book Appointment</button>
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
                                <span className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center"><FaHospital /></span>
                                <div><p className="text-xs font-bold">CureMedix Health Network</p><p className="text-[10px] text-base-content/50">Official Electronic Certificate</p></div>
                            </div>
                            <span className="text-[9px] font-bold text-teal-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">SAMPLE</span>
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
                            <div className="grid grid-cols-2 gap-0.5">{[0, 1, 2, 3].map((i) => <span key={i} className="w-3.5 h-3.5 border-2 border-base-content rounded-sm" />)}</div>
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
                                <input type="radio" name="doctor-faq" />
                                <div className="collapse-title text-sm font-semibold">{f.q}</div>
                                <div className="collapse-content text-xs text-base-content/70"><p>{f.a}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═════════ POPUP: Book Video Consultation (step 1 = date/time, step 2 = patient details) ═════════ */}
            {bookingDoc && (
                <Modal title="Book Video Consultation" subtitle={bookingDoc.name} onClose={closeBooking} tinted>
                    {step === 1 ? (
                        <>
                            <p className="text-sm font-semibold mb-3">1. Select Date</p>
                            <div className="grid grid-cols-3 gap-3">
                                {days.map((d, i) => (
                                    <button key={d.iso} onClick={() => { setDateIdx(i); setTime(""); }} className={`rounded-xl border py-2.5 text-center ${dateIdx === i ? selectedBtn : "border-base-content/10 hover:border-teal-400"}`}>
                                        <p className="text-sm font-bold">{d.label}</p><p className="text-[11px] opacity-70">{d.sub}</p>
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-semibold mt-6 mb-3 flex items-center gap-2">2. Available Time Slots {slotsLoading && <span className="loading loading-spinner loading-xs text-teal-600"></span>}</p>
                            <div className="grid grid-cols-3 gap-3">
                                {bookingDoc.slots.map((t) => {
                                    const booked = bookedTimes.includes(t);
                                    return (
                                        <button key={t} disabled={booked} onClick={() => setTime(t)} title={booked ? "Already booked" : ""} className={`rounded-xl border py-2.5 text-sm font-bold ${booked ? "border-base-content/10 text-base-content/30 line-through cursor-not-allowed bg-base-200/50" : validTime === t ? selectedBtn : "border-base-content/10 hover:border-teal-400"}`}>{t}</button>
                                    );
                                })}
                            </div>
                            {bookedTimes.length > 0 && <p className="text-[11px] text-base-content/50 mt-3">Crossed-out times are already booked.</p>}
                            <button onClick={() => setStep(2)} disabled={!validTime} className="btn w-full mt-5 border-0 bg-teal-600 hover:bg-teal-700 text-white gap-2 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">Next: Patient Details <FiArrowRight /></button>
                        </>
                    ) : (
                        <>
                            {/* Booking summary */}
                            <div className="rounded-2xl bg-base-200/70 border border-base-content/10 p-4 text-sm flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold truncate">{bookingDoc.name}</p>
                                    <p className="text-xs text-base-content/60">{selectedDay.full} • {validTime}</p>
                                </div>
                                <p className="font-bold text-teal-600 shrink-0">{bookingDoc.fee}$</p>
                            </div>

                            <label className="text-sm font-semibold block mt-4">Full Name</label>
                            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="mt-1.5 w-full bg-base-200/60 border border-base-content/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
                            <label className="text-sm font-semibold block mt-4">Reason for Visit / Symptoms</label>
                            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Describe symptoms briefly (e.g. fever, cough, skin allergy)..." className="mt-1.5 w-full bg-base-200/60 border border-base-content/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 resize-y" />
                            {formError && <p className="text-xs text-red-500 mt-2">{formError}</p>}
                            <div className="mt-5 flex gap-3">
                                <button onClick={() => setStep(1)} className="btn flex-1 border-0 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl [[data-theme=dark]_&]:bg-slate-700 [[data-theme=dark]_&]:text-slate-100">← Back</button>
                                <button onClick={goToPayment} className="btn flex-[2] border-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">Continue to Payment <FiArrowRight /></button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {/* ═════════ POPUP: Sample E-Prescription (demo only: no download button) ═════════ */}
            {showRx && (
                <Modal title="Sample E-Prescription" onClose={() => setShowRx(false)} size="max-w-lg" plain>
                    <div className="bg-base-200/70 rounded-2xl p-4 text-sm">
                        <div className="flex justify-between gap-3"><p className="font-bold">Prescription ID: #RX-2026-9912</p><p className="font-bold text-emerald-600 text-xs sm:text-sm">Active / Unredeemed</p></div>
                        <p className="text-base-content/70 mt-3">1× Budesonide Nebuliser Suspension BP (0.5mg/2ml)</p>
                        <p className="text-base-content/70 mt-2">1× Paracetamol 500mg (20× Tablets)</p>
                    </div>
                </Modal>
            )}

            <BackToTop /> {/* NEW */}
        </>
    );
};

export default OnlineDoctor;