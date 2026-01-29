// pages/About/StorySection.jsx
import React from "react";
import { motion } from "framer-motion";

const StorySection = () => {
return (
<div className="max-w-[1200px] mx-auto mb-32">
    <div className="grid lg:grid-cols-2 gap-16 items-center mx-4">
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
    >
        <p className="text-base md:text-xl lg:text-2xl text-[#f39248] mb-4 tracking-wider uppercase font-semibold">Our Story</p>
        <h2 className="text-6xl font-bold text-[#1d3866] mb-8 leading-tight">
        Your Sector,<br />Your Soul
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
        Your campus life moves at an impossible pace. Assignments stack up. Meetings overlap. Sleep becomes optional. 
        To survive this, you need real fuel. We keep you sharp. Sector Seven delivers exactly what you need when you need it.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
        Yet constant speed burns you out. When adrenaline becomes anxiety, we restore balance. 
        Calm energy. Clear focus. No crash. Sector Seven holds space for both hustle and healing.
        </p>
    </motion.div>

    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
    >
        <img
        src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop"
        alt="Story"
        className="rounded-3xl shadow-2xl"
        />
    </motion.div>
    </div>
</div>
);
};

export default StorySection;