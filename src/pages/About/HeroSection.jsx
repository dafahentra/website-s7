// pages/About/HeroSection.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useState, useEffect, useRef } from "react";
import { RADIUS, SHADOWS, TRANSITIONS } from "../../styles/designSystem";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto mb-element-sm md:mb-element-md lg:mb-element">
      <div
        ref={heroRef}
        className={`relative h-[500px] mx-4 ${RADIUS.image.responsive} overflow-hidden ${TRANSITIONS.slow} ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <img
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&h=500&fit=crop"
          alt="Our Story"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
          <div className="max-w-3xl ml-12 text-white">
            <p className="text-body-lg md:text-body-xl mb-4 tracking-wider">About Sector Seven</p>
            <h1 className="text-hero-mobile lg:text-hero font-bold mb-6">Our Story</h1>
            <p className="text-body-md lg:text-body-xl font-light">
              Get to know about us, stores, environment, and people behind it!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HeroSection);
