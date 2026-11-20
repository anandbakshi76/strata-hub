import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";

// Scrolls through the look-inside chapters on a Pixel 5 profile with 4x CPU slowdown and counts
// frames. Writes the result to logs/perf.json. Software WebGL (SwiftShader) in headless Chrome is
// slower than a phone's GPU, so this is a pessimistic number.
test("frame rate while scrolling the 3D section (acceptance test 4)", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/");
  await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 30_000 });

  const result = await page.evaluate(async () => {
    const section = document.getElementById("inside") as HTMLElement;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const distance = section.offsetHeight;
    window.scrollTo(0, top - 200);
    await new Promise((r) => setTimeout(r, 500));
    const frames: number[] = [];
    const duration = 6000;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        frames.push(now);
        const k = Math.min(1, (now - t0) / duration);
        window.scrollTo(0, top - 200 + k * distance);
        if (k < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const gaps = frames.slice(1).map((t, i) => t - (frames[i] ?? t));
    const sorted = [...gaps].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const seconds = ((frames.at(-1) ?? 0) - (frames[0] ?? 0)) / 1000;
    return {
      fps: Math.round((frames.length - 1) / seconds),
      p95FrameMs: Math.round(p95 * 10) / 10,
      frames: frames.length,
    };
  });
  mkdirSync("logs", { recursive: true });
  writeFileSync(
    "logs/perf.json",
    JSON.stringify(
      {
        ...result,
        profile: "Pixel 5, CPU 4x slowdown, SwiftShader",
        date: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log("FPS RESULT", JSON.stringify(result));
  expect(result.frames).toBeGreaterThan(10);
});
