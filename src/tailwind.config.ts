import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "rose-framboise": "#e8547a",
        "rose-lait":      "#f9a8c0",
        "rose-deep":      "#c23a5e",
        "bg-pure":        "#0a0a0a",
        "bg-surface":     "#111111",
        "bg-card":        "#161616",
        "bg-elevated":    "#1c1c1c",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "scale-in":   "scaleIn 0.3s ease forwards",
        "spin":       "spin 1s linear infinite",
        "pulse-slow": "ambientPulse 8s ease-in-out infinite",
      },
      boxShadow: {
        "glow-rose":  "0 0 40px #e8547a30, 0 0 80px #e8547a10",
        "glow-card":  "0 0 0 1px #e8547a25, 0 0 30px #e8547a15",
        "deep":       "0 25px 50px -12px rgba(0,0,0,0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
