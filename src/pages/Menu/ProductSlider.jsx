// pages/Menu/ProductSlider.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductSlider = ({ 
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

const slideVariants = {
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
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
return Math.abs(offset) * velocity;
};

const containerClass = isMobile 
? "px-6 py-8 border-b border-gray-200"
: "px-12 pt-24 pb-8 border-b border-gray-200";

const imageSize = isMobile ? "w-64 h-64" : "w-72 h-72";

return (
<div className={containerClass}>
    <div className={`flex items-center ${isMobile ? 'justify-center gap-4' : 'justify-center gap-8'} max-w-5xl mx-auto w-full`}>
    {/* Navigation Arrow Left */}
    {items.length > 1 && (
        <button
        onClick={onPrev}
        className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-2 border-[#f07828] flex items-center justify-center hover:bg-[#f07828] hover:text-white transition-all group flex-shrink-0`}
        >
        <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-[#f07828] group-hover:text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        </button>
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
            onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                onNext();
                } else if (swipe > swipeConfidenceThreshold) {
                onPrev();
                }
            }}
            className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
            />
        )}
        </AnimatePresence>
    </div>

    {/* Navigation Arrow Right */}
    {items.length > 1 && (
        <button
        onClick={onNext}
        className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-2 border-[#f07828] flex items-center justify-center hover:bg-[#f07828] hover:text-white transition-all group flex-shrink-0`}
        >
        <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-[#f07828] group-hover:text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        </button>
    )}

    {/* Product Info - Desktop only */}
    {!isMobile && (
        <div className="flex-1 max-w-md flex flex-col">
        <div className="flex-1">
            <AnimatePresence mode="wait">
            {currentItem && (
                <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                >
                <h2 className="text-lg font-semibold text-[#f07828] uppercase tracking-wider mb-3">
                    {activeCategory}
                </h2>
                <h3 className="text-3xl font-bold text-[#f07828] mb-3">
                    {currentItem.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 min-h-[60px]">
                    {currentItem.description}
                </p>
                <div className="text-2xl font-bold text-gray-900 mb-4">
                    Rp{currentItem.price}
                </div>
                </motion.div>
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
                className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                    ? "bg-[#f07828] w-8"
                    : "bg-gray-300 w-2 hover:bg-gray-400"
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
            <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            >
            <h2 className="text-sm font-semibold text-[#f07828] uppercase tracking-wider mb-2">
                {activeCategory}
            </h2>
            <h3 className="text-2xl font-bold text-[#f07828] mb-3">
                {currentItem.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
                {currentItem.description}
            </p>
            <div className="text-xl font-bold text-gray-900 mb-4">
                Rp{currentItem.price}
            </div>
            </motion.div>
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
                className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                    ? "bg-[#f07828] w-8"
                    : "bg-gray-300 w-2 hover:bg-gray-400"
                }`}
            />
            ))}
        </div>
        )}
    </div>
    )}
</div>
);
};

export default ProductSlider;