// pages/About/TestimonialSlider.jsx
import React, { useState, useCallback, useEffect } from "react";

const TestimonialSlider = ({ testimonials }) => {
const [currentTestimonial, setCurrentTestimonial] = useState(0);
const [direction, setDirection] = useState(0);
const [isTransitioning, setIsTransitioning] = useState(false);

const nextTestimonial = useCallback(() => {
    if (isTransitioning) return;
    setDirection(1);
    setIsTransitioning(true);
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
}, [testimonials.length, isTransitioning]);

const prevTestimonial = useCallback(() => {
    if (isTransitioning) return;
    setDirection(-1);
    setIsTransitioning(true);
    setCurrentTestimonial((prev) =>
    prev === 0 ? testimonials.length - 1 : prev - 1
    );
}, [testimonials.length, isTransitioning]);

const goToTestimonial = useCallback((index) => {
    if (isTransitioning || index === currentTestimonial) return;
    setDirection(index > currentTestimonial ? 1 : -1);
    setIsTransitioning(true);
    setCurrentTestimonial(index);
}, [currentTestimonial, isTransitioning]);

useEffect(() => {
    if (isTransitioning) {
    const timer = setTimeout(() => {
        setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
    }
}, [isTransitioning]);

const currentData = testimonials[currentTestimonial];

return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16 mx-4">
        <h2 className="text-6xl font-bold text-[#1d3866] mb-4">Our Customer Says</h2>
        </div>

        <div className="mx-4 relative">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden shadow-2xl">
            <div 
            className={`grid lg:grid-cols-2 gap-8 items-center p-12 transition-all duration-500 ease-in-out ${
                isTransitioning 
                ? direction > 0 
                    ? 'opacity-0 translate-x-8' 
                    : 'opacity-0 -translate-x-8'
                : 'opacity-100 translate-x-0'
            }`}
            >
            <div className="relative">
                <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#f39248] rounded-full opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#1d3866] rounded-full opacity-50"></div>
                <img
                    src={currentData.image}
                    alt={currentData.name}
                    className="relative rounded-3xl shadow-2xl w-full aspect-square object-cover"
                    loading="lazy"
                />
                </div>
                <div className="text-center mt-8">
                <h3 className="text-3xl font-bold text-[#1d3866] mb-2">
                    {currentData.name}
                </h3>
                <p className="text-xl text-[#f39248] font-semibold">
                    {currentData.role}
                </p>
                </div>
            </div>

            <div className="relative">
                <div className="text-8xl text-[#f39248] opacity-20 absolute -top-8 -left-4 select-none">"</div>
                <p className="text-2xl text-gray-700 leading-relaxed relative z-10 pl-12 pr-8">
                {currentData.quote}
                </p>
                <div className="text-8xl text-[#f39248] opacity-20 absolute -bottom-8 -right-4 select-none">"</div>
            </div>
            </div>

            <div className="flex justify-center items-center gap-4 pb-8">
            <button
                onClick={prevTestimonial}
                disabled={isTransitioning}
                className="bg-[#1d3866] hover:bg-[#f39248] text-white p-3 rounded-full transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous testimonial"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="flex gap-2">
                {testimonials.map((_, index) => (
                <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    disabled={isTransitioning}
                    className={`h-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                    currentTestimonial === index 
                        ? 'bg-[#f39248] w-8' 
                        : 'bg-gray-300 hover:bg-gray-400 w-3'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                />
                ))}
            </div>

            <button
                onClick={nextTestimonial}
                disabled={isTransitioning}
                className="bg-[#1d3866] hover:bg-[#f39248] text-white p-3 rounded-full transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next testimonial"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            </div>
        </div>

        <div className="text-center mt-6">
            <p className="text-gray-500 font-semibold">
            {currentTestimonial + 1} / {testimonials.length}
            </p>
        </div>
        </div>
    </div>
    </div>
);
};

export default React.memo(TestimonialSlider);