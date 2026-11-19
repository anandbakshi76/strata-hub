import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "web",
  build: { outDir: "../dist", emptyOutDir: true },
  server: { port: 5173, strictPort: true },
  test: {
    root: ".",
    include: ["web/**/*.test.ts"],
    environment: "node",
  },
});
