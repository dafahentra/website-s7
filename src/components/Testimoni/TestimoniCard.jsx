// components/Testimoni/TestimoniCard.jsx
import React from "react";

const TestimoniCard = ({ testimonial }) => {
return (
<div className="w-full max-w-sm">
    <div className="h-60 rounded-3xl overflow-hidden bg-[#fbfbfb] py-4 px-6 shadow-xl">
    <div className="flex gap-1">
        <span className="text-green-500">&#x275D;</span>
        <p className="text-[#18191f] text-base">
        {testimonial.description}{" "}
        {testimonial.icon && <span className="text-red-500">&#10084;</span>}
        </p>
    </div>
    </div>
    <div className="flex flex-col items-center -ml-2 mt-5 overflow-hidden">
    <img
        src={testimonial.img}
        alt={testimonial.name}
        width={50}
        className="rounded-full"
    />
    <span className="mt-4 text-[#444] font-semibold text-lg">
        {testimonial.name}
    </span>
    </div>
</div>
);
};

export default TestimoniCard;