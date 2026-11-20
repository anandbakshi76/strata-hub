import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";

// The Content Security Policy goes into the built page only, because the dev server injects
// inline styles. Only the site's own files load, and forms can't send anywhere (rule 4).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

const contentSecurityPolicy = (): Plugin => ({
  name: "content-security-policy",
  apply: "build",
  transformIndexHtml: (html) =>
    html.replace(
      '<meta charset="utf-8" />',
      `<meta charset="utf-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    ),
});

export default defineConfig({
  root: "web",
  plugins: [contentSecurityPolicy()],
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
