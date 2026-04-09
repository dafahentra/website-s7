// pages/Menu/ProductCard.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, SHADOWS } from "../../styles/designSystem";

const ProductCard = React.memo(({
  item,
  onClick,
  isMobile    = false,
  cartQty     = 0,
  onAddToCart,
  onDecrement,
}) => {
  const padding = isMobile ? "px-3 pb-3 pt-2" : "px-4 pb-4 pt-2.5";
  const stop = (e, fn) => { e.stopPropagation(); fn?.(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden ${SHADOWS.card.small} cursor-pointer border-2 transition-all duration-300 ${
        cartQty > 0
          ? "border-brand-orange"
          : "border-transparent hover:border-brand-orange hover:shadow-card-lg"
      } ${isMobile ? "active:border-brand-orange" : ""}`}
    >
      {/* ── Image — no zoom on hover ── */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <AnimatePresence>
          {cartQty > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center shadow"
            >
              {cartQty}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Info block ── */}
      <div
        className={`${padding} flex flex-col items-center gap-2.5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Name + price */}
        <div className="text-center leading-tight w-full">
          <p className={`${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.bold} text-brand-navy truncate`}>
            {item.name}
          </p>
          <p className={`${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.bold} text-brand-orange mt-0.5`}>
            Rp{item.price}
          </p>
        </div>

        {/* ── Cart control — fixed h-10 w-28 to match SliderCartPill ── */}
        <div className="relative h-10 w-28">
          <AnimatePresence mode="wait" initial={false}>
            {cartQty === 0 ? (
              /* Filled orange → hover: transparent + orange outline */
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.12 }}
                onClick={(e) => stop(e, () => onAddToCart?.(item))}
                className={`absolute inset-0 w-full flex items-center justify-center rounded-full bg-brand-orange text-white ${TYPOGRAPHY.body.small} ${TYPOGRAPHY.weight.semibold} border-2 border-brand-orange hover:bg-transparent hover:text-brand-orange active:scale-95 transition-all`}
                aria-label="Add to cart"
              >
                Add
              </motion.button>
            ) : (
              /* Compact − qty + pill */
              <motion.div
                key="qty"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.12 }}
                className="absolute inset-0 flex items-center justify-between rounded-full bg-brand-orange px-1.5"
              >
                <button
                  onClick={(e) => stop(e, () => onDecrement?.(item))}
                  className="w-7 h-7 rounded-full bg-white/25 text-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M5 12h14"/>
                  </svg>
                </button>
                <motion.span
                  key={cartQty}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="text-white font-black text-xs w-4 text-center leading-none"
                >
                  {cartQty}
                </motion.span>
                <button
                  onClick={(e) => stop(e, () => onAddToCart?.(item))}
                  className="w-7 h-7 rounded-full bg-white/25 text-white flex items-center justify-center active:scale-90 transition-transform"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;