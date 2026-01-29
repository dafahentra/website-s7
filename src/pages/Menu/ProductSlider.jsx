// pages/Menu/ProductSlider.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

// Memoized Navigation Button with Design System
const NavButton = React.memo(({ onClick, direction, isMobile }) => {
const size = isMobile ? 'w-10 h-10' : 'w-12 h-12';
const iconSize = isMobile ? 'w-4 h-4' : 'w-5 h-5';
const pathD = direction === 'prev' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7";

return (
    <button
    onClick={onClick}
    className={`${size} ${RADIUS.circle} border-2 border-brand-orange flex items-center justify-center ${TRANSITIONS.fast} group flex-shrink-0 active:scale-95 [@media(hover:hover)]:hover:bg-brand-orange [@media(hover:hover)]:hover:text-white`}
    >
    <svg className={`${iconSize} text-brand-orange [@media(hover:hover)]:group-hover:text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pathD} />
    </svg>
    </button>
);
});

NavButton.displayName = 'NavButton';

// Memoized Product Info with Design System
const ProductInfo = React.memo(({ currentItem, activeCategory, isMobile }) => {
const categorySize = isMobile ? TYPOGRAPHY.body.small : TYPOGRAPHY.body.default;
const nameSize = isMobile ? TYPOGRAPHY.subheading.tablet : TYPOGRAPHY.subheading.desktop;
const priceSize = isMobile ? TYPOGRAPHY.subheading.lg : TYPOGRAPHY.subheading.tablet;
const descSize = isMobile ? `${TYPOGRAPHY.body.small}` : `${TYPOGRAPHY.body.small} leading-relaxed`;

return (
    <motion.div
    key={currentItem.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    >
    <h2 className={`${categorySize} ${TYPOGRAPHY.weight.semibold} text-brand-orange uppercase tracking-wider ${isMobile ? 'mb-2' : 'mb-3'}`}>
        {activeCategory}
    </h2>
    <h3 className={`${nameSize} ${TYPOGRAPHY.weight.bold} text-brand-navy mb-3`}>
        {currentItem.name}
    </h3>
    <p className={`text-gray-600 ${descSize} ${isMobile ? 'mb-3' : 'mb-4 min-h-[60px]'}`}>
        {currentItem.description}
    </p>
    <div className={`${priceSize} ${TYPOGRAPHY.weight.bold} text-gray-900 mb-4`}>
        Rp{currentItem.price}
    </div>
    </motion.div>
);
});

ProductInfo.displayName = 'ProductInfo';

const ProductSlider = React.memo(({ 
    items, 
    currentIndex, 
    activeCategory, 
    direction,
    onNext, 
    onPrev,
    onIndexChange,
    onDirectionChange,
    isMobile = false 
}) => {
const currentItem = items[currentIndex] || items[0];

  // Memoize slide variants
const slideVariants = useMemo(() => ({
    enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
    }),
    center: {
    zIndex: 1,
    x: 0,
    opacity: 1
    },
    exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
    })
}), []);

  // Memoize swipe handler
const handleDragEnd = useCallback((e, { offset, velocity }) => {
    const swipeConfidenceThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;
    
    if (swipePower < -swipeConfidenceThreshold) {
    onNext();
    } else if (swipePower > swipeConfidenceThreshold) {
    onPrev();
    }
}, [onNext, onPrev]);

const containerClass = isMobile 
    ? "px-6 py-8 border-b border-gray-200"
    : "px-12 pt-32 pb-8 border-b border-gray-200";

const imageSize = isMobile ? "w-64 h-64" : "w-72 h-72";
const flexGap = isMobile ? 'gap-4' : 'gap-8';

return (
    <div className={containerClass}>
    <div className={`flex items-center justify-center ${flexGap} max-w-5xl mx-auto w-full`}>
        {/* Navigation Arrow Left */}
        {items.length > 1 && (
        <NavButton onClick={onPrev} direction="prev" isMobile={isMobile} />
        )}

        {/* Product Image with Animation */}
        <div className={`${imageSize} relative overflow-hidden flex-shrink-0`}>
        <AnimatePresence initial={false} custom={direction}>
            {currentItem && (
            <motion.img
                key={currentItem.id}
                src={currentItem.image}
                alt={currentItem.name}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
                loading="lazy"
            />
            )}
        </AnimatePresence>
        </div>

        {/* Navigation Arrow Right */}
        {items.length > 1 && (
        <NavButton onClick={onNext} direction="next" isMobile={isMobile} />
        )}

        {/* Product Info - Desktop only */}
        {!isMobile && (
        <div className="flex-1 max-w-md flex flex-col">
            <div className="flex-1">
            <AnimatePresence mode="wait">
                {currentItem && (
                <ProductInfo 
                    currentItem={currentItem} 
                    activeCategory={activeCategory} 
                    isMobile={false}
                />
                )}
            </AnimatePresence>
            </div>
            
            {/* Dots Indicator */}
            {items.length > 1 && (
            <div className="flex gap-2">
                {items.map((_, index) => (
                <button
                    key={index}
                    onClick={() => {
                    onDirectionChange(index > currentIndex ? 1 : -1);
                    onIndexChange(index);
                    }}
                    className={`h-2 ${RADIUS.circle} ${TRANSITIONS.fast} ${
                    index === currentIndex
                        ? "bg-brand-orange w-8"
                        : "bg-gray-300 w-2 [@media(hover:hover)]:hover:bg-gray-400"
                    }`}
                    />
                ))}
                </div>
            )}
            </div>
        )}
        </div>

      {/* Product Info - Mobile */}
        {isMobile && (
        <div className="text-center mt-6">
            <AnimatePresence mode="wait">
            {currentItem && (
                <ProductInfo 
                currentItem={currentItem} 
                activeCategory={activeCategory} 
                isMobile={true}
                />
            )}
            </AnimatePresence>

          {/* Dots Indicator - Mobile */}
            {items.length > 1 && (
            <div className="flex justify-center gap-2">
                {items.map((_, index) => (
                <button
                    key={index}
                    onClick={() => {
                    onDirectionChange(index > currentIndex ? 1 : -1);
                    onIndexChange(index);
                    }}
                    className={`h-2 ${RADIUS.circle} ${TRANSITIONS.fast} ${
                    index === currentIndex
                        ? "bg-brand-orange w-8"
                        : "bg-gray-300 w-2 [@media(hover:hover)]:hover:bg-gray-400"
                    }`}
                />
                ))}
            </div>
            )}
        </div>
        )}
    </div>
    );
});

ProductSlider.displayName = 'ProductSlider';

export default ProductSlider;
