import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "web",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // The 3D chunk (Three.js and GSAP) is about 655 kB minified, 180 kB compressed. It loads only
    // after the page is readable, and stays inside the SPEC 10 budget of 600 kB compressed.
    chunkSizeWarningLimit: 700,
  },
  server: { port: 5173, strictPort: true },
  test: {
    root: ".",
    include: ["web/**/*.test.ts"],
    environment: "node",
  },
});
