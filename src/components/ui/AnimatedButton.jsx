import React from "react";
import { TYPOGRAPHY, RADIUS, SHADOWS } from "../../styles/designSystem";

const AnimatedButton = ({ children, className = "", onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center overflow-hidden bg-brand-navy px-8 py-4 min-w-[160px] ${RADIUS.circle} ${SHADOWS.card.small} transition-shadow hover:${SHADOWS.card.medium} ${className}`}
      {...props}
    >
      {/* BULATAN - posisi kiri, terlihat jelas karena bg-white di atas navy */}
      <span
        className="absolute left-5 top-1/2 z-0 h-2 w-2 -translate-y-1/2 rounded-full bg-white transition-transform duration-700 ease-in-out md:group-hover:scale-[150]"
        style={{ transformOrigin: "center" }}
      />

      {/* TEKS */}
      <span
        className={`relative z-10 whitespace-nowrap text-white ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.regular} tracking-wide transition-all duration-500 ease-in-out md:group-hover:-translate-x-3 md:group-hover:text-brand-navy`}
      >
        {children}
      </span>

      {/* PANAH - absolute, muncul dari kanan teks saat hover */}
      <svg
        className="absolute right-6 z-10 h-5 w-5 translate-x-4 text-brand-navy opacity-0 transition-all duration-500 ease-out md:group-hover:translate-x-0 md:group-hover:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  );
};

export default AnimatedButton;