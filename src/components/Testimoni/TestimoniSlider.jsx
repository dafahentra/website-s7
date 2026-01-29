// components/Testimoni/TestimoniSlider.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TestimoniCard from "./TestimoniCard";
import { RADIUS, TRANSITIONS } from "../../styles/designSystem";

const TestimoniSlider = ({ testimonials }) => {
const [currentIndex, setCurrentIndex] = useState(0);
const [direction, setDirection] = useState(0);

  // Fungsi untuk menghitung jumlah item yang ditampilkan berdasarkan ukuran layar
const getItemsPerPage = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg
      if (window.innerWidth >= 768) return 2;  // md
      return 1; // mobile
    }
    return 3;
}, []);

const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // Update itemsPerPage saat window resize dengan debounce
useEffect(() => {
    let timeoutId;
    const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        setItemsPerPage(getItemsPerPage());
      }, 150); // Debounce 150ms
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', handleResize);
    };
}, [getItemsPerPage]);

const totalPages = useMemo(() => 
    Math.ceil(testimonials.length / itemsPerPage), 
    [testimonials.length, itemsPerPage]
);

const goToSlide = useCallback((index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
}, [currentIndex]);

const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
    prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
}, [totalPages]);

const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
    prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
}, [totalPages]);

  // Handle drag end - memoized untuk mencegah re-create function
const handleDragEnd = useCallback((event, info) => {
    const threshold = 50;

    if (info.offset.x > threshold) {
    prevSlide();
    } else if (info.offset.x < -threshold) {
    nextSlide();
    }
}, [nextSlide, prevSlide]);

  // Get current testimonials - memoized
const currentTestimonials = useMemo(() => {
    const start = currentIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return testimonials.slice(start, end);
}, [currentIndex, itemsPerPage, testimonials]);

  // Memoized animation variants
const slideVariants = useMemo(() => ({
    enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
    }),
    center: {
    x: 0,
    opacity: 1
    },
    exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0
    })
}), []);

const transition = useMemo(() => ({
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8
}), []);

return (
    <div className="relative mt-10 mx-4">
      {/* Testimonials Grid with Drag Support */}
    <div className="overflow-hidden cursor-grab active:cursor-grabbing will-change-transform">
        <AnimatePresence mode="wait" custom={direction}>
        <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 place-items-center gap-8"
        >
            {currentTestimonials.map((testi, index) => (
            <TestimoniCard key={`${currentIndex}-${index}`} testimonial={testi} />
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
            className={`h-3 ${RADIUS.circle} ${TRANSITIONS.fast} ${
                currentIndex === index
                ? 'bg-brand-orange w-8'
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
