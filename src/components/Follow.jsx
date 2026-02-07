// components/Follow.jsx - REFACTORED WITH BETTER MOBILE RESPONSIVENESS
import React from "react";
import instagram from "../assets/instagram.png";
import post1 from "../assets/post 1.jpg";
import post2 from "../assets/post 2.jpg";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../styles/designSystem";

const instagramPosts = [
  {
    id: 1,
    postUrl: "https://www.instagram.com/reel/DTmfu_Xk2os/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    imageUrl: post2
  },
  {
    id: 2,
    postUrl: "https://www.instagram.com/p/DTkGm_Pkxvk/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    imageUrl: post1
  },
];

const Follow = () => {
  return (
    <div className="max-w-[1200px] mx-auto py-12 sm:py-16 lg:py-20">
      <div className="flex justify-center items-center flex-col mb-8 sm:mb-10 lg:mb-12 px-4">
        {/* Tagline */}
        <h1 className={`${TYPOGRAPHY.subheading.mobile} sm:${TYPOGRAPHY.subheading.tablet} ${TYPOGRAPHY.weight.semibold} text-brand-orange mb-3 sm:mb-4 lg:mb-6 text-center`}>
          See what's brewing online!
        </h1>
        
        {/* Instagram Handle - Responsive sizing */}
        <span className={`${TYPOGRAPHY.subheading.tablet} sm:${TYPOGRAPHY.heading.mobile} md:${TYPOGRAPHY.heading.tablet} ${TYPOGRAPHY.weight.bold} text-brand-navy mb-4 sm:mb-5 lg:mb-6 text-center`}>
          @sectorseven.yk
        </span>
        
        {/* Follow Button */}
        <a
          href="https://www.instagram.com/sectorseven.yk/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex text-brand-navy md:hover:bg-brand-navy md:hover:text-white md:${TRANSITIONS.hover.color} border-2 border-brand-navy py-2 px-4 sm:py-2.5 sm:px-5 ${RADIUS.circle} w-36 sm:w-40 lg:w-44 ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.small} sm:${TYPOGRAPHY.body.regular} lg:${TYPOGRAPHY.body.default} items-center justify-center gap-1 sm:gap-2 group`}
        >
          <img 
            src={instagram} 
            alt="instagram" 
            className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
          />
          <span>Follow</span>
        </a>
      </div>

      {/* Instagram Feed Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-1 mx-4 max-w-4xl md:mx-auto">
        {instagramPosts.map((post) => (
          <a
            key={post.id}
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group overflow-hidden bg-gray-100"
            style={{ aspectRatio: '4/5' }}
          >
            {/* Image */}
            <img
              src={post.imageUrl}
              alt="Instagram post"
              className="w-full h-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-110"
              loading="lazy"
            />
            
            {/* White overlay with hover animation - Desktop only */}
            <div className={`absolute inset-0 bg-white opacity-0 md:group-hover:opacity-30 md:${TRANSITIONS.fast}`}></div>

            {/* Instagram Icon - appears on hover - Desktop only */}
            <div className={`absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 md:${TRANSITIONS.fast}`}>
              <div className={`bg-white/95 backdrop-blur-sm ${RADIUS.circle} p-3 sm:p-4 transform scale-0 md:group-hover:scale-100 md:${TRANSITIONS.fast}`}>
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-brand-navy" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Follow);