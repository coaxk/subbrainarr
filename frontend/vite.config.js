import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5918, // Changed from 3000
    proxy: {
      "/api": {
        target: "http://localhost:9918", // Changed from 9001
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:9918", // Changed from 9001
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
