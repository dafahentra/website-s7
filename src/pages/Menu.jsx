import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Menu = () => {
const [activeCategory, setActiveCategory] = useState("Espresso Based");
const [currentIndex, setCurrentIndex] = useState(0);
const [direction, setDirection] = useState(0);

const categories = [
{ 
    id: "Espresso Based", 
    name: "Espresso Based",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2M4 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4V3z"/>
    </svg>
    )
},
{ 
    id: "Flavoured Based", 
    name: "Flavoured Based",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5 2h-13c-.28 0-.5.22-.5.5v19c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-19c0-.28-.22-.5-.5-.5M12 19c-.83 0-1.5-.67-1.5-1.5S11.17 16 12 16s1.5.67 1.5 1.5S12.83 19 12 19m5.5-5H6.5V4h11v10z"/>
    </svg>
    )
},
{ 
    id: "Matcha Series", 
    name: "Matcha Series",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2v2l1 1v13a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5l1-1V2H4m11 16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3h8v3m0-5H7V5h8v8z"/>
    </svg>
    )
},
{ 
    id: "Matcha Series", 
    name: "Matcha Series",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 19H7c-1.1 0-2-.9-2-2V8h14v9c0 1.1-.9 2-2 2M19 6H5V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2m3 5h-2V9h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1z"/>
    </svg>
    )
},
{ 
    id: "Pastry", 
    name: "Pastry",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5 2C9.5 2 7 4.5 7 7.5c0 1.9 1 3.6 2.4 4.7L8 22h9l-1.4-9.8c1.4-1.1 2.4-2.8 2.4-4.7C18 4.5 15.5 2 12.5 2m0 2c2.5 0 4.5 2 4.5 4.5c0 1.7-1 3.2-2.4 4l-.6.4.8 5.6h-5.7l.8-5.6-.6-.4c-1.4-.8-2.4-2.3-2.4-4C8 6 10 4 12.5 4z"/>
    </svg>
    )
},
{ 
    id: "Sourdough", 
    name: "Sourdough",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 4v7l2 3v2h1v2h-1v4H5v-4H4v-2h1v-2l2-3V4c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2M9 4v7.75L7.5 14h9L15 11.75V4H9m-1 13h8v2H8v-2z"/>
    </svg>
    )
},
{ 
    id: "Instant", 
    name: "Instant",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1m16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
    )
},
];

const menuItems = {
"Espresso Based": [
    {
    id: 1,
    name: "Hot Latte",
    description: "Satu shot espresso dengan susu steam dan berlapis foam tipis di atasnya tanpa gula",
    price: "20.000",
    image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600&h=600&fit=crop"
    },
    {
    id: 2,
    name: "Cappuccino",
    description: "Espresso dengan susu foam yang creamy dan rich",
    price: "22.000",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=600&fit=crop"
    },
    {
    id: 3,
    name: "Americano",
    description: "Classic espresso dengan hot water yang smooth",
    price: "18.000",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop"
    },
],
"Flavoured Based": [
    {
    id: 5,
    name: "Caramel Frappe",
    description: "Blended ice coffee dengan caramel sauce",
    price: "28.000",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop"
    },
    {
    id: 6,
    name: "Mocha Frappe",
    description: "Chocolate blended dengan espresso dan whipped cream",
    price: "30.000",
    image: "https://images.unsplash.com/photo-1562843142-c4fe25b78c78?w=600&h=600&fit=crop"
    },
],
"Matcha Series": [
    {
    id: 7,
    name: "Hazelnut Milk",
    description: "Susu dengan hazelnut syrup yang creamy",
    price: "26.000",
    image: "https://images.unsplash.com/photo-1556910110-a6c7c4c0e2d6?w=600&h=600&fit=crop"
    },
    {
    id: 8,
    name: "Vanilla Milk",
    description: "Fresh milk dengan vanilla yang aromatic",
    price: "24.000",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=600&fit=crop"
    },
],
"Matcha Series": [
    {
    id: 9,
    name: "Green Tea Latte",
    description: "Premium green tea dengan susu yang smooth",
    price: "25.000",
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cda9?w=600&h=600&fit=crop"
    },
    {
    id: 10,
    name: "Earl Grey Tea",
    description: "Classic earl grey tea dengan bergamot",
    price: "20.000",
    image: "https://images.unsplash.com/photo-1597318378921-d89f8d46c7a2?w=600&h=600&fit=crop"
    },
],
"Pastry": [
    {
    id: 11,
    name: "Lemon Squash",
    description: "Fresh lemon dengan sparkling water",
    price: "22.000",
    image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f8d?w=600&h=600&fit=crop"
    },
    {
    id: 12,
    name: "Strawberry Refresher",
    description: "Fresh strawberry blended dengan soda",
    price: "26.000",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&h=600&fit=crop"
    },
],
"Sourdough": [
    {
    id: 13,
    name: "Kopi Beans 250gr",
    description: "Premium arabica beans untuk home brewing",
    price: "85.000",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop"
    },
    {
    id: 14,
    name: "Drip Coffee Pack",
    description: "Ready to brew drip coffee sachets (10 pcs)",
    price: "65.000",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop"
    },
],
"Instant": [
    {
    id: 15,
    name: "Tumbler Sector Seven",
    description: "Stainless steel tumbler 500ml dengan logo",
    price: "95.000",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop"
    },
    {
    id: 16,
    name: "Tote Bag",
    description: "Canvas tote bag premium quality",
    price: "75.000",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop"
    },
],
};

const currentItems = menuItems[activeCategory] || [];
const currentItem = currentItems[currentIndex] || currentItems[0];

const handleNext = () => {
setDirection(1);
setCurrentIndex((prev) => (prev + 1) % currentItems.length);
};

const handlePrev = () => {
setDirection(-1);
setCurrentIndex((prev) => (prev - 1 + currentItems.length) % currentItems.length);
};

const handleCategoryChange = (categoryId) => {
setActiveCategory(categoryId);
setCurrentIndex(0);
setDirection(0);
};

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

return (
<div className="min-h-screen bg-white">
    {/* Desktop Layout */}
    <div className="hidden lg:flex">
    {/* Sidebar Categories - Fixed (Desktop) */}
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 pt-20">
        <div className="py-6 px-4">
        {categories.map((category) => (
            <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`w-full text-left px-4 py-3 mb-2 font-medium transition-all duration-200 flex items-center gap-3 rounded-lg ${
                activeCategory === category.id
                ? "text-[#0d7d4a] bg-gray-50"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
            >
            <span className={activeCategory === category.id ? "text-[#0d7d4a]" : "text-gray-400"}>
                {category.icon}
            </span>
            <span className="text-sm">{category.name}</span>
            </button>
        ))}
        </div>
    </div>

    {/* Content Area (Desktop) */}
    <div className="flex-1 ml-64">
        {/* Slider Section */}
        <div className="px-12 pt-24 pb-8 border-b border-gray-200">
        <div className="flex items-center justify-center gap-8 max-w-5xl mx-auto w-full">
            {/* Navigation Arrow Left */}
            {currentItems.length > 1 && (
            <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border-2 border-[#f07828] flex items-center justify-center hover:bg-[#f07828] hover:text-white transition-all group flex-shrink-0"
            >
                <svg className="w-5 h-5 text-[#f07828] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            )}

            {/* Product Image with Animation */}
            <div className="w-72 h-72 relative overflow-hidden flex-shrink-0">
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
                        handleNext();
                    } else if (swipe > swipeConfidenceThreshold) {
                        handlePrev();
                    }
                    }}
                    className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
                />
                )}
            </AnimatePresence>
            </div>

            {/* Navigation Arrow Right */}
            {currentItems.length > 1 && (
            <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full border-2 border-[#f07828] flex items-center justify-center hover:bg-[#f07828] hover:text-white transition-all group flex-shrink-0"
            >
                <svg className="w-5 h-5 text-[#f07828] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            )}

            {/* Product Info */}
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
            
            {/* Dots Indicator - Fixed position at bottom */}
            {currentItems.length > 1 && (
                <div className="flex gap-2">
                {currentItems.map((_, index) => (
                    <button
                    key={index}
                    onClick={() => {
                        setDirection(index > currentIndex ? 1 : -1);
                        setCurrentIndex(index);
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
        </div>
        </div>

        {/* Grid Section - All Items Below */}
        <div className="px-12 py-10 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1d3866] mb-8">Semua Menu {activeCategory}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.map((item) => (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                const itemIndex = currentItems.findIndex(i => i.id === item.id);
                setCurrentIndex(itemIndex);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#f07828]"
            >
                <div className="aspect-square overflow-hidden">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                </div>
                <div className="p-5">
                <h3 className="text-xl font-bold text-[#1d3866] mb-2">
                    {item.name}
                </h3>
                <p className="text-[#f07828] text-2xl font-bold">
                    Rp{item.price}
                </p>
                </div>
            </motion.div>
            ))}
        </div>
        </div>
    </div>
    </div>

    {/* Mobile Layout */}
    <div className="lg:hidden">
    {/* Category Icons - Horizontal (Mobile) */}
    <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 pt-20">
        <div className="px-4 py-6">
        <div className="flex justify-center items-center gap-6">
            {categories.map((category) => (
            <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
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

    {/* Slider Section (Mobile) */}
    <div className="px-6 py-8 border-b border-gray-200">
        <div className="flex items-center justify-center gap-4 mb-6">
        {currentItems.length > 1 && (
            <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border-2 border-[#f07828] flex items-center justify-center hover:bg-[#f07828] hover:text-white transition-all group flex-shrink-0"
            >
            <svg className="w-4 h-4 text-[#f07828] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            </button>
        )}

        <div className="w-64 h-64 relative overflow-hidden flex-shrink-0">
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
                    handleNext();
                    } else if (swipe > swipeConfidenceThreshold) {
                    handlePrev();
                    }
                }}
                className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
                />
            )}
            </AnimatePresence>
        </div>

        {currentItems.length > 1 && (
            <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border-2 border-[#f07828] flex items-center justify-center hover:bg-[#f07828] hover:text-white transition-all group flex-shrink-0"
            >
            <svg className="w-4 h-4 text-[#f07828] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </button>
        )}
        </div>

        {/* Product Info (Mobile) */}
        <div className="text-center">
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

        {/* Dots Indicator (Mobile) */}
        {currentItems.length > 1 && (
            <div className="flex justify-center gap-2">
            {currentItems.map((_, index) => (
                <button
                key={index}
                onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
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
    </div>

    {/* Grid Section - All Items Below (Mobile) */}
    <div className="px-6 py-8">
        <h2 className="text-xl font-bold text-[#1d3866] mb-6">Semua Menu {activeCategory}</h2>
        
        <div className="grid grid-cols-2 gap-4">
        {currentItems.map((item) => (
            <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
                const itemIndex = currentItems.findIndex(i => i.id === item.id);
                setCurrentIndex(itemIndex);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent active:border-[#f07828]"
            >
            <div className="aspect-square overflow-hidden">
                <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                />
            </div>
            <div className="p-3">
                <h3 className="text-base font-bold text-[#1d3866] mb-1">
                {item.name}
                </h3>
                <p className="text-[#f07828] text-lg font-bold">
                Rp{item.price}
                </p>
            </div>
            </motion.div>
        ))}
        </div>
    </div>
    </div>

</div>
);
};

export default Menu;