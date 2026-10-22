// NEW section: DaisyUI "collapse" accordion (radio group = one open at a time)
const faqs = [
    { q: "How do I upload my prescription for medicine verification?", a: "Click “Upload Prescription” on the homepage, attach a clear photo or PDF of your Rx slip, and our pharmacists will verify it before dispatch." },
    { q: "Are all medicines supplied by CureMedix 100% genuine?", a: "Yes. We source directly from WHO-GMP certified manufacturers and every order is double-checked by a licensed pharmacist." },
    { q: "How does the 2-Hour Express Delivery service work?", a: "Eligible orders placed in covered metropolitan areas are packed and dispatched immediately by our dedicated delivery fleet." },
];

const FAQ = () => (
    <section className="bg-base-200/60 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4">
            <div className="text-center">
                <p className="text-[11px] font-semibold tracking-wider text-emerald-600">HELP CENTER</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-base-content">Frequently Asked Questions</h2>
                <p className="text-xs text-base-content/60 mt-1">Have questions about order fulfillment, Rx verification, or returns?</p>
            </div>
            <div className="mt-8 space-y-3">
                {faqs.map((f, i) => (
                    <div key={i} className="collapse collapse-arrow bg-base-100 border border-base-content/10 rounded-xl">
                        <input type="radio" name="home-faq" defaultChecked={i === 0} /> {/* radio => only one item open */}
                        <div className="collapse-title text-sm font-semibold text-base-content">{f.q}</div>
                        <div className="collapse-content text-xs text-base-content/70"><p>{f.a}</p></div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default FAQ;