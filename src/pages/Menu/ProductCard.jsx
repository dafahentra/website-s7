// pages/Menu/ProductCard.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../../styles/designSystem";

const ProductCard = React.memo(({ item, onClick, isMobile = false }) => {
  // Typography sizes
const titleSize = isMobile ? TYPOGRAPHY.body.regular : TYPOGRAPHY.subheading.lg;
const priceSize = isMobile ? TYPOGRAPHY.body.default : TYPOGRAPHY.subheading.tablet;

  // Spacing
const padding = isMobile ? "p-3" : "p-5";
const titleMargin = isMobile ? "mb-1" : "mb-2";

return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    className={`bg-white ${RADIUS.card.responsive} overflow-hidden ${SHADOWS.card.small} ${TRANSITIONS.fast} cursor-pointer border-2 border-transparent ${
        isMobile 
        ? 'active:border-brand-orange hover:shadow-card-lg' 
        : 'hover:border-brand-orange hover:shadow-card-lg'
    }`}
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
        <h3 className={`${titleSize} ${TYPOGRAPHY.weight.bold} text-brand-navy ${titleMargin}`}>
        {item.name}
        </h3>
        <p className={`text-brand-orange ${priceSize} ${TYPOGRAPHY.weight.bold}`}>
        Rp{item.price}
        </p>
    </div>
    </motion.div>
);
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
