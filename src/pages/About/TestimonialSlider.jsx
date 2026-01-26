// pages/About/TestimonialSlider.jsx - OPTIMIZED VERSION
import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Memoized Navigation Button
const NavigationButton = React.memo(({ onClick, direction, ariaLabel }) => (
<button
onClick={onClick}
className="bg-[#1d3866] text-white p-2 md:p-2.5 lg:p-3 rounded-full transition-colors duration-300 shadow-lg active:scale-95 [@media(hover:hover)]:hover:bg-[#f39248]"
aria-label={ariaLabel}
>
<svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth={2} 
    d={direction === 'prev' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
    />
</svg>
</button>
));

NavigationButton.displayName = 'NavigationButton';

// Memoized Indicator Dot
const IndicatorDot = React.memo(({ isActive, onClick, index }) => (
<button
onClick={onClick}
className={`w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
    isActive ? 'bg-[#f39248] w-6 md:w-7 lg:w-8' : 'bg-gray-300 [@media(hover:hover)]:hover:bg-gray-400'
}`}
aria-label={`Go to testimonial ${index + 1}`}
/>
));

IndicatorDot.displayName = 'IndicatorDot';

// Memoized Testimonial Content
const TestimonialContent = React.memo(({ testimonial }) => (
<motion.div
key={testimonial.name}
initial={{ opacity: 0, x: 100 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -100 }}
transition={{ duration: 0.5 }}
className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center p-4 md:p-8 lg:p-12"
>
<div className="relative">
    <div className="relative w-full max-w-[200px] md:max-w-xs lg:max-w-md mx-auto">
    <div className="absolute -top-3 -left-3 lg:-top-6 lg:-left-6 w-16 h-16 lg:w-32 lg:h-32 bg-[#f39248] rounded-full opacity-50"></div>
    <div className="absolute -bottom-3 -right-3 lg:-bottom-6 lg:-right-6 w-20 h-20 lg:w-40 lg:h-40 bg-[#1d3866] rounded-full opacity-50"></div>
    <img
        src={testimonial.image}
        alt={testimonial.name}
        className="relative rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl w-full aspect-square object-cover"
        loading="lazy"
    />
    </div>
    <div className="text-center mt-4 md:mt-6 lg:mt-8">
    <h3 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#1d3866] mb-1 md:mb-2">
        {testimonial.name}
    </h3>
    <p className="text-sm md:text-lg lg:text-xl text-[#f39248] font-semibold">
        {testimonial.role}
    </p>
    </div>
</div>

<div className="relative">
    <div className="text-4xl md:text-6xl lg:text-8xl text-[#f39248] opacity-20 absolute -top-4 md:-top-6 lg:-top-8 -left-2 md:-left-3 lg:-left-4">"</div>
    <p className="text-sm md:text-xl lg:text-2xl text-gray-700 leading-relaxed relative z-10 pl-6 md:pl-10 lg:pl-12 pr-4 md:pr-6 lg:pr-8">
    {testimonial.quote}
    </p>
    <div className="text-4xl md:text-6xl lg:text-8xl text-[#f39248] opacity-20 absolute -bottom-4 md:-bottom-6 lg:-bottom-8 -right-2 md:-right-3 lg:-right-4">"</div>
</div>
</motion.div>
));

TestimonialContent.displayName = 'TestimonialContent';

const TestimonialSlider = ({ testimonials }) => {
const [currentTestimonial, setCurrentTestimonial] = useState(0);

// Memoize callbacks untuk menghindari re-creation
const nextTestimonial = useCallback(() => {
setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
}, [testimonials.length]);

const prevTestimonial = useCallback(() => {
setCurrentTestimonial((prev) =>
    prev === 0 ? testimonials.length - 1 : prev - 1
);
}, [testimonials.length]);

const goToTestimonial = useCallback((index) => {
setCurrentTestimonial(index);
}, []);

// Memoize current testimonial untuk menghindari re-render
const currentTestimonialData = useMemo(
() => testimonials[currentTestimonial],
[testimonials, currentTestimonial]
);

return (
<div className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-[1200px] mx-auto">
    <div className="text-center mb-8 md:mb-12 lg:mb-16 mx-4">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#1d3866] mb-4">
        Our Customer Says
        </h2>
    </div>

    <div className="mx-4 relative">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl">
        <AnimatePresence mode="wait">
            <TestimonialContent testimonial={currentTestimonialData} />
        </AnimatePresence>

        <div className="flex justify-center items-center gap-3 md:gap-4 pb-4 md:pb-6 lg:pb-8">
            <NavigationButton 
            onClick={prevTestimonial} 
            direction="prev"
            ariaLabel="Previous testimonial"
            />

            <div className="flex gap-1.5 md:gap-2">
            {testimonials.map((_, index) => (
                <IndicatorDot
                key={index}
                isActive={currentTestimonial === index}
                onClick={() => goToTestimonial(index)}
                index={index}
                />
            ))}
            </div>

            <NavigationButton 
            onClick={nextTestimonial} 
            direction="next"
            ariaLabel="Next testimonial"
            />
        </div>
        </div>

        <div className="text-center mt-4 md:mt-5 lg:mt-6">
        <p className="text-sm md:text-base text-gray-500 font-semibold">
            {currentTestimonial + 1} / {testimonials.length}
        </p>
        </div>
    </div>
    </div>
</div>
);
};

export default React.memo(TestimonialSlider);