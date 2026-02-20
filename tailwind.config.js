/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body:    ["Inter", "sans-serif"],
      },
      colors: {
        gold:  "#f59e0b",
        dark:  "#0a0a0f",
        card:  "#111118",
        border:"#1e1e2e",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease-out both",
        "fade-in":    "fadeIn 0.5s ease-out both",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "count-up":   "countUp 0.3s ease-out both",
      },
      keyframes: {
        fadeUp:  { from:{ opacity:0, transform:"translateY(24px)" }, to:{ opacity:1, transform:"translateY(0)" } },
        fadeIn:  { from:{ opacity:0 }, to:{ opacity:1 } },
        countUp: { from:{ opacity:0, transform:"translateY(8px)" }, to:{ opacity:1, transform:"translateY(0)" } },
      },
    },
  },
  plugins: [],
};
