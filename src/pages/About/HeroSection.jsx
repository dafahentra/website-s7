// pages/About/HeroSection.jsx
import React from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
return (
<div className="max-w-[1400px] mx-auto mb-20">
    <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative h-[500px] mx-4 rounded-3xl overflow-hidden"
    >
    <img
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&h=500&fit=crop"
        alt="Our Story"
        className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
        <div className="max-w-3xl ml-12 text-white">
        <p className="text-xl mb-4 tracking-wider">About Sector Seven</p>
        <h1 className="text-7xl font-bold mb-6">Our Story</h1>
        <p className="text-2xl font-light">
            Get to know about us, stores, environment, and people behind it!
        </p>
        </div>
    </div>
    </motion.div>
</div>
);
};

export default HeroSection;