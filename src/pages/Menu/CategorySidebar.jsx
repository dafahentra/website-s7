// pages/Menu/CategorySidebar.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

// Memoized Category Button with Design System
const CategoryButton = React.memo(({ category, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 mb-2 ${TYPOGRAPHY.weight.medium} ${TRANSITIONS.fast} flex items-center gap-3 ${RADIUS.card.default} ${
      isActive
        ? "text-brand-orange bg-gray-50"
        : "text-gray-400 [@media(hover:hover)]:hover:text-gray-600 [@media(hover:hover)]:hover:bg-gray-50"
    }`}
  >
    <span className={isActive ? "text-brand-orange" : "text-gray-400"}>
      {category.icon}
    </span>
    <span className={TYPOGRAPHY.body.small}>{category.name}</span>
  </button>
));

CategoryButton.displayName = 'CategoryButton';

const CategorySidebar = React.memo(({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 pt-20">
      <div className="py-6 px-4">
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </div>
  );
});

CategorySidebar.displayName = 'CategorySidebar';

export default CategorySidebar;
