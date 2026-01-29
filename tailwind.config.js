/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom Colors - Sector Seven Brand
      colors: {
        brand: {
          navy: '#1d3866',      // Primary Blue
          orange: '#f39248',    // Primary Orange
          green: '#6b8e4e',     // Values Green
          purple: '#9b4d96',    // Values Purple
          blue: '#5dade2',      // Values Blue
          cream: '#f8f9f5',     // Background Cream
          'footer-green': '#1e4a3c', // Footer dark green
          'nav-mobile': '#ebe9e7',   // Mobile navbar background
        },
      },
      
      // Custom Font Sizes - Standardized
      fontSize: {
        // Hero & Display
        'hero': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],        // 64px - Desktop Hero
        'hero-mobile': ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }], // 40px - Mobile Hero
        
        // Page Headings (h2)
        'heading-xl': ['3.75rem', { lineHeight: '1.2', fontWeight: '700' }], // 60px - Desktop
        'heading-lg': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],    // 48px - Tablet
        'heading-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }], // 36px - Mobile
        
        // Section Headings (h3)
        'subheading-xl': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],   // 32px
        'subheading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }], // 24px
        'subheading-md': ['1.25rem', { lineHeight: '1.3', fontWeight: '700' }], // 20px
        
        // Body Text
        'body-xl': ['1.25rem', { lineHeight: '1.7' }],  // 20px - Large body
        'body-lg': ['1.125rem', { lineHeight: '1.7' }], // 18px - Default body
        'body-md': ['1rem', { lineHeight: '1.6' }],     // 16px - Regular
        'body-sm': ['0.875rem', { lineHeight: '1.6' }], // 14px - Small
      },
      
      // Custom Spacing - Standardized
      spacing: {
        'section': '5rem',      // 80px - Section padding desktop
        'section-md': '4rem',   // 64px - Section padding tablet
        'section-sm': '3rem',   // 48px - Section padding mobile
        'element': '3rem',      // 48px - Element margin desktop
        'element-md': '2rem',   // 32px - Element margin tablet
        'element-sm': '1.5rem', // 24px - Element margin mobile
      },
      
      // Custom Border Radius - Standardized
      borderRadius: {
        'card': '1rem',          // 16px - Cards & Components
        'card-lg': '1.5rem',     // 24px - Large Cards (desktop)
        'image': '1.5rem',       // 24px - Images
        'image-lg': '2rem',      // 32px - Hero Images (desktop)
      },
      
      // Custom Box Shadows - Standardized
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'image': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'image-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      
      // Background Images
      backgroundImage: {
        promo: "url('/src/assets/promo.png')",
      },
      
      // Custom Animations
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
});
