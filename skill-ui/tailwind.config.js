/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        acid: "#C8FF00",
        void: "#080808",
        slate: "#0F1117",
        panel: "#13151E",
        border: "#1E2130",
        muted: "#3A3F52",
        ghost: "#6B7280",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          from: { boxShadow: "0 0 8px #C8FF0033" },
          to: { boxShadow: "0 0 24px #C8FF0066" },
        },
      },
    },
  },
  plugins: [],
};