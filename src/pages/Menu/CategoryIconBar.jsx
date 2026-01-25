// pages/Menu/CategoryIconBar.jsx
import React from "react";

const CategoryIconBar = ({ categories, activeCategory, onCategoryChange }) => {
return (
<div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 pt-20">
    <div className="px-4 py-6">
    <div className="flex justify-center items-center gap-6">
        {categories.map((category) => (
        <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 flex-shrink-0 ${
            activeCategory === category.id
                ? "opacity-100"
                : "opacity-40"
            }`}
        >
            <div className={`${
            activeCategory === category.id
                ? "text-[#0d7d4a]"
                : "text-gray-400"
            }`}>
            {category.icon}
            </div>
        </button>
        ))}
    </div>
    </div>
</div>
);
};

export default CategoryIconBar;