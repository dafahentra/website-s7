// pages/About/BoardOfDirectors.jsx
import React from "react";
import { motion } from "framer-motion";

const BoardOfDirectors = ({ members }) => {
return (
<div className="py-20 bg-white">
    <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-6xl font-bold text-[#2c5530] mb-16 text-center">Board of Directors</h2>

    <div className="grid md:grid-cols-3 gap-8 mb-8 max-w-[900px] mx-auto">
        {members.slice(0, 3).map((member, index) => (
        <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
        >
            <div className="relative w-[240px] h-[240px] mx-auto mb-[-40px] z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
            <img
                src={member.image}
                alt={member.name}
                className="relative w-full h-full object-cover rounded-full"
            />
            </div>
            <div className="bg-white rounded-2xl p-6 pt-14 shadow-md relative">
            <h3 className="text-xl font-bold text-[#2c5530] mb-2">{member.name}</h3>
            <p className="text-gray-600 font-medium">{member.position}</p>
            </div>
        </motion.div>
        ))}
    </div>

    <div className="grid md:grid-cols-2 gap-8 max-w-[600px] mx-auto">
        {members.slice(3, 5).map((member, index) => (
        <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index + 3) * 0.1 }}
            className="text-center"
        >
            <div className="relative w-[240px] h-[240px] mx-auto mb-[-40px] z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
            <img
                src={member.image}
                alt={member.name}
                className="relative w-full h-full object-cover rounded-full"
            />
            </div>
            <div className="bg-white rounded-2xl p-6 pt-14 shadow-md relative">
            <h3 className="text-xl font-bold text-[#2c5530] mb-2">{member.name}</h3>
            <p className="text-gray-600 font-medium">{member.position}</p>
            </div>
        </motion.div>
        ))}
    </div>
    </div>
</div>
);
};

export default BoardOfDirectors;