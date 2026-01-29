// components/Promo.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import promo1 from "../assets/promo1.jpg";
import promo2 from "../assets/promo2.jpg";
import promo3 from "../assets/promo3.jpg";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../styles/designSystem";

const Promo = () => {
  return (
    <div className={`max-w-[1200px] mx-auto my-20 bg-center bg-cover bg-promo ${RADIUS.image.responsive}`}>
      {/* Header Section */}
      <div className="flex items-center flex-col py-12 md:py-16 mx-4 text-center">
        <h1 className={`${TYPOGRAPHY.heading.tablet} md:${TYPOGRAPHY.heading.responsive} text-brand-navy ${TYPOGRAPHY.weight.semibold}`}>
          Discover Our Promo
        </h1>
        <h2 className={`text-brand-orange ${TYPOGRAPHY.body.default} md:${TYPOGRAPHY.subheading.desktop} mt-4`}>
          Temukan berbagai promo menarik di sini!
        </h2>
      </div>

      {/* Promo Cards - Desktop Grid, Mobile Horizontal Scroll */}
      <div className="pb-12 md:pb-20">
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto px-4 pb-4">
          <div className="flex gap-3 w-max">
            <div className={`${RADIUS.card.default} w-[160px] overflow-hidden ${SHADOWS.card.small} flex-shrink-0`}>
              <img src={promo1} alt="promo1" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className={`${RADIUS.card.default} w-[160px] overflow-hidden ${SHADOWS.card.small} flex-shrink-0`}>
              <img src={promo2} alt="promo2" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className={`${RADIUS.card.default} w-[160px] overflow-hidden ${SHADOWS.card.small} flex-shrink-0`}>
              <img src={promo3} alt="promo3" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid lg:grid-cols-3 md:grid-cols-2 gap-8 place-items-center px-10 mx-4">
          <div className={`${RADIUS.image.responsive} max-w-md overflow-hidden ${SHADOWS.card.responsive} ${TRANSITIONS.hover.scale}`}>
            <img src={promo1} alt="promo1" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className={`${RADIUS.image.responsive} max-w-md overflow-hidden ${SHADOWS.card.responsive} ${TRANSITIONS.hover.scale}`}>
            <img src={promo2} alt="promo2" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className={`${RADIUS.image.responsive} max-w-md overflow-hidden ${SHADOWS.card.responsive} ${TRANSITIONS.hover.scale}`}>
            <img src={promo3} alt="promo3" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Promo);
