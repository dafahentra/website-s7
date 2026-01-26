// components/Testimoni/TestimoniSlider.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TestimoniCard from "./TestimoniCard";

const TestimoniSlider = ({ testimonials }) => {
const [currentIndex, setCurrentIndex] = useState(0);
const [touchStart, setTouchStart] = useState(0);
const [touchEnd, setTouchEnd] = useState(0);
const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
const sliderRef = useRef(null);

// Minimum swipe distance (in px) to trigger slide change
const minSwipeDistance = 50;

// Fungsi untuk menghitung jumlah item yang ditampilkan berdasarkan ukuran layar
const getItemsPerPage = () => {
if (typeof window !== 'undefined') {
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 768) return 2;  // md
    return 1; // mobile
}
return 3;
};

const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

// Update itemsPerPage saat window resize
useEffect(() => {
const handleResize = () => {
    setItemsPerPage(getItemsPerPage());
};

window.addEventListener('resize', handleResize);
return () => window.removeEventListener('resize', handleResize);
}, []);

const totalPages = Math.ceil(testimonials.length / itemsPerPage);

const goToSlide = (index) => {
setDirection(index > currentIndex ? 1 : -1);
setCurrentIndex(index);
};

const nextSlide = () => {
setDirection(1);
setCurrentIndex((prevIndex) => 
    prevIndex === totalPages - 1 ? 0 : prevIndex + 1
);
};

const prevSlide = () => {
setDirection(-1);
setCurrentIndex((prevIndex) => 
    prevIndex === 0 ? totalPages - 1 : prevIndex - 1
);
};

// Touch event handlers
const onTouchStart = (e) => {
setTouchEnd(0); // Reset touchEnd
setTouchStart(e.targetTouches[0].clientX);
};

const onTouchMove = (e) => {
setTouchEnd(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
if (!touchStart || !touchEnd) return;

const distance = touchStart - touchEnd;
const isLeftSwipe = distance > minSwipeDistance;
const isRightSwipe = distance < -minSwipeDistance;

if (isLeftSwipe) {
    nextSlide();
}
if (isRightSwipe) {
    prevSlide();
}
};

// Get current testimonials to display
const getCurrentTestimonials = () => {
const start = currentIndex * itemsPerPage;
const end = start + itemsPerPage;
return testimonials.slice(start, end);
};

return (
<div className="relative mt-10 mx-4">
    {/* Testimonials Grid with Animation and Touch Support */}
    <div 
    ref={sliderRef}
    className="overflow-hidden touch-pan-y"
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
    >
    <AnimatePresence mode="wait" custom={direction}>
        <motion.div
        key={currentIndex}
        custom={direction}
        initial={{ x: direction > 0 ? 1000 : -1000 }}
        animate={{ x: 0 }}
        exit={{ x: direction > 0 ? -1000 : 1000 }}
        transition={{ 
            x: { type: "spring", stiffness: 300, damping: 30 },
            duration: 0.5 
        }}
        className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 place-items-center gap-8"
        >
        {getCurrentTestimonials().map((testi, index) => (
            <TestimoniCard key={index} testimonial={testi} />
        ))}
        </motion.div>
    </AnimatePresence>
    </div>

    {/* Dots Indicator - Only show if more than itemsPerPage */}
    {testimonials.length > itemsPerPage && (
    <div className="flex justify-center items-center gap-2 mt-8">
        {[...Array(totalPages)].map((_, index) => (
        <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
            currentIndex === index
                ? 'bg-[#f39248] w-8'
                : 'bg-gray-300 w-3 hover:bg-gray-400'
            }`}
            aria-label={`Go to page ${index + 1}`}
        />
        ))}
    </div>
    )}
</div>
);
};

export default TestimoniSlider;