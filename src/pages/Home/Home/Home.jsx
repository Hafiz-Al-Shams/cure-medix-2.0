import { Helmet } from "react-helmet-async"; // sets the page <title>
import Banner from "../Banner/Banner"; // dark hero + featured slider
import CategoryCards from "../CategoryCards/CategoryCards";
import Discount from "../Discount/Discount";
import Testimonial from "./Testimonial";
import KnowUs from "../KnowUs/KnowUs";
import Qualities from "./Qualities/Qualities";
import PrescriptionCTA from "../PrescriptionCTA";
import Commitments from "../Commitments";
import Articles from "../Articles";
import FAQ from "../FAQ";

// Each section now owns its own full-width background + container,
// so Home only controls ORDER (matches the mockup top to bottom).
const Home = () => {
    return (
        <div className="bg-base-100">
            <Helmet>
                <title>CureMedix | Home</title>
            </Helmet>
            <Banner />
            <PrescriptionCTA />
            <CategoryCards />
            <Discount />
            <Commitments />
            <Testimonial />
            <KnowUs />
            <Articles />
            <FAQ />
            <Qualities />
            {/* Newsletter & AppPromotion are not in the new mockup, so they are no longer rendered.
                Their files are untouched; re-import and drop them here anytime. */}
        </div>
    );
};

export default Home;
