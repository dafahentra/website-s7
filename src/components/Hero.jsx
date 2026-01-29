// components/Hero.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import coffee from "../assets/coffee.png";
import foreStore from "../assets/fore-store.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TYPOGRAPHY, RADIUS } from "../styles/designSystem";

const Hero = () => {
  const slides = [
    {
      id: 1,
      title: "Your Sector",
      subtitle: "Your Soul",
      description: "More than just a drink. The daily fuel to power your ambitions and soul.",
      image: coffee,
      alt: "Tagline"
    },
    {
      id: 2,
      title: "Our Signature",
      subtitle: "Craft",
      description: "Bold blends. Calming greens. A curated menu crafted without compromise for your day",
      image: foreStore,
      alt: "Signature"
    }
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      skipSnaps: false,
      duration: 20
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="max-w-[1200px] pt-32 pb-20 lg:pt-40 lg:pb-32 mx-auto relative z-0">
      <div className="flex gap-8 mx-4 relative">
        {/* Embla Carousel Container */}
        <div className={`overflow-hidden ${RADIUS.card.default} w-full`} ref={emblaRef}>
          <div className="flex">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0 flex items-center lg:flex-row flex-col lg:min-h-[500px] min-h-[400px] px-12 lg:px-20"
              >
                <div className="lg:text-left text-center lg:w-1/2 px-4 py-8">
                  <h1 className={`${TYPOGRAPHY.hero.responsive} text-brand-navy mb-4 ${TYPOGRAPHY.weight.bold}`}>
                    {slide.title}
                    {slide.subtitle && (
                      <>
                        <br /> {slide.subtitle}
                      </>
                    )}
                  </h1>
                  <p className={`${TYPOGRAPHY.body.responsive} text-brand-orange`}>
                    {slide.description}
                  </p>
                </div>
                <div className="lg:w-1/2 w-full">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="object-contain w-full lg:h-[500px] h-[300px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Enhanced Liquid Glass */}
        <button
          onClick={scrollPrev}
          className={`absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 z-20 
                    backdrop-blur-3xl bg-white/20 hover:bg-white/30
                    border border-white/30 ${RADIUS.circle}
                    p-2 lg:p-2.5
                    shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                    transition-all duration-300
                    hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]`}
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            background: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)',
          }}
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-brand-navy stroke-[2.5]" />
        </button>

        <button
          onClick={scrollNext}
          className={`absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 z-20 
                    backdrop-blur-3xl bg-white/20 hover:bg-white/30
                    border border-white/30 ${RADIUS.circle}
                    p-2 lg:p-2.5
                    shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                    transition-all duration-300
                    hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]`}
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            background: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)',
          }}
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-brand-navy stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

export default Hero;