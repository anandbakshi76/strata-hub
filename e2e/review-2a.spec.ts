import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Tests for the phase 2a independent review findings (docs/log/2026-11-20-phase-2a-independent-review.md).

test.describe("B1: with JavaScript off the form can never send", () => {
  test.use({ javaScriptEnabled: false });
  test("pressing Enter in the email field sends nothing and keeps the URL (rule 4)", async ({
    page,
  }) => {
    await page.goto("/");
    const requests: string[] = [];
    page.on("request", (r) => requests.push(r.url()));
    const email = page.locator("#email");
    await email.focus().catch(() => undefined);
    await page.keyboard.type("sam@example.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain("sam");
    expect(requests.filter((u) => u.includes("email="))).toEqual([]);
  });
});

test("S1: the header's Register interest button puts the focus in the email field (SPEC 5)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.locator(".site-header a.button").click();
  await expect(page.locator("#email")).toBeFocused();
});

test("S2: the header has no glass effect (DESIGN.md 2)", async ({ page }) => {
  await page.goto("/");
  const blur = await page
    .locator(".site-header")
    .evaluate((el) => getComputedStyle(el).backdropFilter);
  expect(blur === "none" || blur === "").toBe(true);
});

test("S3: chapter names use --stone-200 on dark (DESIGN.md 2)", async ({ page }) => {
  await page.goto("/");
  const colour = await page.locator("#lights h3").evaluate((el) => getComputedStyle(el).color);
  expect(colour).toBe("rgb(231, 229, 228)");
});

test("S4: each form error shows an icon with the text (DESIGN.md 5)", async ({ page }) => {
  await page.goto("/");
  await page.locator("#register form button").click();
  for (const id of ["#email-error", "#consent-error"]) {
    const icon = page.locator(`${id} svg`);
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute("aria-hidden", "true");
  }
});

test("N1: an open FAQ shows a minus, not a rotated plus (DESIGN.md 5)", async ({ page }) => {
  await page.goto("/");
  await page.locator("#faq summary").first().click();
  const after = await page
    .locator("#faq details[open] summary")
    .first()
    .evaluate((el) => getComputedStyle(el, "::after"));
  expect(after.content).toContain("−");
  expect(after.transform === "none" || after.transform === "").toBe(true);
});

test("N6: the tick and dash in the bundle lists are hidden from screen readers", async ({
  page,
}) => {
  // Since the phase 3 critique they are drawn SVG icons (not text glyphs), each aria-hidden.
  await page.goto("/");
  const icons = page.locator("#bundles li svg");
  await expect(icons).toHaveCount(12);
  const hidden = await icons.evaluateAll((els) =>
    els.every((e) => e.getAttribute("aria-hidden") === "true"),
  );
  expect(hidden).toBe(true);
});

test.describe("N4: reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("the stills show when reduced motion is on (SPEC 9)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero .still img")).toBeVisible();
    await expect(page.locator("#inside .still img")).toBeVisible();
  });
});

test("N4: axe finds no AA failures in the form's error state and the open phone menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.locator("#register form button").click();
  await page.locator(".menu-button").click();
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(axe.violations).toEqual([]);
});
