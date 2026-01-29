// components/Testimoni/index.jsx - PERFECT AS IS ✅
import React from "react";
import TestimoniHeader from "./TestimoniHeader";
import TestimoniSlider from "./TestimoniSlider";
import { testimonials } from "../../data/testimoniData";

// Import images
import matcha from "../../assets/matcha.png";
import jasmine from "../../assets/jasmine.png";

const Testimoni = () => {
    return (
    <div className="max-w-[1200px] mx-auto my-20">
        <TestimoniHeader matchaImage={matcha} jasmineImage={jasmine} />
        <TestimoniSlider testimonials={testimonials} />
    </div>
    );
};

export default Testimoni;
