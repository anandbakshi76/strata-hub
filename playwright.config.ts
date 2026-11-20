import { defineConfig } from "@playwright/test";

// Tests run against the production build (vite preview), which is steadier than the dev server
// and is what visitors get. Uses the Chrome installed on this machine, so no browser download.
export default defineConfig({
  testDir: "e2e",
  reporter: "list",
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:4173",
    channel: "chrome",
    // Headless Chrome needs software WebGL (SwiftShader) turned on for the 3D tests.
    launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] },
  },
  // Chrome runs every test; Edge runs the page and security checks too (SPEC 12). Firefox and
  // Safari (WebKit) need browser downloads, so they are checked by hand at release.
  projects: [
    { name: "chrome", use: { channel: "chrome" } },
    { name: "edge", use: { channel: "msedge" }, testMatch: /(smoke|seo).spec.ts/ },
  ],
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
});
