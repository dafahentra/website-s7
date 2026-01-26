// pages/About/ValuesSection.jsx - FIXED VERSION
import React from "react";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";

const ValueCard = ({ icon, title, description, colorClasses, delay }) => {
const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.2 });

return (
    <div
    ref={cardRef}
    className={`text-center transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {/* FIXED: Gunakan colorClasses langsung tanpa template literal */}
    <div className={`w-40 h-40 mx-auto mb-6 rounded-full border-4 flex items-center justify-center ${colorClasses.border}`}>
        {icon}
    </div>
    <h3 className={`text-2xl font-bold mb-4 ${colorClasses.text}`}>{title}</h3>
    <div className="text-gray-700 leading-relaxed">{description}</div>
    </div>
);
};

const ValuesSection = () => {
const values = [
    {
      // FIXED: Berikan class lengkap yang bisa di-purge Tailwind
    colorClasses: {
        border: "border-[#6b8e4e]",
        text: "text-[#6b8e4e]"
    },
    title: "We do the right thing...",
    description: (
        <>
        Kami <span className="font-bold">terbuka, jujur</span> dan <span className="font-bold">menghormati</span>. Kami <span className="font-bold">melakukan apa yang kami katakan dan mengatakan apa yang kami lakukan</span>.
        </>
    ),
    icon: (
        <svg className="w-20 h-20 text-[#6b8e4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    ),
    delay: 100
    },
    {
    colorClasses: {
        border: "border-[#f39248]",
        text: "text-[#f39248]"
    },
    title: "We are in it together...",
    description: (
        <>
        Kami semua bagian dari <span className="font-bold">keluarga Sector Seven</span>. Kami <span className="font-bold">saling mendukung</span> dan <span className="font-bold">menyertakan</span> semua orang.
        </>
    ),
    icon: (
        <svg className="w-20 h-20 text-[#f39248]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    delay: 200
    },
    {
    colorClasses: {
        border: "border-[#9b4d96]",
        text: "text-[#9b4d96]"
    },
    title: "We give a damn...",
    description: (
        <>
        Kami <span className="font-bold">peduli</span> tentang apa yang kami lakukan dan <span className="font-bold">bangga</span> dengan cara kami melakukannya. Kami <span className="font-bold">bersemangat</span> dan <span className="font-bold">membuat perbedaan</span>.
        </>
    ),
    icon: (
        <svg className="w-20 h-20 text-[#9b4d96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    delay: 300
    },
    {
    colorClasses: {
        border: "border-[#5dade2]",
        text: "text-[#5dade2]"
    },
    title: "We get it done...",
    description: (
        <>
        Kami menggunakan <span className="font-bold">talenta unik</span> kami untuk menemukan <span className="font-bold">solusi</span> dan <span className="font-bold">mencapai tujuan bersama</span>. Kami merayakan kesuksesan.
        </>
    ),
    icon: (
        <svg className="w-20 h-20 text-[#5dade2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    delay: 400
    }
];

return (
    <div className="py-20 bg-white">
    <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-6xl font-bold text-[#1d3866] mb-6 text-center">Our Values</h2>
        <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto text-lg">
        Nilai-nilai ini adalah bahasa umum kami yang benar-benar menangkap semangat bagaimana kami selalu melakukan hal-hal di bisnis kami.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((value, index) => (
            <ValueCard
            key={index}
            icon={value.icon}
            title={value.title}
            description={value.description}
            colorClasses={value.colorClasses}
            delay={value.delay}
            />
        ))}
        </div>
    </div>
    </div>
);
};

export default React.memo(ValuesSection);