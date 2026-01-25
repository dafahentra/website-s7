// pages/Menu/index.jsx
import React, { useState } from "react";
import SEO from "../../components/SEO";
import CategorySidebar from "./CategorySidebar";
import CategoryIconBar from "./CategoryIconBar";
import ProductSlider from "./ProductSlider";
import ProductGrid from "./ProductGrid";
import { menuCategories } from "../../data/menuCategories";
import { menuItems } from "../../data/menuData";

const Menu = () => {
const [activeCategory, setActiveCategory] = useState("Espresso Based");
const [currentIndex, setCurrentIndex] = useState(0);
const [direction, setDirection] = useState(0);

const currentItems = menuItems[activeCategory] || [];

const handleCategoryChange = (categoryId) => {
setActiveCategory(categoryId);
setCurrentIndex(0);
setDirection(0);
};

const handleNext = () => {
setDirection(1);
setCurrentIndex((prev) => (prev + 1) % currentItems.length);
};

const handlePrev = () => {
setDirection(-1);
setCurrentIndex((prev) => (prev - 1 + currentItems.length) % currentItems.length);
};

const handleProductClick = (itemId) => {
const itemIndex = currentItems.findIndex(i => i.id === itemId);
setCurrentIndex(itemIndex);
window.scrollTo({ top: 0, behavior: 'smooth' });
};

return (
<>
    <SEO 
    title="Our Menu - Sector Seven Coffee | Specialty Coffee & Drinks"
    description="Explore our menu of specialty coffee drinks at Sector Seven Coffee. From espresso-based drinks to manual brew, signature beverages, and non-coffee options. Premium quality in every cup."
    keywords="sector seven menu, coffee menu yogyakarta, espresso menu, manual brew coffee, specialty drinks, signature coffee, coffee prices yogyakarta, best coffee menu ugm"
    url="/menu"
    image="/og-image.jpg"
    />

    <div className="min-h-screen bg-white">
    {/* Desktop Layout */}
    <div className="hidden lg:flex">
        <CategorySidebar 
        categories={menuCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        />

        <div className="flex-1 ml-64">
        <ProductSlider 
            items={currentItems}
            currentIndex={currentIndex}
            activeCategory={activeCategory}
            direction={direction}
            onNext={handleNext}
            onPrev={handlePrev}
            onIndexChange={setCurrentIndex}
            onDirectionChange={setDirection}
        />

        <ProductGrid 
            items={currentItems}
            activeCategory={activeCategory}
            onProductClick={handleProductClick}
        />
        </div>
    </div>

    {/* Mobile Layout */}
    <div className="lg:hidden">
        <CategoryIconBar 
        categories={menuCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        />

        <ProductSlider 
        items={currentItems}
        currentIndex={currentIndex}
        activeCategory={activeCategory}
        direction={direction}
        onNext={handleNext}
        onPrev={handlePrev}
        onIndexChange={setCurrentIndex}
        onDirectionChange={setDirection}
        isMobile
        />

        <ProductGrid 
        items={currentItems}
        activeCategory={activeCategory}
        onProductClick={handleProductClick}
        isMobile
        />
    </div>
    </div>
</>
);
};

export default Menu;