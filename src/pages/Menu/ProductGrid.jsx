// ========================================
// 4. ProductGrid.jsx - OPTIMIZED
// ========================================
import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

const ProductGrid = React.memo(({ items, activeCategory, onProductClick, isMobile = false }) => {
const gridCols = isMobile 
    ? "grid-cols-2" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const padding = isMobile ? "px-6 py-8" : "px-12 py-10";
const titleSize = isMobile ? "text-xl" : "text-2xl";
const titleMargin = isMobile ? "mb-6" : "mb-8";
const gap = isMobile ? "gap-4" : "gap-6";

  // Memoize handler to prevent re-creation
const handleProductClick = useCallback((itemId) => {
    onProductClick(itemId);
}, [onProductClick]);

return (
    <div className={`${padding} max-w-7xl mx-auto`}>
    <h2 className={`${titleSize} font-bold text-[#1d3866] ${titleMargin}`}>
        See All {activeCategory}
    </h2>
    
    <div className={`grid ${gridCols} ${gap}`}>
        {items.map((item) => (
        <ProductCard 
            key={item.id}
            item={item}
            onClick={() => handleProductClick(item.id)}
            isMobile={isMobile}
        />
        ))}
    </div>
    </div>
);
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;