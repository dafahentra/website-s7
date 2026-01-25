// pages/About/StorySection.jsx
import React, { useState, useEffect, useRef } from "react";

const StorySection = () => {
const [isLeftVisible, setIsLeftVisible] = useState(false);
const [isRightVisible, setIsRightVisible] = useState(false);
const leftRef = useRef(null);
const rightRef = useRef(null);

useEffect(() => {
    const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
        if (entry.isIntersecting) {
            if (entry.target === leftRef.current) {
            setIsLeftVisible(true);
            } else if (entry.target === rightRef.current) {
            setIsRightVisible(true);
            }
        }
        });
    },
    { threshold: 0.2 }
    );

    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);

    return () => {
    if (leftRef.current) observer.unobserve(leftRef.current);
    if (rightRef.current) observer.unobserve(rightRef.current);
    };
}, []);

return (
    <div className="max-w-[1200px] mx-auto mb-32">
    <div className="grid lg:grid-cols-2 gap-16 items-center mx-4">
        <div
        ref={leftRef}
        className={`transition-all duration-800 ease-out ${
            isLeftVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
        }`}
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
        </div>

        <div
        ref={rightRef}
        className={`relative transition-all duration-800 ease-out delay-200 ${
            isRightVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
        }`}
        >
        <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop"
            alt="Story"
            className="rounded-3xl shadow-2xl"
            loading="lazy"
        />
        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#f39248] rounded-full -z-10"></div>
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#1d3866] rounded-full -z-10"></div>
        </div>
    </div>
    </div>
);
};

export default React.memo(StorySection);