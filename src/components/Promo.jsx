import React from "react";
import promo1 from "../assets/promo1.jpg";
import promo2 from "../assets/promo2.jpg";
import promo3 from "../assets/promo3.jpg";

const Promo = () => {
  return (
    <div className="max-w-[1200px] mx-auto my-20 bg-center bg-cover bg-promo rounded-3xl">
      {/* Header Section */}
      <div className="flex items-center flex-col py-12 md:py-16 mx-4 text-center">
        <h1 className="text-4xl md:text-6xl text-[#1d3866] font-semibold">
          Discover Our Promo
        </h1>
        <h2 className="text-[#f39248] text-lg md:text-3xl mt-4">
          Temukan berbagai promo menarik di sini!
        </h2>
      </div>

      {/* Promo Cards - Desktop Grid, Mobile Horizontal Scroll */}
      <div className="pb-12 md:pb-20">
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto px-4 pb-4">
          <div className="flex gap-3 w-max">
            <div className="rounded-xl w-[200px] overflow-hidden shadow-md flex-shrink-0">
              <img src={promo1} alt="promo1" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl w-[200px] overflow-hidden shadow-md flex-shrink-0">
              <img src={promo2} alt="promo2" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl w-[200px] overflow-hidden shadow-md flex-shrink-0">
              <img src={promo3} alt="promo3" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid lg:grid-cols-3 md:grid-cols-2 gap-8 place-items-center px-10 mx-4">
          <div className="rounded-3xl max-w-md overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img src={promo1} alt="promo1" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-3xl max-w-md overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img src={promo2} alt="promo2" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-3xl max-w-md overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img src={promo3} alt="promo3" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promo;