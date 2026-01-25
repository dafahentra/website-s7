// pages/About/BoardOfDirectors.jsx
import React, { useState, useEffect, useRef } from "react";

const MemberCard = ({ member, delay }) => {
const [isVisible, setIsVisible] = useState(false);
const cardRef = useRef(null);

useEffect(() => {
    const observer = new IntersectionObserver(
    ([entry]) => {
        if (entry.isIntersecting) {
        setIsVisible(true);
        }
    },
    { threshold: 0.2 }
    );

    if (cardRef.current) {
    observer.observe(cardRef.current);
    }

    return () => {
    if (cardRef.current) {
        observer.unobserve(cardRef.current);
    }
    };
}, []);

return (
    <div
    ref={cardRef}
    className={`text-center transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
    <div className="relative w-[240px] h-[240px] mx-auto mb-[-40px] z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
        <img
        src={member.image}
        alt={member.name}
        className="relative w-full h-full object-cover rounded-full"
        loading="lazy"
        />
    </div>
    <div className="bg-white rounded-2xl p-6 pt-14 shadow-md relative">
        <h3 className="text-xl font-bold text-[#2c5530] mb-2">{member.name}</h3>
        <p className="text-gray-600 font-medium">{member.position}</p>
    </div>
    </div>
);
};

const BoardOfDirectors = ({ members }) => {
return (
    <div className="py-20 bg-white">
    <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-6xl font-bold text-[#2c5530] mb-16 text-center">Board of Directors</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-8 max-w-[900px] mx-auto">
        {members.slice(0, 3).map((member, index) => (
            <MemberCard key={member.name} member={member} delay={index * 100} />
        ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[600px] mx-auto">
        {members.slice(3, 5).map((member, index) => (
            <MemberCard key={member.name} member={member} delay={(index + 3) * 100} />
        ))}
        </div>
    </div>
    </div>
);
};

export default React.memo(BoardOfDirectors);