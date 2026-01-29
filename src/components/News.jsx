// components/News.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { newsData } from "../data/newsData";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../styles/designSystem";

const ArrowRight = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const News = () => {
  const latestNews = useMemo(() => 
    newsData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4),
    []
  );

  return (
    <div className="max-w-[1200px] mx-auto my-20 md:my-40">
      {/* Header Section */}
      <div className="flex flex-col justify-between md:flex-row md:items-center relative mx-4 md:text-left text-center mb-8 md:mb-0">
        <h1 className={`${TYPOGRAPHY.heading.tablet} md:${TYPOGRAPHY.heading.responsive} text-brand-navy mb-4 ${TYPOGRAPHY.weight.bold}`}>
          Sector News
        </h1>
        <p className={`${TYPOGRAPHY.body.default} md:${TYPOGRAPHY.subheading.tablet} text-brand-orange text-wrap tracking-tight`}>
          Dapatkan berita terbaru dan informasi <br className="hidden md:block" /> menarik dari kami!
        </p>
      </div>

      {/* News Grid - Desktop, Horizontal Scroll - Mobile */}
      <div className="my-12 md:my-20">
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto px-4 pb-4 -mx-4">
          <div className={`flex gap-3 ${latestNews.length < 3 ? 'justify-center' : 'w-max'}`}>
            {latestNews.map((data) => (
              <Link
                to={`/news/${data.slug}`}
                key={data.id}
                className={`w-[176px] ${RADIUS.card.default} overflow-hidden ${SHADOWS.card.small} bg-white ${TRANSITIONS.fast} hover:shadow-card-lg flex-shrink-0`}
              >
                <div className="relative overflow-hidden h-24">
                  <img
                    className="object-cover h-full w-full"
                    src={data.img}
                    alt={data.tittle}
                    loading="lazy"
                  />
                </div>
                <div className="p-2.5">
                  <div className={`${TYPOGRAPHY.body.small} ${TYPOGRAPHY.weight.semibold} mb-1 capitalize text-gray-800 line-clamp-2`}>
                    {data.tittle.toLowerCase()}
                  </div>
                  <p className={`text-gray-500 ${TYPOGRAPHY.body.small} mb-2 line-clamp-2`} style={{ fontSize: '10px' }}>
                    {data.excerpt}
                  </p>
                  <p className="text-gray-400 italic text-[9px]">
                    {new Date(data.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid lg:grid-cols-4 md:grid-cols-3 place-items-center gap-4 mx-4">
          {latestNews.map((data) => (
            <Link
              to={`/news/${data.slug}`}
              key={data.id}
              className={`max-w-sm ${RADIUS.card.responsive} overflow-hidden ${SHADOWS.card.responsive} bg-white transition-all duration-500 hover:shadow-[0_0_30px_rgba(243,146,72,0.3)] h-full group`}
            >
              <div className="relative overflow-hidden h-52">
                <img
                  className="object-cover h-full w-full"
                  src={data.img}
                  alt={data.tittle}
                  loading="lazy"
                />
                <div className="absolute top-4 right-4">
                  <span className={`bg-brand-orange text-white px-3 py-1 ${RADIUS.circle} ${TYPOGRAPHY.body.small} ${TYPOGRAPHY.weight.medium}`}>
                    {data.category}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className={`${TYPOGRAPHY.subheading.lg} ${TYPOGRAPHY.weight.semibold} mb-2 capitalize text-gray-700 line-clamp-2`}>
                  {data.tittle.toLowerCase()}
                </div>
                <p className={`text-gray-500 mt-4 ${TYPOGRAPHY.body.small} line-clamp-3`}>
                  {data.excerpt}
                </p>
                <div className={`flex items-center text-brand-orange mt-4 ${TYPOGRAPHY.weight.medium} ${TRANSITIONS.fast} group-hover:gap-2`}>
                  <span className={TYPOGRAPHY.body.small}>Baca Selengkapnya</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <hr />
              <div className="px-6 pt-2 pb-4">
                <p className={`text-gray-500 italic tracking-wide ${TYPOGRAPHY.body.small}`}>
                  {new Date(data.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Button "Selengkapnya" */}
      <div className="flex justify-center px-4">
        <Link
          to="/news"
          className={`mt-4 bg-brand-navy px-8 py-4 ${RADIUS.circle} w-[200px] text-white hover:border-brand-navy hover:bg-white hover:text-brand-navy ${TRANSITIONS.hover.color} ${TYPOGRAPHY.body.regular} shadow-card-lg md:${SHADOWS.image.responsive} border-2 border-brand-navy text-center ${TYPOGRAPHY.weight.medium}`}
        >
          Selengkapnya
        </Link>
      </div>
    </div>
  );
};

export default React.memo(News);
