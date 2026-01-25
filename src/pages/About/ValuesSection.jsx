// pages/About/ValuesSection.jsx
import React from "react";
import { motion } from "framer-motion";

const ValuesSection = () => {
return (
<div className="py-20 bg-white">
    <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-6xl font-bold text-[#1d3866] mb-6 text-center">Our Values</h2>
    <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto text-lg">
        Nilai-nilai ini adalah bahasa umum kami yang benar-benar menangkap semangat bagaimana kami selalu melakukan hal-hal di bisnis kami.
    </p>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Value 1 */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-center"
        >
        <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#6b8e4e] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#6b8e4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#6b8e4e] mb-4">We do the right thing...</h3>
        <p className="text-gray-700 leading-relaxed">
            Kami <span className="font-bold">terbuka, jujur</span> dan <span className="font-bold">menghormati</span>. Kami <span className="font-bold">melakukan apa yang kami katakan dan mengatakan apa yang kami lakukan</span>.
        </p>
        </motion.div>

        {/* Value 2 */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-center"
        >
        <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#f39248] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#f39248]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#f39248] mb-4">We are in it together...</h3>
        <p className="text-gray-700 leading-relaxed">
            Kami semua bagian dari <span className="font-bold">keluarga Sector Seven</span>. Kami <span className="font-bold">saling mendukung</span> dan <span className="font-bold">menyertakan</span> semua orang.
        </p>
        </motion.div>

        {/* Value 3 */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center"
        >
        <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#9b4d96] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#9b4d96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#9b4d96] mb-4">We give a damn...</h3>
        <p className="text-gray-700 leading-relaxed">
            Kami <span className="font-bold">peduli</span> tentang apa yang kami lakukan dan <span className="font-bold">bangga</span> dengan cara kami melakukannya. Kami <span className="font-bold">bersemangat</span> dan <span className="font-bold">membuat perbedaan</span>.
        </p>
        </motion.div>

        {/* Value 4 */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center"
        >
        <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#5dade2] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#5dade2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#5dade2] mb-4">We get it done...</h3>
        <p className="text-gray-700 leading-relaxed">
            Kami menggunakan <span className="font-bold">talenta unik</span> kami untuk menemukan <span className="font-bold">solusi</span> dan <span className="font-bold">mencapai tujuan bersama</span>. Kami merayakan kesuksesan.
        </p>
        </motion.div>
    </div>
    </div>
</div>
);
};

export default ValuesSection;