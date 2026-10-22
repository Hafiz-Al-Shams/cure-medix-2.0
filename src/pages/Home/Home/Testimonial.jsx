import { FiCheckCircle } from "react-icons/fi";

const Testimonial = () => {
    // Same review data as before (image field no longer needed: avatars are initials now)
    const testimonials = [
        { name: "Luca Moretti", rating: 5, review: "9.5/10 - One of the best online pharmacies and a trustworthy one too. Highly recommended!" },
        { name: "Sophie Müller", rating: 5, review: "They are super fast. Highly recommended." },
        { name: "Mateo Novak", rating: 5, review: "Great delivery service and well-organized customer service. Recommend!" },
        { name: "Elena Petrova", rating: 4.5, review: "Their delivery system is top-notch. Satisfied with their service." },
        { name: "Oliver Dupont", rating: 5, review: "Service is really praiseworthy. Easy communication, supportive help line. Quick delivery impressed me." },
        { name: "Isla O'Connor", rating: 5, review: "Excellent service, good behavior, fastest delivery as promised. Best wishes to you!" },
        { name: "Theo van Dijk", rating: 5, review: "One of the best favorite online shops. Highly recommended." },
        { name: "Amelie Jensen", rating: 5, review: "One of the leading companies. Amazed and their service is very good." },
    ];

    // "Luca Moretti" -> "LM"
    const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

    return (
        <section className="bg-base-200/60 py-12 lg:py-16">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="text-center">
                    <p className="text-[11px] font-semibold tracking-wider text-emerald-600">CUSTOMER SATISFACTION</p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-base-content">Reviews From Our Valuable Customers</h2>
                    <p className="text-xs text-base-content/60 mt-1">See why thousands trust CureMedix for their ongoing healthcare needs.</p>
                </div>
                <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {testimonials.slice(0, 4).map((t, i) => ( // mockup shows 4; change 4 to 8 to show all
                        <div key={i} className="bg-base-100 border border-base-content/10 rounded-2xl p-4 flex flex-col">
                            <div className="text-yellow-500 text-sm">{"★".repeat(Math.floor(t.rating))}{t.rating % 1 !== 0 && "☆"}</div>
                            <p className="text-xs italic text-base-content/70 mt-2 flex-1">&ldquo;{t.review}&rdquo;</p>
                            <div className="flex items-center gap-2 mt-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center">{initials(t.name)}</div>
                                <div>
                                    <p className="text-xs font-semibold text-base-content">{t.name}</p>
                                    <p className="text-[10px] text-emerald-600 flex items-center gap-1"><FiCheckCircle /> Verified Patient</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonial;