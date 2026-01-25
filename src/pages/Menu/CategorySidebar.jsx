// pages/Menu/CategorySidebar.jsx
import React from "react";

const CategorySidebar = ({ categories, activeCategory, onCategoryChange }) => {
return (
<div className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 pt-20">
    <div className="py-6 px-4">
    {categories.map((category) => (
        <button
        key={category.id}
        onClick={() => onCategoryChange(category.id)}
        className={`w-full text-left px-4 py-3 mb-2 font-medium transition-all duration-200 flex items-center gap-3 rounded-lg ${
            activeCategory === category.id
            ? "text-[#f07828] bg-gray-50"
            : "text-gray-400 [@media(hover:hover)]:hover:text-gray-600 [@media(hover:hover)]:hover:bg-gray-50"
        }`}
        >
        <span className={activeCategory === category.id ? "text-[#f07828]" : "text-gray-400"}>
            {category.icon}
        </span>
        <span className="text-sm">{category.name}</span>
        </button>
    ))}
    </div>
</div>
);
};

export default CategorySidebar;