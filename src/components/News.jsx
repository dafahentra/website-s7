// ========================================
// 3. News.jsx - OPTIMIZED (Button width matched with Story.jsx)
// ========================================
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { newsData } from "../data/newsData";

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
  // ✅ OPTIMIZED: Memoize computation
  const latestNews = useMemo(() => 
    newsData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4),
    [] // Empty dependency karena newsData static
  );

  return (
    <div className="max-w-[1200px] mx-auto my-20 md:my-40">
      {/* Header Section */}
      <div className="flex flex-col justify-between md:flex-row md:items-center relative mx-4 md:text-left text-center mb-8 md:mb-0">
        <h1 className="text-4xl md:text-6xl text-[#1d3866] mb-4 font-bold">
          Sector News
        </h1>
        <p className="text-lg md:text-2xl text-[#f39248] text-wrap tracking-tight">
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
                className="w-[176px] rounded-lg overflow-hidden shadow-md bg-white transition-all duration-300 hover:shadow-lg flex-shrink-0"
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
                  <div className="text-xs font-semibold mb-1 capitalize text-gray-800 line-clamp-2">
                    {data.tittle.toLowerCase()}
                  </div>
                  <p className="text-gray-500 text-[10px] mb-2 line-clamp-2">
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
              className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white transition-all duration-500 hover:shadow-[0_0_30px_rgba(243,146,72,0.3)] h-full group"
            >
              <div className="relative overflow-hidden h-52">
                <img
                  className="object-cover h-full w-full"
                  src={data.img}
                  alt={data.tittle}
                  loading="lazy"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-[#f39248] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {data.category}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="text-xl font-semibold mb-2 capitalize text-gray-700 line-clamp-2">
                  {data.tittle.toLowerCase()}
                </div>
                <p className="text-gray-500 mt-4 text-sm line-clamp-3">
                  {data.excerpt}
                </p>
                <div className="flex items-center text-[#f39248] mt-4 font-medium group-hover:gap-2 transition-all">
                  <span className="text-sm">Baca Selengkapnya</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <hr />
              <div className="px-6 pt-2 pb-4">
                <p className="text-gray-500 italic tracking-wide text-sm">
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
          className="mt-4 bg-[#1d3866] px-8 py-4 rounded-full w-[200px] text-white hover:border-[#1d3866] hover:bg-white hover:text-[#1d3866] transition-colors duration-300 text-md shadow-lg md:shadow-2xl shadow-[#1d3866] border-2 border-[#1d3866] text-center font-medium"
        >
          Selengkapnya
        </Link>
      </div>
    </div>
  );
};

export default React.memo(News);