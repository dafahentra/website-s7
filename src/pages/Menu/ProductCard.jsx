// pages/Menu/ProductCard.jsx
import React from "react";
import { motion } from "framer-motion";

const ProductCard = ({ item, onClick, isMobile = false }) => {
const titleSize = isMobile ? "text-base" : "text-xl";
const priceSize = isMobile ? "text-lg" : "text-2xl";
const padding = isMobile ? "p-3" : "p-5";

return (
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    className={`bg-white rounded-${isMobile ? 'xl' : '2xl'} overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent ${isMobile ? 'active:border-[#f07828]' : 'hover:border-[#f07828]'}`}
>
    <div className="aspect-square overflow-hidden">
    <img
        src={item.image}
        alt={item.name}
        className={`w-full h-full object-cover ${!isMobile && 'hover:scale-110'} transition-transform duration-300`}
    />
    </div>
    <div className={padding}>
    <h3 className={`${titleSize} font-bold text-[#1d3866] mb-${isMobile ? '1' : '2'}`}>
        {item.name}
    </h3>
    <p className={`text-[#f07828] ${priceSize} font-bold`}>
        Rp{item.price}
    </p>
    </div>
</motion.div>
);
};

export default ProductCard;