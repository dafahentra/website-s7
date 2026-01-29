// src/styles/designSystem.js
/**
 * SECTOR SEVEN DESIGN SYSTEM
 * Single source of truth for all design tokens and utilities
 * 
 * Usage:
 * import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '@/styles/designSystem';
 */

// ============================================
// COLORS - Brand Color Palette
// ============================================
export const COLORS = {
  // Primary Colors
  primary: {
    navy: '#1d3866',
    orange: '#f39248',
  },
  
  // Secondary Colors (Values Section)
  secondary: {
    green: '#6b8e4e',
    purple: '#9b4d96',
    blue: '#5dade2',
  },
  
  // Footer/Contact Colors
  footer: {
    green: '#1e4a3c', // Dark green used in footer
  },
  
  // Navbar Colors
  navbar: {
    mobileBg: '#ebe9e7', // Mobile menu background - light cream
  },
  
  // Neutral Colors
  neutral: {
    cream: '#f8f9f5',
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  
  // Gradient Overlays
  overlays: {
    darkToRight: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
    darkToBottom: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8))',
    brandOrange: 'linear-gradient(135deg, #f39248 0%, #e67e22 100%)',
    contactInfo: 'linear-gradient(to bottom right, #3962a8, #f0a97a)', // Contact info box gradient
  },
};

// ============================================
// TYPOGRAPHY - Font Sizes & Weights
// ============================================
export const TYPOGRAPHY = {
  // Hero & Display Text
  hero: {
    desktop: 'text-hero',        // 64px
    mobile: 'text-hero-mobile',  // 40px
    responsive: 'text-hero-mobile lg:text-hero',
  },
  
  // Page Headings (h2)
  heading: {
    desktop: 'text-heading-xl',  // 60px
    tablet: 'text-heading-lg',   // 48px
    mobile: 'text-heading-md',   // 36px
    responsive: 'text-heading-md md:text-heading-lg lg:text-heading-xl',
  },
  
  // Section Headings (h3)
  subheading: {
    desktop: 'text-subheading-xl',  // 32px
    tablet: 'text-subheading-lg',   // 24px
    mobile: 'text-subheading-md',   // 20px
    responsive: 'text-subheading-md md:text-subheading-lg lg:text-subheading-xl',
  },
  
  // Body Text
  body: {
    large: 'text-body-xl',        // 20px
    default: 'text-body-lg',      // 18px
    regular: 'text-body-md',      // 16px
    small: 'text-body-sm',        // 14px
    responsive: 'text-body-md lg:text-body-lg',
  },
  
  // Font Weights
  weight: {
    bold: 'font-bold',           // 700
    semibold: 'font-semibold',   // 600
    medium: 'font-medium',       // 500
    regular: 'font-normal',      // 400
    light: 'font-light',         // 300
  },
};

// ============================================
// SPACING - Margins & Paddings
// ============================================
export const SPACING = {
  // Section Spacing
  section: {
    desktop: 'py-section',          // 80px
    tablet: 'py-section-md',        // 64px
    mobile: 'py-section-sm',        // 48px
    responsive: 'py-section-sm md:py-section-md lg:py-section',
  },
  
  // Element Spacing
  element: {
    desktop: 'mb-element',          // 48px
    tablet: 'mb-element-md',        // 32px
    mobile: 'mb-element-sm',        // 24px
    responsive: 'mb-element-sm md:mb-element-md lg:mb-element',
  },
  
  // Container
  container: {
    maxWidth: 'max-w-[1200px]',
    padding: 'px-4',
    centered: 'max-w-[1200px] mx-auto px-4',
  },
};

// ============================================
// BORDER RADIUS - Rounded Corners
// ============================================
export const RADIUS = {
  // Cards & Components
  card: {
    default: 'rounded-card',        // 16px
    large: 'rounded-card-lg',       // 24px
    responsive: 'rounded-card lg:rounded-card-lg',
  },
  
  // Images
  image: {
    default: 'rounded-image',       // 24px
    large: 'rounded-image-lg',      // 32px
    responsive: 'rounded-image lg:rounded-image-lg',
  },
  
  // Special
  circle: 'rounded-full',
};

// ============================================
// SHADOWS - Box Shadows
// ============================================
export const SHADOWS = {
  card: {
    small: 'shadow-card',           // Subtle shadow
    medium: 'shadow-card-lg',       // Medium shadow
    large: 'shadow-card-xl',        // Large shadow
    responsive: 'shadow-card lg:shadow-card-lg',
  },
  
  image: {
    default: 'shadow-image',
    large: 'shadow-image-xl',
    responsive: 'shadow-image lg:shadow-image-xl',
  },
  
  none: 'shadow-none',
};

// ============================================
// TRANSITIONS - Animation Durations
// ============================================
export const TRANSITIONS = {
  fast: 'transition-all duration-300 ease-out',
  normal: 'transition-all duration-500 ease-out',
  slow: 'transition-all duration-700 ease-out',
  
  // Hover States
  hover: {
    scale: 'transition-transform duration-300 hover:scale-105',
    opacity: 'transition-opacity duration-300 hover:opacity-80',
    color: 'transition-colors duration-300',
  },
};

// ============================================
// UTILITIES - Common Class Combinations
// ============================================
export const UTILITIES = {
  // Flex Utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  
  // Grid Utilities
  gridCols2: 'grid md:grid-cols-2 gap-8',
  gridCols3: 'grid md:grid-cols-3 gap-8',
  gridCols4: 'grid md:grid-cols-2 lg:grid-cols-4 gap-8',
  
  // Text Utilities
  textCenter: 'text-center',
  textGradient: 'bg-gradient-to-r from-brand-orange to-brand-navy bg-clip-text text-transparent',
  
  // Visibility
  hiddenMobile: 'hidden md:block',
  hiddenDesktop: 'block md:hidden',
  
  // Aspect Ratios
  aspectSquare: 'aspect-square',
  aspectVideo: 'aspect-video',
  
  // Object Fit
  objectCover: 'object-cover',
  objectContain: 'object-contain',
};

// ============================================
// COMPONENT PRESETS - Ready-to-use Combinations
// ============================================
export const PRESETS = {
  // Section Container
  section: `${SPACING.section.responsive} bg-white`,
  sectionAlt: `${SPACING.section.responsive} bg-brand-cream`,
  
  // Container
  container: SPACING.container.centered,
  
  // Page Heading
  pageHeading: `${TYPOGRAPHY.heading.responsive} ${TYPOGRAPHY.weight.bold} text-brand-navy ${SPACING.element.responsive} text-center`,
  
  // Section Heading
  sectionHeading: `${TYPOGRAPHY.subheading.responsive} ${TYPOGRAPHY.weight.bold} text-brand-orange ${SPACING.element.mobile}`,
  
  // Body Text
  bodyText: `${TYPOGRAPHY.body.responsive} text-gray-700 leading-relaxed`,
  
  // Card
  card: `${RADIUS.card.responsive} ${SHADOWS.card.responsive} bg-white p-6 lg:p-8`,
  
  // Image
  image: `${RADIUS.image.responsive} ${SHADOWS.image.responsive} w-full h-full ${UTILITIES.objectCover}`,
  
  // Button Primary
  buttonPrimary: `${RADIUS.card.default} bg-brand-navy text-white px-8 py-3 ${TYPOGRAPHY.weight.semibold} ${TRANSITIONS.hover.color} hover:bg-brand-orange`,
  
  // Button Outline
  buttonOutline: `${RADIUS.card.default} border-2 border-brand-navy text-brand-navy px-8 py-3 ${TYPOGRAPHY.weight.semibold} ${TRANSITIONS.hover.color} hover:bg-brand-navy hover:text-white`,
  
  // Contact Info Box
  contactInfoBox: `${RADIUS.image.responsive} p-6 md:p-8 lg:p-12 text-white ${SHADOWS.image.responsive} relative overflow-hidden h-full flex flex-col justify-between`,
  
  // Form Container
  formContainer: `bg-white ${RADIUS.image.responsive} ${SHADOWS.image.responsive} p-5 md:p-8 lg:p-12`,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combine multiple class strings
 * @param {...string} classes - Class strings to combine
 * @returns {string} Combined class string
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get responsive spacing classes
 * @param {'section'|'element'} type - Type of spacing
 * @returns {string} Responsive spacing classes
 */
export const getResponsiveSpacing = (type = 'section') => {
  return SPACING[type].responsive;
};

/**
 * Get brand color value
 * @param {'navy'|'orange'|'green'|'purple'|'blue'} color - Color name
 * @returns {string} Hex color value
 */
export const getBrandColor = (color) => {
  if (COLORS.primary[color]) return COLORS.primary[color];
  if (COLORS.secondary[color]) return COLORS.secondary[color];
  return COLORS.primary.navy; // fallback
};

// Export all for easy import
export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  TRANSITIONS,
  UTILITIES,
  PRESETS,
  cn,
  getResponsiveSpacing,
  getBrandColor,
};
