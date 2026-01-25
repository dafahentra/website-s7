// pages/About/MilestoneSection.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const MilestoneSection = ({ milestones }) => {
const [showAllMilestones, setShowAllMilestones] = useState(false);

return (
<div className="bg-[#f8f9f5] py-20 mb-20">
    <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-5xl font-bold text-[#1d3866] mb-20 text-center">Milestone</h2>

    {/* Desktop Layout */}
    <div className="hidden lg:block relative pl-[200px]">
        <div className="absolute left-[130px] top-0 bottom-20 w-0.5 bg-gray-300"></div>

        {milestones.slice(0, showAllMilestones ? milestones.length : 2).map((milestone, index) => (
        <motion.div
            key={milestone.year}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="mb-20 last:mb-8 relative"
        >
            <div className="absolute left-[-70px] top-1/2 -translate-y-1/2 w-2 h-32 bg-[#6b8e4e] rounded-full z-10"></div>

            <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 text-right pr-4">
            <div className="text-4xl font-bold text-[#2c5530]">{milestone.year}</div>
            </div>

            <div className="grid grid-cols-[360px,1fr] gap-10 items-start">
            <div className="rounded-2xl overflow-hidden">
                <img src={milestone.image} alt={milestone.title} className="w-full h-[240px] object-cover" />
            </div>

            <div className="pt-2">
                <h3 className="text-2xl font-bold text-[#2c5530] mb-6">{milestone.title}</h3>
                <div className="space-y-4">
                {milestone.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed text-lg">
                    <span className="font-bold">{idx + 1}.</span> {detail}
                    </p>
                ))}
                </div>
            </div>
            </div>
        </motion.div>
        ))}
    </div>

    {/* Mobile Layout */}
    <div className="lg:hidden space-y-12 relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-12 bottom-12 w-1 bg-[#6b8e4e] opacity-30 z-0"></div>
        
        {milestones.slice(0, showAllMilestones ? milestones.length : 2).map((milestone, index) => (
        <motion.div
            key={milestone.year}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative z-10"
        >
            <div className="text-center mb-4 relative z-20">
            <div className="inline-block bg-[#6b8e4e] text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg">
                {milestone.year}
            </div>
            </div>

            <div className="rounded-2xl overflow-hidden mb-6">
            <img src={milestone.image} alt={milestone.title} className="w-full h-[200px] object-cover" />
            </div>

            <div>
            <h3 className="text-2xl font-bold text-[#2c5530] mb-4 text-center bg-[#f8f9f5] relative z-20 inline-block px-6 left-1/2 -translate-x-1/2">
                {milestone.title}
            </h3>
            <div className="space-y-3 bg-white p-6 rounded-2xl shadow-md">
                {milestone.details.map((detail, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed">
                    <span className="font-bold text-[#6b8e4e]">{idx + 1}.</span> {detail}
                </p>
                ))}
            </div>
            </div>
        </motion.div>
        ))}
    </div>

    {/* See More/Less Button */}
    <div className="flex justify-center mt-12">
        {!showAllMilestones && milestones.length > 2 ? (
        <button
            onClick={() => setShowAllMilestones(true)}
            className="border-2 border-[#2c5530] text-[#2c5530] px-8 py-3 rounded-full font-semibold hover:bg-[#2c5530] hover:text-white transition-colors duration-300 flex items-center gap-2"
        >
            See More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        ) : showAllMilestones && (
        <button
            onClick={() => setShowAllMilestones(false)}
            className="border-2 border-[#2c5530] text-[#2c5530] px-8 py-3 rounded-full font-semibold hover:bg-[#2c5530] hover:text-white transition-colors duration-300 flex items-center gap-2"
        >
            Show Less
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        )}
    </div>
    </div>
</div>
);
};

export default MilestoneSection;