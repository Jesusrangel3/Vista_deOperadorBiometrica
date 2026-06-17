/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        holo: {
          DEFAULT: "#22d3ee",
          dim: "#0e7490",
        },
        panel: "#0d1320",
        deep: "#070b12",
      },
      boxShadow: {
        holo: "0 0 24px -6px rgba(34,211,238,0.45)",
        panel: "0 1px 0 0 rgba(148,163,184,0.06) inset, 0 0 0 1px rgba(148,163,184,0.06)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        scan: "scan 4s linear infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
