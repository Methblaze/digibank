import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Served from GitHub Pages at /digibank/. three.js reaches the browser only
// through the lazy piggy scene, so it stays out of the first load.
export default defineConfig({
  base: "/digibank/",
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1100 },
});
