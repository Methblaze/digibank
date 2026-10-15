import type { Config } from "tailwindcss";

// Digi Bank 2026 tokens. The blues grow out of the 2019 palette
// (#23293E, #022C43, #5C7BEA); gold is the original piggy bank.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#0A0F24", 900: "#0A0F24", 800: "#111836", 700: "#1A2350", 600: "#26306A" },
        ink: "#F3F6FF",
        mist: "#B4BEE4",
        periwinkle: { DEFAULT: "#7C93FF", deep: "#5C7BEA" },
        piggy: { DEFAULT: "#FFC53D", deep: "#E8A317", shadow: "#B87A00" },
        mint: "#4BE3A3",
        coral: "#FF8A7A",
        ice: "#A8ECFF",
        leather: { DEFAULT: "#F07A3C", deep: "#C4551F" },
      },
      fontFamily: {
        display: ['"Fredoka Variable"', "system-ui", "sans-serif"],
        sans: ['"Nunito Variable"', "system-ui", "sans-serif"],
      },
      borderRadius: { clay: "1.75rem" },
      boxShadow: {
        clay: "inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -6px 12px rgba(0,0,0,0.25), 0 10px 30px rgba(3,6,20,0.55)",
        "clay-sm": "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -3px 6px rgba(0,0,0,0.25), 0 4px 14px rgba(3,6,20,0.45)",
        press: "inset 0 3px 8px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
