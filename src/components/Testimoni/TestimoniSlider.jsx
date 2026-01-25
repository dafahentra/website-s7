// components/Testimoni/TestimoniSlider.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TestimoniCard from "./TestimoniCard";

const TestimoniSlider = ({ testimonials }) => {
const [currentIndex, setCurrentIndex] = useState(0);

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
setCurrentIndex(index);
};

// Get current testimonials to display
const getCurrentTestimonials = () => {
const start = currentIndex * itemsPerPage;
const end = start + itemsPerPage;
return testimonials.slice(start, end);
};

return (
<div className="relative mt-10 mx-4">
    {/* Testimonials Grid with Animation */}
    <div className="overflow-hidden">
    <AnimatePresence mode="wait">
        <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
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