import type { Config } from "tailwindcss";
import tokens from "./tokens/build/tailwind.js";

// Digi Bank 2026. Colours, radius, shadows and fonts come from the design
// tokens in tokens/ (run npm run tokens:build after changing them); Figma
// uses the same tokens. The blues grow out of the 2019 palette (#23293E,
// #022C43, #5C7BEA); gold is the original piggy bank.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
    },
  },
  plugins: [],
} satisfies Config;
