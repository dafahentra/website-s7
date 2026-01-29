// ========================================
// 1. Story.jsx - FIXED (Use Custom Hook)
// ========================================
import React from "react";
import story from "../assets/story.png";
import { Link } from "react-router-dom";
import useIntersectionObserver from "../hooks/useIntersectionObserver";

const Story = () => {
  // ✅ FIXED: Gunakan custom hook yang sudah dibuat
  const [headerRef, isHeaderVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [imageRef, isImageVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [textRef, isTextVisible] = useIntersectionObserver({ threshold: 0.2 });

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
              We saw a need. Campus life is fast. You need a pause. A space to breathe. So we built this. Sector Seven was born. <br /> <br /> 
              Quality for everyone. That was our goal. Bold espresso blends. Pure ceremonial matcha. Crafted in precision. Perfect fuel for your ambition.
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <Link to="/about">
                <button className="mt-4 bg-[#1d3866] px-8 py-4 rounded-full w-[200px] text-white hover:border-[#1d3866] hover:bg-white hover:text-[#1d3866] transition-all duration-300 text-md shadow-2xl shadow-[#1d3866] border-2 border-[#1d3866]">
                  See More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Story);