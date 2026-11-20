import { defineConfig, devices } from "@playwright/test";

// Frame-rate measurement for acceptance test 4 (50 frames per second in the 3D section).
// Not part of `npm run check`: it measures, it doesn't pass or fail the build. Run with `npm run perf`.
export default defineConfig({
  testDir: "perf",
  reporter: "list",
  workers: 1,
  timeout: 120_000,
  use: {
    ...devices["Pixel 5"],
    baseURL: "http://localhost:4173",
    channel: "chrome",
    launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] },
  },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
});
