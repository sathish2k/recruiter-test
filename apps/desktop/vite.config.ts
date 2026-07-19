import { defineConfig } from "vite";

// Tauri expects a fixed dev port and ignores vite's HMR websocket on 1421.
export default defineConfig({
  clearScreen: false,
  server: {
    port: 3003,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    target: "esnext",
    emptyOutDir: true,
  },
});
