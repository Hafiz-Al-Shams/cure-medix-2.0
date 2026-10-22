
import { useState, useEffect } from 'react';

export function useDaisyTheme() {
    // Read initial theme from the <html> attribute
    const [theme, setTheme] = useState(
        () => document.documentElement.getAttribute('data-theme') || 'light'
    );

    useEffect(() => {
        // Watch for changes to data-theme on <html>
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.type === 'attributes' && m.attributeName === 'data-theme') {
                    setTheme(document.documentElement.getAttribute('data-theme') || 'light');
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return theme; // e.g. "light" or "dark"
}
