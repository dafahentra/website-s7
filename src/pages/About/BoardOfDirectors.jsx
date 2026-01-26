// pages/About/BoardOfDirectors.jsx
import React, { useState, useEffect, useRef } from "react";

const MemberCard = ({ member, delay, isMobile = false }) => {
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

// Mobile: 40% lebih kecil dari desktop (240px -> 144px)
const imageSize = isMobile ? 'w-[144px] h-[144px]' : 'w-[240px] h-[240px]';
const marginBottom = isMobile ? 'mb-[-24px]' : 'mb-[-40px]';
const paddingTop = isMobile ? 'pt-9' : 'pt-14';
const padding = isMobile ? 'p-4' : 'p-6';
const nameSize = isMobile ? 'text-sm' : 'text-xl';
const positionSize = isMobile ? 'text-xs' : 'text-base';
const namePadding = isMobile ? 'mb-1' : 'mb-2';

return (
<div
    ref={cardRef}
    className={`text-center transition-all duration-700 ease-out ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
>
    <div className={`relative ${imageSize} mx-auto ${marginBottom} z-10`}>
    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
    <img
        src={member.image}
        alt={member.name}
        className="relative w-full h-full object-cover rounded-full"
        loading="lazy"
    />
    </div>
    <div className={`bg-white rounded-2xl ${padding} ${paddingTop} shadow-md relative`}>
    <h3 className={`${nameSize} font-bold text-[#2c5530] ${namePadding}`}>{member.name}</h3>
    <p className={`${positionSize} text-gray-600 font-medium`}>{member.position}</p>
    </div>
</div>
);
};

const BoardOfDirectors = ({ members }) => {
return (
<div className="py-20 bg-white">
    <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-4xl md:text-6xl font-bold text-[#2c5530] mb-12 md:mb-16 text-center">
        Board of Directors
    </h2>

    {/* Desktop Layout */}
    <div className="hidden md:block">
        <div className="grid md:grid-cols-3 gap-8 mb-8 max-w-[900px] mx-auto">
        {members.slice(0, 3).map((member, index) => (
            <MemberCard key={member.name} member={member} delay={index * 100} isMobile={false} />
        ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[600px] mx-auto">
        {members.slice(3, 5).map((member, index) => (
            <MemberCard key={member.name} member={member} delay={(index + 3) * 100} isMobile={false} />
        ))}
        </div>
    </div>

    {/* Mobile Layout - 2 columns */}
    <div className="md:hidden">
        <div className="grid grid-cols-2 gap-4">
        {members.map((member, index) => {
            const isLastAndOdd = index === members.length - 1 && members.length % 2 !== 0;
            return (
            <div 
                key={member.name} 
                className={isLastAndOdd ? 'col-span-2 max-w-[180px] mx-auto' : ''}
            >
                <MemberCard member={member} delay={index * 100} isMobile={true} />
            </div>
            );
        })}
        </div>
    </div>
    </div>
</div>
);
};

export default React.memo(BoardOfDirectors);