import Marquee from "react-fast-marquee";



const MarqueeText = () => {
    return (
        <div>
            <div className="py-2">
                <Marquee speed={60} gradient={false}>
                    <div className="text-emerald-800 text-2xl font-semibold pb-10">
                        Your online doctor 24/7 at your Service...
                    </div>
                </Marquee>
            </div>
        </div>
    );
};

export default MarqueeText;