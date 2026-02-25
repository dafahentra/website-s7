// pages/Menu/ProductCard.jsx
// Minimalist: image → name + price (stacked, bigger) → Add to Cart pill
// cartQty === 0  → full "Add to Cart" outlined pill
// cartQty  > 0  → compact filled − qty + pill (short, same height as figma)
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHADOWS, TRANSITIONS } from "../../styles/designSystem";

const ProductCard = React.memo(({
  item,
  onClick,
  isMobile    = false,
  cartQty     = 0,
  onAddToCart,   // opens modal
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
      className={`bg-white rounded-2xl overflow-hidden ${SHADOWS.card.small} ${TRANSITIONS.fast} cursor-pointer border-2 ${
        cartQty > 0 ? "border-brand-orange" : "border-transparent"
      } ${isMobile ? "active:border-brand-orange" : "hover:border-brand-orange hover:shadow-card-lg"}`}
    >
      {/* ── Image ── */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover ${!isMobile && "hover:scale-110"} transition-transform duration-300`}
          loading="lazy"
        />
        {/* Qty badge */}
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
        {/* Name + price — stacked, larger */}
        <div className="text-center leading-tight w-full">
          <p className="text-lg font-bold text-brand-navy truncate">{item.name}</p>
          <p className="text-lg font-bold text-brand-orange mt-0.5">Rp{item.price}</p>
        </div>

        {/* ── Cart control ── */}
        <AnimatePresence mode="wait" initial={false}>
          {cartQty === 0 ? (
            /* "+ Add to Cart" outlined pill — auto width, centered */
            <motion.button
              key="add"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => stop(e, () => onAddToCart?.(item))}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-brand-orange text-brand-orange text-xs font-semibold hover:bg-brand-orange hover:text-white active:scale-95 transition-all"
              aria-label="Add to cart"
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add to Cart
            </motion.button>
          ) : (
            /* Compact filled − qty + pill — fixed narrow width */
            <motion.div
              key="qty"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-1 bg-brand-orange rounded-full px-1.5 py-1"
            >
              <button
                onClick={(e) => stop(e, () => onDecrement?.(item))}
                className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center hover:bg-white/40 active:scale-90 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 12h14"/></svg>
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
                className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center hover:bg-white/40 active:scale-90 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;