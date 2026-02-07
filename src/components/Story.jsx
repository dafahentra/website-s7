// components/Story.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import story from "../assets/story.png";
import { Link } from "react-router-dom";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import { TYPOGRAPHY, RADIUS, TRANSITIONS, SHADOWS, SPACING } from "../styles/designSystem";

const Story = () => {
  const [headerRef, isHeaderVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [imageRef, isImageVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [textRef, isTextVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <div className={`${SPACING.container.maxWidth} my-10 mx-auto`}>
      <div className={SPACING.container.padding}>
        <h1
          ref={headerRef}
          className={`${TYPOGRAPHY.heading.responsive} text-brand-navy mb-4 ${TYPOGRAPHY.weight.bold} md:text-left text-center ${TRANSITIONS.slow} ${
            isHeaderVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}
        >
          About Us
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
            <p className={`${TYPOGRAPHY.body.regular} text-black text-justify mb-4 align-top mt-8`}>
              We saw a need. Campus life is fast. You need a pause. A space to breathe. So we built this. Sector Seven was born. <br /> <br /> 
              We ensure quality for everyone. That was our goal. Bold espresso blends. Pure ceremonial matcha. Crafted in precision. Perfect fuel for your ambition.
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <Link to="/about">
                <button className={`mt-4 bg-brand-navy px-8 py-4 ${RADIUS.circle} w-[200px] text-white hover:border-brand-navy hover:bg-white hover:text-brand-navy ${TRANSITIONS.fast} ${TYPOGRAPHY.body.regular} ${SHADOWS.image.responsive} border-2 border-brand-navy`}>
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
