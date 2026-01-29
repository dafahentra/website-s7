// components/Testimoni/TestimoniHeader.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import { TYPOGRAPHY, RADIUS } from "../../styles/designSystem";

const TestimoniHeader = ({ matchaImage, jasmineImage }) => {
    return (
    <div className="flex justify-between h-64 items-center relative mx-4">
        <div>
        <img
            src={matchaImage}
            alt="matcha"
            className="absolute bottom-0 left-0 lg:h-52 h-24"
        />
        </div>
        <div className="flex flex-col items-center justify-center">
        <h1 className={`${TYPOGRAPHY.heading.responsive} text-brand-navy ${TYPOGRAPHY.weight.semibold} mb-6 lg:mb-10`}>
            What They Said
        </h1>
        <p className={`${TYPOGRAPHY.subheading.tablet} text-brand-orange border-dashed border p-4 ${RADIUS.circle}`} style={{ borderColor: '#d0d784' }}>
            Kolaborasi Sukses Kami
        </p>
        </div>
        <div>
        <img
            src={jasmineImage}
            alt="jasmine"
            className="absolute top-0 right-0 lg:h-52 h-24"
        />
        </div>
    </div>
    );
};

export default React.memo(TestimoniHeader);
