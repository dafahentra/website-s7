// components/Promo.jsx
import React from "react";
import promo1      from "../assets/promo1.jpg";
import promoBg     from "../assets/promo.png";
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from "../styles/designSystem";

const Promo = () => {
  const promos = [
    {
      id: 1,
      image: promo1,
      alt: "promo1",
      promoCode: "DEPON50",
      lineCoupon: "https://lin.ee/Ey3cVyt",
    },
  ];

  const handleClaim = (promo) => {
    if (promo.promoCode) {
      window.location.href = `/menu?promo=${encodeURIComponent(promo.promoCode)}`;
    } else if (promo.lineCoupon) {
      window.open(promo.lineCoupon, "_blank", "noopener,noreferrer");
    }
  };

  const PromoCard = ({ promo, className = "" }) => (
    <div
      className={`${RADIUS.image.responsive} overflow-hidden ${SHADOWS.card.responsive} relative block group ${className}`}
    >
      <div className="aspect-square relative">
        <img
          src={promo.image}
          alt={promo.alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] z-20">
          <button
            onClick={() => handleClaim(promo)}
            className={`
              block w-full px-6 md:px-12 py-2.5 md:py-3
              bg-brand-navy/60 text-white text-center
              rounded-full ${SHADOWS.card.medium}
              ${TYPOGRAPHY.body.small} md:${TYPOGRAPHY.body.regular} font-semibold
              md:transition-all md:duration-300
              md:group-hover:bg-brand-orange md:group-hover:opacity-100
              cursor-pointer
            `}
          >
            {promo.promoCode ? "Klaim Diskon" : "Click to Claim"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`${SPACING.container.maxWidth} mx-auto my-20 bg-center bg-cover ${RADIUS.image.responsive}`}
      style={{ backgroundImage: `url(${promoBg})` }}
    >
      <div className={`flex items-center flex-col py-12 md:py-16 ${SPACING.container.padding} text-center`}>
        <h1 className={`${TYPOGRAPHY.heading.tablet} md:${TYPOGRAPHY.heading.responsive} text-brand-navy font-semibold`}>
          Discover Our Promo
        </h1>
        <h2 className={`text-brand-orange ${TYPOGRAPHY.body.default} md:${TYPOGRAPHY.subheading.desktop} mt-4`}>
          Find various interesting promotions here!
        </h2>
      </div>

      <div className="pb-12 md:pb-20">
        <div className={`md:hidden ${SPACING.container.padding} pb-4`}>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2 justify-center">
              {promos.map((promo) => (
                <PromoCard key={promo.id} promo={promo} className="w-[180px] flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>

        <div className={`hidden md:block ${SPACING.container.padding}`}>
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4 justify-center">
              {promos.map((promo) => (
                <PromoCard key={promo.id} promo={promo} className="w-[320px] flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Promo);