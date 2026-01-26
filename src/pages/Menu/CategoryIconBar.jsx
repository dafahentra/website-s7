// ========================================
// 3. CategoryIconBar.jsx - OPTIMIZED
// ========================================
import React from "react";

// Memoized Icon Button
const IconButton = React.memo(({ category, isActive, onClick }) => (
<button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 transition-all duration-300 flex-shrink-0 ${
    isActive ? "opacity-100" : "opacity-40"
    }`}
>
    <div className={isActive ? "text-[#f07828]" : "text-gray-400"}>
    {category.icon}
    </div>
</button>
));

IconButton.displayName = 'IconButton';

const CategoryIconBar = React.memo(({ categories, activeCategory, onCategoryChange }) => {
return (
    <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 pt-20">
    <div className="px-4 py-6">
        <div className="flex justify-center items-center gap-6">
        {categories.map((category) => (
            <IconButton
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
            />
        ))}
        </div>
    </div>
    </div>
);
});

CategoryIconBar.displayName = 'CategoryIconBar';

export default CategoryIconBar;