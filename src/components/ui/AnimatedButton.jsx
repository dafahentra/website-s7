import React from "react";
import { TYPOGRAPHY, RADIUS, SHADOWS } from "../../styles/designSystem";

const AnimatedButton = ({
  children,
  className = "",
  onClick,
  href,
  target,
  rel,
  variant = "filled", // "filled" | "outline"
  icon,
  ...props
}) => {
  const paddingClasses = variant === "outline"
    ? "px-6 py-2 sm:px-8 sm:py-2.5"
    : "px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4";

  const baseClasses = `group relative flex items-center justify-center overflow-hidden ${paddingClasses} ${RADIUS.circle} ${SHADOWS.card.small} transition-shadow hover:${SHADOWS.card.medium} ${className}`;

  const filledContent = (
    <>
      {/* BULATAN - hidden di mobile */}
      <span
        className="absolute left-5 top-1/2 z-0 h-2 w-2 -translate-y-1/2 rounded-full bg-white transition-transform duration-700 ease-in-out hidden md:block md:group-hover:scale-[150]"
        style={{ transformOrigin: "center" }}
      />
      {/* TEKS */}
      <span
        className={`relative z-10 whitespace-nowrap text-white ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.small} sm:${TYPOGRAPHY.body.regular} tracking-wide transition-all duration-500 ease-in-out md:group-hover:-translate-x-3 md:group-hover:text-brand-navy`}
      >
        {children}
      </span>
      {/* PANAH */}
      <svg
        className="absolute right-6 z-10 h-5 w-5 translate-x-4 text-brand-navy opacity-0 transition-all duration-500 ease-out md:group-hover:translate-x-0 md:group-hover:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </>
  );

  const outlineContent = (
    <>
      {/* BULATAN - invisible saat diam, expand saat hover, desktop only */}
      <span
        className="absolute left-5 top-1/2 z-0 h-2 w-2 -translate-y-1/2 rounded-full bg-brand-navy opacity-0 transition-all duration-700 ease-in-out hidden md:block md:group-hover:opacity-100 md:group-hover:scale-[150]"
        style={{ transformOrigin: "center" }}
      />

      {/* ICON + TEKS - bergerak bersama ke kiri saat hover */}
      <span className="relative z-10 flex items-center gap-1 sm:gap-2 transition-all duration-500 ease-in-out md:group-hover:-translate-x-3">
        {icon && (
          <span className="flex items-center transition-all duration-500 md:group-hover:brightness-0 md:group-hover:invert">
            {icon}
          </span>
        )}
        <span
          className={`whitespace-nowrap text-brand-navy ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.small} sm:${TYPOGRAPHY.body.regular} lg:${TYPOGRAPHY.body.default} tracking-wide transition-colors duration-500 ease-in-out md:group-hover:text-white`}
        >
          {children}
        </span>
      </span>

      {/* PANAH - muncul dari kanan */}
      <svg
        className="absolute right-4 sm:right-5 z-10 h-4 w-4 sm:h-5 sm:w-5 translate-x-4 text-white opacity-0 transition-all duration-500 ease-out md:group-hover:translate-x-0 md:group-hover:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </>
  );

  const content = variant === "outline" ? outlineContent : filledContent;

  const variantClasses =
    variant === "outline"
      ? "border-2 border-brand-navy bg-transparent"
      : "bg-brand-navy";

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`${baseClasses} ${variantClasses}`}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      {...props}
    >
      {content}
    </button>
  );
};

export default AnimatedButton;