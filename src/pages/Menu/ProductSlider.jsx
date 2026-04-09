// pages/Menu/ProductSlider.jsx
import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

// ── Nav Arrow Button ──────────────────────────────────────────────────────────
const NavButton = React.memo(({ onClick, direction, isMobile }) => {
  const size  = isMobile ? "w-10 h-10" : "w-12 h-12";
  const iSize = isMobile ? "w-4 h-4"   : "w-5 h-5";
  const pathD = direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7";
  return (
    <button
      onClick={onClick}
      className={`${size} ${RADIUS.circle} border-2 border-brand-orange flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform`}
    >
      <svg className={`${iSize} text-brand-orange`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pathD} />
      </svg>
    </button>
  );
});
NavButton.displayName = "NavButton";

// ── Add / Qty Pill — w-full, sized by parent ──────────────────────────────────
const SliderCartPill = React.memo(({ item, cartQty, onAddToCart, onDecrement }) => {
  const stop = (e, fn) => { e.stopPropagation(); fn?.(); };
  return (
    <div className="relative h-10 w-full">
      <AnimatePresence mode="wait" initial={false}>
        {cartQty === 0 ? (
          <motion.button
            key="add"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.13 }}
            onClick={(e) => stop(e, () => onAddToCart?.(item))}
            className={`absolute inset-0 w-full flex items-center justify-center rounded-full bg-brand-orange text-white ${TYPOGRAPHY.body.small} ${TYPOGRAPHY.weight.semibold} border-2 border-brand-orange hover:bg-transparent hover:text-brand-orange active:scale-95 transition-all`}
          >
            Add
          </motion.button>
        ) : (
          <motion.div
            key="qty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.13 }}
            className="absolute inset-0 flex items-center justify-between rounded-full bg-brand-orange px-1.5"
          >
            <button
              onClick={(e) => stop(e, () => onDecrement?.(item))}
              className="w-8 h-8 rounded-full bg-white/25 text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M5 12h14"/>
              </svg>
            </button>
            <motion.span
              key={cartQty}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-white font-black ${TYPOGRAPHY.body.small} leading-none`}
            >
              {cartQty}
            </motion.span>
            <button
              onClick={(e) => stop(e, () => onAddToCart?.(item))}
              className="w-8 h-8 rounded-full bg-white/25 text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
SliderCartPill.displayName = "SliderCartPill";

// ── Product Info Panel ────────────────────────────────────────────────────────
const ProductInfo = React.memo(({
  currentItem, activeCategory, isMobile,
  cartQty, onAddToCart, onDecrement,
}) => {
  const catSize   = isMobile ? TYPOGRAPHY.body.small        : TYPOGRAPHY.body.default;
  const nameSize  = isMobile ? TYPOGRAPHY.subheading.tablet : TYPOGRAPHY.subheading.desktop;
  const priceSize = isMobile ? TYPOGRAPHY.subheading.lg     : TYPOGRAPHY.subheading.tablet;
  const descSize  = isMobile ? TYPOGRAPHY.body.small        : `${TYPOGRAPHY.body.small} leading-relaxed`;

  return (
    <motion.div
      key={currentItem.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category label */}
      <h2 className={`${catSize} ${TYPOGRAPHY.weight.semibold} text-brand-orange uppercase tracking-wider ${isMobile ? "mb-2" : "mb-3"}`}>
        {activeCategory}
      </h2>

      {/* Product name */}
      <h3 className={`${nameSize} ${TYPOGRAPHY.weight.bold} text-brand-navy mb-3`}>
        {currentItem.name}
      </h3>

      {/* Description */}
      <p className={`text-gray-600 ${descSize} ${isMobile ? "mb-4" : "mb-5 min-h-[60px]"}`}>
        {currentItem.description}
      </p>

      {/* Price + Add — wrapped in inline-flex so button width = price width */}
      <div className="inline-flex flex-col items-stretch gap-2">
        <span className={`${priceSize} ${TYPOGRAPHY.weight.bold} text-gray-900 whitespace-nowrap`}>
          Rp{currentItem.price}
        </span>
        <SliderCartPill
          item={currentItem}
          cartQty={cartQty}
          onAddToCart={onAddToCart}
          onDecrement={onDecrement}
        />
      </div>
    </motion.div>
  );
});
ProductInfo.displayName = "ProductInfo";

// ── Dot Indicators ────────────────────────────────────────────────────────────
const DotIndicators = React.memo(({ items, currentIndex, onDirectionChange, onIndexChange }) => (
  <div className="flex gap-2">
    {items.map((_, i) => (
      <button
        key={i}
        onClick={() => { onDirectionChange(i > currentIndex ? 1 : -1); onIndexChange(i); }}
        className={`h-2 ${RADIUS.circle} ${TRANSITIONS.fast} ${
          i === currentIndex ? "bg-brand-orange w-8" : "bg-gray-300 w-2"
        }`}
      />
    ))}
  </div>
));
DotIndicators.displayName = "DotIndicators";

// ── Main Slider ───────────────────────────────────────────────────────────────
const ProductSlider = React.memo(({
  items, currentIndex, activeCategory, direction,
  onNext, onPrev, onIndexChange, onDirectionChange,
  isMobile = false, cart, onAddToCart, onDecrement,
}) => {
  const currentItem = items[currentIndex] || items[0];

  const cartQty = currentItem
    ? cart.filter((e) => String(e.itemId) === String(currentItem.id)).reduce((s, e) => s + e.qty, 0)
    : 0;

  const slideVariants = useMemo(() => ({
    enter:  (d) => ({ x: d > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit:   (d) => ({ zIndex: 0, x: d < 0 ? 1000 : -1000, opacity: 0 }),
  }), []);

  const handleDragEnd = useCallback((_, { offset, velocity }) => {
    const power = Math.abs(offset.x) * velocity.x;
    if (power < -10000) onNext();
    else if (power > 10000) onPrev();
  }, [onNext, onPrev]);

  const containerClass = isMobile
    ? "px-6 py-8 border-b border-gray-200"
    : "px-12 pt-32 pb-8 border-b border-gray-200";
  const imageSize = isMobile ? "w-64 h-64" : "w-72 h-72";

  const commonProps = { currentItem, activeCategory, cartQty, onAddToCart, onDecrement };

  return (
    <div className={containerClass}>
      <div className={`flex items-center justify-center ${isMobile ? "gap-4" : "gap-8"} max-w-5xl mx-auto w-full`}>

        {items.length > 1 && <NavButton onClick={onPrev} direction="prev" isMobile={isMobile} />}

        {/* Sliding image */}
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
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
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

        {items.length > 1 && <NavButton onClick={onNext} direction="next" isMobile={isMobile} />}

        {/* Desktop info panel */}
        {!isMobile && (
          <div className="flex-1 max-w-md flex flex-col">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {currentItem && <ProductInfo {...commonProps} isMobile={false} />}
              </AnimatePresence>
            </div>
            {items.length > 1 && (
              <div className="mt-6">
                <DotIndicators
                  items={items}
                  currentIndex={currentIndex}
                  onDirectionChange={onDirectionChange}
                  onIndexChange={onIndexChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile info + pill + dots */}
      {isMobile && (
        <div className="text-center mt-6">
          <AnimatePresence mode="wait">
            {currentItem && <ProductInfo {...commonProps} isMobile={true} />}
          </AnimatePresence>

          {items.length > 1 && (
            <div className="flex justify-center mt-4">
              <DotIndicators
                items={items}
                currentIndex={currentIndex}
                onDirectionChange={onDirectionChange}
                onIndexChange={onIndexChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ProductSlider.displayName = "ProductSlider";
export default ProductSlider;