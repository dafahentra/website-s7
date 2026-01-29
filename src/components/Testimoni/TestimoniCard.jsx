// components/Testimoni/TestimoniCard.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import { TYPOGRAPHY, RADIUS, SHADOWS } from "../../styles/designSystem";

const TestimoniCard = ({ testimonial }) => {
    return (
    <div className="w-full max-w-sm">
        <div className={`h-60 ${RADIUS.image.responsive} overflow-hidden bg-gray-50 py-4 px-6 ${SHADOWS.card.responsive}`}>
        <div className="flex gap-1">
            <span className="text-green-500">&#x275D;</span>
            <p className={`text-gray-900 ${TYPOGRAPHY.body.regular}`}>
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
            className={RADIUS.circle}
        />
        <span className={`mt-4 text-gray-600 ${TYPOGRAPHY.weight.semibold} ${TYPOGRAPHY.body.default}`}>
            {testimonial.name}
        </span>
        </div>
    </div>
    );
};

export default React.memo(TestimoniCard);
