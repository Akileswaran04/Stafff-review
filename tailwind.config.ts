import type { Config } from "tailwindcss";

// "Midnight Editorial" — flat colours only: ink-navy ground, ivory type, one brass accent.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#12131A", // page
        panel: "#1C1E29", // cards
        rule: "#2A2C38", // dividers / borders
        dim: "#3A3C4A", // inactive dots, ghost shapes
        cream: "#F5F1E8", // headline text (warm ivory)
        gold: "#D4A574", // brass: script, active states, rating dots
        mute: "#8B8D9A", // secondary text
        clay: "#E07A5F", // errors only
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"], // Anton
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"], // Archivo
        script: ["var(--font-script)", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: { id: "0.05em" },
      keyframes: {
        "ring-pulse": {
          "0%,100%": { boxShadow: "0 0 0 1px rgb(212 165 116 / 0.22)" },
          "50%": { boxShadow: "0 0 0 1px rgb(212 165 116 / 0.75)" },
        },
        breathe: {
          "0%,100%": { transform: "scale(0.85)", opacity: "0.4" },
          "50%": { transform: "scale(1.15)", opacity: "0.9" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "ring-pulse": "ring-pulse 3s ease-in-out infinite",
        breathe: "breathe 4.5s ease-in-out infinite",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
