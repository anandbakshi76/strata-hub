import { test, expect, type Page } from "@playwright/test";

// Tests for the Impeccable critique fixes (docs/log/2026-11-20-phase-3-impeccable-critique.md),
// approved by the person on 20 November 2026.

const bg = (page: Page, sel: string) =>
  page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);

test("P1: one orange button on the first screen; the header button is outlined", async ({
  page,
}) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const orange = await page.evaluate(
      () =>
        [...document.querySelectorAll("a.button, button.button")].filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.bottom > 0 &&
            r.top < window.innerHeight &&
            r.width > 0 &&
            getComputedStyle(el).backgroundColor === "rgb(194, 65, 12)"
          );
        }).length,
    );
    expect(orange, `${width}px`).toBe(1);
    expect(await bg(page, ".site-header a.button")).toBe("rgba(0, 0, 0, 0)");
  }
});

test("P1: after the hub reassembles the page fades back to light, with no seam", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.mouse.wheel(0, 300);
  await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
  await page.locator("#climate").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect.poll(() => page.locator("#inside").getAttribute("data-light")).toBe("0");
  await page.locator("#bundles").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect
    .poll(async () => Number(await page.locator("#inside").getAttribute("data-light")))
    .toBeGreaterThan(0.95);
  const border = await page
    .locator("#inside .still")
    .evaluate((el) => getComputedStyle(el).borderBottomWidth);
  expect(border).toBe("0px");
});

test("P2: the header is opaque over the dark section (no grey ghosting)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.locator("#climate").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect.poll(() => bg(page, ".site-header")).toBe("rgb(250, 250, 249)");
});

test("P2: bundle cards line up: prices at one height, no repeated hub row, capped width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const priceTops = await page
    .locator("#bundles .price")
    .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(priceTops).size).toBe(1);
  await expect(page.locator("#bundles li", { hasText: "Hub:" })).toHaveCount(0);
  await expect(page.locator("#bundles li svg")).toHaveCount(12);
  await page.setViewportSize({ width: 768, height: 1024 });
  const width = await page
    .locator("#bundles .card")
    .first()
    .evaluate((e) => e.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(32 * 16 + 1);
});

test("N2: chapter names are display size, 48 px on phones up to 88 px on desktop", async ({
  page,
}) => {
  const size = () =>
    page.locator("#lights h3").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  expect(await size()).toBeGreaterThanOrEqual(48);
  await page.setViewportSize({ width: 1280, height: 900 });
  expect(await size()).toBeGreaterThan(70);
  expect(await size()).toBeLessThanOrEqual(88);
});

test("N6: the hero headline rises line by line, never starting transparent", async ({ page }) => {
  await page.goto("/");
  const lines = page.locator("h1 .line > span");
  await expect(lines).toHaveCount(2);
  await expect(page.locator("h1")).toHaveText("One hub. Every room.");
  const opacities = await lines.evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
  expect(opacities.every((o) => o === "1")).toBe(true);
  await expect(page.locator("h1")).toHaveAttribute("data-risen", "true", { timeout: 3000 });
});

test.describe("N6 with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("the hero headline does not move", async ({ page }) => {
    await page.goto("/");
    const transforms = await page
      .locator("h1 .line > span")
      .evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
    expect(transforms.every((t) => t === "none")).toBe(true);
  });
});
