import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

// Button appears after the user scrolls this many pixels
const SHOW_AFTER = 300;

// Progress ring maths (SVG circle)
const RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const BackToTop = () => {
    const [visible, setVisible] = useState(false); // show / hide the button
    const [progress, setProgress] = useState(0); // 0 → 1 : how far down the page the user is

    useEffect(() => {
        let ticking = false;

        const update = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            setVisible(scrollTop > SHOW_AFTER);
            setProgress(maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0);
            ticking = false;
        };

        // throttle with requestAnimationFrame so scrolling stays smooth
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        };

        update(); // set the correct state on first render
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    const scrollToTop = () => {
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
            tabIndex={visible ? 0 : -1}
            className={`group fixed bottom-5 right-4 sm:bottom-8 sm:right-8 z-50 w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
        >
            {/* Scroll-progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
                <circle
                    cx="24"
                    cy="24"
                    r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                    className="transition-[stroke-dashoffset] duration-150"
                />
            </svg>
            <FiArrowUp className="relative text-xl transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
    );
};

export default BackToTop;