// pages/About/TestimonialSlider.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heading } from "../../components/ui";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../../styles/designSystem";

// Memoized Navigation Button
const NavigationButton = React.memo(({ onClick, direction, ariaLabel }) => (
  <button
    onClick={onClick}
    className={`bg-brand-navy text-white p-2 md:p-2.5 lg:p-3 ${RADIUS.circle} ${TRANSITIONS.hover.color} shadow-card-lg active:scale-95 [@media(hover:hover)]:hover:bg-brand-orange`}
    aria-label={ariaLabel}
  >
    <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d={direction === 'prev' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
      />
    </svg>
  </button>
));

NavigationButton.displayName = 'NavigationButton';

// Memoized Indicator Dot
const IndicatorDot = React.memo(({ isActive, onClick, index }) => (
  <button
    onClick={onClick}
    className={`w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 ${RADIUS.circle} ${TRANSITIONS.fast} ${
      isActive ? 'bg-brand-orange w-6 md:w-7 lg:w-8' : 'bg-gray-300 [@media(hover:hover)]:hover:bg-gray-400'
    }`}
    aria-label={`Go to testimonial ${index + 1}`}
  />
));

IndicatorDot.displayName = 'IndicatorDot';

// Memoized Testimonial Content
const TestimonialContent = React.memo(({ testimonial }) => (
  <motion.div
    key={testimonial.name}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.5 }}
    className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-center p-4 md:p-8 lg:p-12"
  >
    <div className="relative">
      <div className="relative w-full max-w-[200px] md:max-w-xs lg:max-w-md mx-auto">
        <div className="absolute -top-3 -left-3 lg:-top-6 lg:-left-6 w-16 h-16 lg:w-32 lg:h-32 bg-brand-orange rounded-full opacity-50"></div>
        <div className="absolute -bottom-3 -right-3 lg:-bottom-6 lg:-right-6 w-20 h-20 lg:w-40 lg:h-40 bg-brand-navy rounded-full opacity-50"></div>
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className={`relative ${RADIUS.card.responsive} ${SHADOWS.image.responsive} w-full aspect-square object-cover`}
          loading="lazy"
        />
      </div>
      <div className="text-center mt-4 md:mt-6 lg:mt-8">
        <h3 className={`${TYPOGRAPHY.body.default} md:${TYPOGRAPHY.subheading.tablet} lg:${TYPOGRAPHY.subheading.desktop} ${TYPOGRAPHY.weight.bold} text-brand-navy mb-1 md:mb-2`}>
          {testimonial.name}
        </h3>
        <p className={`${TYPOGRAPHY.body.small} md:${TYPOGRAPHY.body.default} lg:${TYPOGRAPHY.body.large} text-brand-orange ${TYPOGRAPHY.weight.semibold}`}>
          {testimonial.role}
        </p>
      </div>
    </div>

    <div className="relative">
      <div className={`${TYPOGRAPHY.heading.tablet} md:${TYPOGRAPHY.heading.lg} lg:${TYPOGRAPHY.heading.xl} text-brand-orange opacity-20 absolute -top-4 md:-top-6 lg:-top-8 -left-2 md:-left-3 lg:-left-4`}>"</div>
      <p className={`${TYPOGRAPHY.body.small} md:${TYPOGRAPHY.body.large} lg:${TYPOGRAPHY.subheading.tablet} text-gray-700 leading-relaxed relative z-10 pl-6 md:pl-10 lg:pl-12 pr-4 md:pr-6 lg:pr-8`}>
        {testimonial.quote}
      </p>
      <div className={`${TYPOGRAPHY.heading.tablet} md:${TYPOGRAPHY.heading.lg} lg:${TYPOGRAPHY.heading.xl} text-brand-orange opacity-20 absolute -bottom-4 md:-bottom-6 lg:-bottom-8 -right-2 md:-right-3 lg:-right-4`}>"</div>
    </div>
  </motion.div>
));

TestimonialContent.displayName = 'TestimonialContent';

const TestimonialSlider = ({ testimonials }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  }, [testimonials.length]);

  const goToTestimonial = useCallback((index) => {
    setCurrentTestimonial(index);
  }, []);

  const currentTestimonialData = useMemo(
    () => testimonials[currentTestimonial],
    [testimonials, currentTestimonial]
  );

  return (
    <div className="py-section-sm md:py-section-md lg:py-section bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-8 md:mb-12 lg:mb-16 mx-4">
          <Heading as="h2" variant="page" color="navy" center>
            Our Customer Says
          </Heading>
        </div>

        <div className="mx-4 relative">
          <div className={`bg-gradient-to-br from-white to-gray-50 ${RADIUS.card.responsive} overflow-hidden ${SHADOWS.image.responsive}`}>
            <AnimatePresence mode="wait">
              <TestimonialContent testimonial={currentTestimonialData} />
            </AnimatePresence>

            <div className="flex justify-center items-center gap-3 md:gap-4 pb-4 md:pb-6 lg:pb-8">
              <NavigationButton 
                onClick={prevTestimonial} 
                direction="prev"
                ariaLabel="Previous testimonial"
              />

              <div className="flex gap-1.5 md:gap-2">
                {testimonials.map((_, index) => (
                  <IndicatorDot
                    key={index}
                    isActive={currentTestimonial === index}
                    onClick={() => goToTestimonial(index)}
                    index={index}
                  />
                ))}
              </div>

              <NavigationButton 
                onClick={nextTestimonial} 
                direction="next"
                ariaLabel="Next testimonial"
              />
            </div>
          </div>

          <div className="text-center mt-4 md:mt-5 lg:mt-6">
            <p className={`${TYPOGRAPHY.body.small} md:${TYPOGRAPHY.body.regular} text-gray-500 ${TYPOGRAPHY.weight.semibold}`}>
              {currentTestimonial + 1} / {testimonials.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TestimonialSlider);
