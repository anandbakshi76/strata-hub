// Renders the fallback stills from the 3D model itself (critique P2: the stills must match the
// model). Starts the dev server, renders the assembled and exploded hub, and saves WebP files with
// a transparent background to web/assets/stills/. Run with `npm run stills`.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { flushTraces, trace } from "../web/telemetry.ts";

const PORT = 5179;
const server = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], {
  shell: process.platform === "win32",
  stdio: "ignore",
});

const stills = [
  { file: "hub-assembled.webp", explode: 0, w: 520, h: 420 },
  { file: "hub-exploded.webp", explode: 1, w: 420, h: 600 },
];

try {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/render-still.html`)).ok) break;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
  });
  for (const s of stills) {
    await trace(
      "render.still",
      async () => {
        const page = await browser.newPage({ deviceScaleFactor: 2 });
        await page.goto(
          `http://localhost:${PORT}/render-still.html?explode=${s.explode}&w=${s.w}&h=${s.h}`,
        );
        await page.waitForFunction(() => document.title === "ready", null, { timeout: 30_000 });
        const dataUrl = await page.evaluate(() =>
          (document.querySelector("canvas") as HTMLCanvasElement).toDataURL("image/webp", 0.88),
        );
        const bytes = Buffer.from(dataUrl.split(",")[1] ?? "", "base64");
        writeFileSync(`web/assets/stills/${s.file}`, bytes);
        console.log(`${s.file}: ${Math.round(bytes.length / 1024)} KB`);
        await page.close();
      },
      { file: s.file },
    );
  }
  await browser.close();
} finally {
  server.kill();
  await flushTraces();
}
process.exit(0);
