// pages/Menu/ProductGrid.jsx
import React, { useCallback } from "react";
import ProductCard from "./ProductCard";
import { TYPOGRAPHY } from "../../styles/designSystem";

const ProductGrid = React.memo(({
  items, activeCategory, onProductClick,
  isMobile = false, cart, onAddToCart, onIncrement, onDecrement,
  isOpen = true, isItemUnavailable,
}) => {
  const gridCols    = isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  const padding     = isMobile ? "px-6 py-8"   : "px-12 py-10";
  const titleSize   = isMobile ? TYPOGRAPHY.subheading.lg : TYPOGRAPHY.subheading.tablet;
  const titleMargin = isMobile ? "mb-6" : "mb-8";
  const gap         = isMobile ? "gap-4" : "gap-6";

  const handleClick = useCallback((id) => onProductClick(id), [onProductClick]);

  const getQty = (itemId) =>
    cart.filter((e) => String(e.itemId) === String(itemId)).reduce((s, e) => s + e.qty, 0);

  return (
    <div className={`${padding} max-w-7xl mx-auto`}>
      <h2 className={`${titleSize} ${TYPOGRAPHY.weight.bold} text-brand-navy ${titleMargin}`}>
        See All {activeCategory}
      </h2>

      <div className={`grid ${gridCols} ${gap}`}>
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onClick={() => handleClick(item.id)}
            isMobile={isMobile}
            cartQty={getQty(item.id)}
            onAddToCart={onAddToCart}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            isUnavailable={!isOpen || (isItemUnavailable?.(item.id) ?? false)}
          />
        ))}
      </div>
    </div>
  );
});

ProductGrid.displayName = "ProductGrid";
export default ProductGrid;