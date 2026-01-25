import React, { useState, useEffect, useRef } from "react";
import story from "../assets/story.png";
import { Link } from "react-router-dom";

const Story = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  
  const headerRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === headerRef.current) {
              setIsHeaderVisible(true);
            } else if (entry.target === imageRef.current) {
              setIsImageVisible(true);
            } else if (entry.target === textRef.current) {
              setIsTextVisible(true);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    if (imageRef.current) observer.observe(imageRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (imageRef.current) observer.unobserve(imageRef.current);
      if (textRef.current) observer.unobserve(textRef.current);
    };
  }, []);

  return (
    <div className="max-w-[1200px] my-10 mx-auto">
      <div className="mx-4">
        <h1
          ref={headerRef}
          className={`text-6xl text-[#1d3866] mb-4 font-bold md:text-left text-center transition-all duration-700 ease-out ${
            isHeaderVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}
        >
          Our Story
        </h1>
        <div className="grid lg:grid-cols-2 gap-8 place-items-center">
          <div
            ref={imageRef}
            className={`h-full transition-all duration-1000 ease-out ${
              isImageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <img src={story} alt="story" className="object-cover" loading="lazy" />
          </div>
          <div
            ref={textRef}
            className={`transition-all duration-1000 ease-out ${
              isTextVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <p className="text-2xl text-black text-justify mb-4 align-top mt-8">
              Didirikan pada tahun 2026, SECTOR SEVEN bermula dari usaha rintisan yang
              bercita-cita menggabungkan matcha arawa ciwidey. <br /> <br /> 
              Kami hadir untuk memberikan pengalaman rasa yang unik bagi para pecinta kopi dan matcha di lingkungan fakultas.
            </p>
            
            <Link to="/about">
              <button className="mt-4 bg-[#1d3866] px-8 py-4 rounded-full w-[200px] text-white hover:border-[#1d3866] hover:bg-white hover:text-[#1d3866] transition-all duration-300 text-md shadow-2xl shadow-[#1d3866] border-2 border-[#1d3866]">
                Selengkapnya
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Story);