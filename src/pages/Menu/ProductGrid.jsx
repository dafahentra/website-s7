// pages/Menu/ProductGrid.jsx
import React from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

const ProductGrid = ({ items, activeCategory, onProductClick, isMobile = false }) => {
const gridCols = isMobile 
? "grid-cols-2" 
: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const padding = isMobile ? "px-6 py-8" : "px-12 py-10";

return (
<div className={`${padding} max-w-7xl mx-auto`}>
    <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#1d3866] mb-${isMobile ? '6' : '8'}`}>
    Semua Menu {activeCategory}
    </h2>
    
    <div className={`grid ${gridCols} gap-${isMobile ? '4' : '6'}`}>
    {items.map((item) => (
        <ProductCard 
        key={item.id}
        item={item}
        onClick={() => onProductClick(item.id)}
        isMobile={isMobile}
        />
    ))}
    </div>
</div>
);
};

export default ProductGrid;