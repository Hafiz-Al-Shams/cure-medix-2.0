import { Link } from "react-router-dom";

// NEW section: static article cards. Swap images/links for your real articles later.
const articles = [
    { tag: "WELLNESS & IMMUNITY", title: "5 Essential Vitamins & Supplements for Daily Immunity Boost", text: "Discover how Vitamin D3, Zinc, and Vitamin C interact to strengthen your body's immune defense during seasonal shifts.", meta: "Oct 20, 2026 • 4 min read", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800" },
    { tag: "PHARMACOLOGY", title: "Understanding Rx Labels: How to Avoid Dosage Errors", text: "A clear guide on reading pharmaceutical instructions, understanding warnings, and managing active ingredients safely.", meta: "Oct 18, 2026 • 6 min read", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800" },
    { tag: "TELEMEDICINE", title: "When to Choose Online Tele-Consultation vs ER Visit", text: "Key indicators on whether your symptoms can be safely addressed via digital doctor consultations or require immediate emergency care.", meta: "Oct 12, 2026 • 5 min read", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800" },
];

const Articles = () => (
    <section className="bg-base-100 py-12 lg:py-16">
        <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[11px] font-semibold tracking-wider text-emerald-600">HEALTH EDUCATION</p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-base-content">Latest Medical Insights</h2>
                </div>
                <Link to="/shop" className="text-xs font-semibold text-emerald-600">View All Articles →</Link>
            </div>
            <div className="mt-6 grid md:grid-cols-3 gap-5">
                {articles.map((a) => (
                    <article key={a.title} className="bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden shadow-sm">
                        <img src={a.image} alt={a.title} className="w-full h-44 object-cover bg-base-200" />
                        <div className="p-4">
                            <p className="text-[10px] font-semibold tracking-wider text-emerald-600">{a.tag}</p>
                            <h3 className="font-semibold text-base-content mt-1">{a.title}</h3>
                            <p className="text-xs text-base-content/60 mt-2">{a.text}</p>
                            <div className="flex justify-between items-center mt-4 text-[10px] text-base-content/50">
                                <span>{a.meta}</span>
                                <span className="font-semibold text-emerald-600">Read More →</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

export default Articles;