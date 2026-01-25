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
        <p className="text-sm text-[#f39248] mb-4 tracking-wider uppercase">Our Story</p>
        <h2 className="text-6xl font-bold text-[#1d3866] mb-8 leading-tight">
        Your Sector,<br />Your Soul
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
        Di tengah kesibukan dunia modern, mudah untuk kehilangan fokus pada hal-hal yang benar-benar penting.
        Sector Seven hadir sebagai tempat pelarian di mana Anda dapat memperlambat tempo dan menikmati
        secangkir minuman berkualitas tinggi.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
        Filosofi kami tercermin dalam setiap cangkir yang kami sajikan - menginspirasi orang untuk
        merangkul hal-hal esensial dalam hidup di tengah gaya hidup yang sibuk, satu cangkir pada satu waktu.
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