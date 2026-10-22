import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const CategoryCards = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Counts medicines per category (unchanged logic)
        const fetchMedicines = async () => {
            try {
                const res = await fetch("https://cure-medix-server.vercel.app/medicines");
                const medicinesData = await res.json();
                const newCategories = {};
                medicinesData.forEach((medicine) => {
                    if (!newCategories[medicine.category]) {
                        newCategories[medicine.category] = { name: medicine.category, count: 0, image: null };
                    }
                    newCategories[medicine.category].count += 1;
                });
                return Object.values(newCategories).sort((a, b) => b.count - a.count); // biggest first
            } catch (error) {
                console.log("Error fetching medicines data:", error);
                return [];
            }
        };

        // Category images (unchanged logic)
        const fetchCategoryImages = async () => {
            try {
                const res = await fetch("https://cure-medix-server.vercel.app/categoryImages");
                return await res.json();
            } catch (error) {
                console.log("Error fetching category images data:", error);
                return [];
            }
        };

        // Merge counts + images by category name
        const fetchAndCombineData = async () => {
            const [medicineCategories, categoryImages] = await Promise.all([fetchMedicines(), fetchCategoryImages()]);
            const imageMap = categoryImages.reduce((map, item) => {
                map[item.categoryName] = item.imageUrl;
                return map;
            }, {});
            setCategories(medicineCategories.map((c) => ({ ...c, image: imageMap[c.name] || c.image })));
        };

        fetchAndCombineData();
    }, []);

    return (
        <section className="max-w-screen-xl mx-auto px-4 py-12 lg:py-16">
            {/* Section heading: small teal label + title + right-side blurb */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                <div>
                    <p className="text-[11px] font-semibold tracking-wider text-emerald-600">MEDICAL CATALOG</p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-base-content">Our Top Categories</h2>
                </div>
                <p className="text-xs text-base-content/60 max-w-xs md:text-right">Browse through our curated inventory of prescription and over-the-counter medical categories.</p>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.slice(0, 5).map((category, i) => ( // mockup shows 5 cards; remove slice to show all
                    <div key={i} className="relative bg-base-100 border border-base-content/10 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-shadow">
                        <span className="absolute right-5 top-5 z-[1] text-[10px] font-semibold bg-neutral text-neutral-content rounded px-1.5 py-0.5">{category.count} available</span>
                        <div className="h-32 lg:h-40 rounded-xl overflow-hidden bg-base-200">
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="mt-3 font-semibold text-sm text-base-content">{category.name}</h3>
                        <p className="text-[11px] text-base-content/60">{category.count} medicines available</p>
                        {/* Same destination as before */}
                        <Link to={`/categoryDetails/${category.name}`} className="btn btn-xs btn-outline w-full mt-3 gap-1 border-base-content/20">
                            Details <FiChevronRight />
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoryCards;