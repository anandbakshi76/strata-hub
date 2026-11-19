import { defineConfig } from "@playwright/test";

// Tests run against the production build (vite preview), which is steadier than the dev server
// and is what visitors get. Uses the Chrome installed on this machine, so no browser download.
export default defineConfig({
  testDir: "e2e",
  reporter: "list",
  timeout: 60_000,
  use: { baseURL: "http://localhost:4173", channel: "chrome" },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
});
