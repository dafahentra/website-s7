// ========================================
// 1. ProductCard.jsx - OPTIMIZED
// ========================================
import React from "react";
import { motion } from "framer-motion";

const ProductCard = React.memo(({ item, onClick, isMobile = false }) => {
const titleSize = isMobile ? "text-base" : "text-xl";
const priceSize = isMobile ? "text-lg" : "text-2xl";
const padding = isMobile ? "p-3" : "p-5";

  // FIXED: Tailwind class harus lengkap, tidak bisa dynamic
const roundedClass = isMobile ? "rounded-xl" : "rounded-2xl";
const mbClass = isMobile ? "mb-1" : "mb-2";

return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    className={`bg-white ${roundedClass} overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent ${isMobile ? 'active:border-[#f07828]' : 'hover:border-[#f07828]'}`}
    >
    <div className="aspect-square overflow-hidden">
        <img
        src={item.image}
        alt={item.name}
        className={`w-full h-full object-cover ${!isMobile && 'hover:scale-110'} transition-transform duration-300`}
        loading="lazy"
        />
    </div>
    <div className={padding}>
        <h3 className={`${titleSize} font-bold text-[#1d3866] ${mbClass}`}>
        {item.name}
        </h3>
        <p className={`text-[#f07828] ${priceSize} font-bold`}>
        Rp{item.price}
        </p>
    </div>
    </motion.div>
);
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;