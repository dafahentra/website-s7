/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:   "#1d3866",
          orange: "#f39248",
          green:  "#6b8e4e",
          purple: "#9b4d96",
          blue:   "#5dade2",
          cream:  "#f8f9f5",
          "footer-green": "#1e4a3c",
          "nav-mobile":   "#ebe9e7",
        },
      },

      fontSize: {
        "hero":         ["4rem",    { lineHeight: "1.1", fontWeight: "700" }],
        "hero-mobile":  ["2.5rem",  { lineHeight: "1.1", fontWeight: "700" }],

        "heading-xl":   ["3.75rem", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-lg":   ["3rem",    { lineHeight: "1.2", fontWeight: "700" }],
        "heading-md":   ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],

        "subheading-xl": ["2rem",    { lineHeight: "1.3", fontWeight: "700" }],
        "subheading-lg": ["1.5rem",  { lineHeight: "1.3", fontWeight: "700" }],
        "subheading-md": ["1.25rem", { lineHeight: "1.3", fontWeight: "700" }],

        "body-xl": ["1.25rem",  { lineHeight: "1.7" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        "body-md": ["1rem",     { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
      },

      spacing: {
        "section":    "5rem",
        "section-md": "4rem",
        "section-sm": "3rem",
        "element":    "3rem",
        "element-md": "2rem",
        "element-sm": "1.5rem",
      },

      borderRadius: {
        "card":     "1rem",
        "card-lg":  "1.5rem",
        "image":    "1.5rem",
        "image-lg": "2rem",
      },

      boxShadow: {
        "card":    "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        "card-lg": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        "card-xl": "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        "image":   "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        "image-xl":"0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
      },

      backgroundImage: {
        // Promo background ditangani via Vite asset import di komponen — bukan path statis
      },

      animation: {
        "fade-in":       "fadeIn 0.6s ease-out",
        "slide-up":      "slideUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.8s ease-out",
        "slide-in-right":"slideInRight 0.8s ease-out",
      },

      keyframes: {
        fadeIn:       { "0%": { opacity: "0" },                                          "100%": { opacity: "1" } },
        slideUp:      { "0%": { opacity: "0", transform: "translateY(30px)" },           "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInLeft:  { "0%": { opacity: "0", transform: "translateX(-50px)" },          "100%": { opacity: "1", transform: "translateX(0)" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(50px)" },           "100%": { opacity: "1", transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};