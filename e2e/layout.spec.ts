import { test, expect, type Page } from "@playwright/test";

// PLAN phase 2a, DESIGN.md sections 2 to 8.
const style = (page: Page, selector: string, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

for (const width of [375, 768, 1280]) {
  test(`${width}px: no sideways scroll, own-domain requests only, design fonts and colours`, async ({
    page,
  }) => {
    const foreign: string[] = [];
    page.on("request", (r) => {
      if (!r.url().startsWith("http://localhost:4173") && !r.url().startsWith("data:"))
        foreign.push(r.url());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(foreign).toEqual([]); // rule 6: no third-party request

    expect(await style(page, "h1", "font-family")).toContain("Archivo");
    expect(await style(page, "h1", "font-weight")).toBe("800");
    expect(await style(page, "body", "font-family")).toContain("DM Sans");
    expect(await style(page, ".specs dd", "font-family")).toContain("IBM Plex Mono");
    expect(await page.evaluate(() => document.fonts.check('800 48px "Archivo"'))).toBe(true);

    expect(await style(page, "body", "background-color")).toBe("rgb(250, 250, 249)");
    expect(await style(page, "#inside", "background-color")).toBe("rgb(28, 25, 23)");
    expect(await style(page, ".site-header", "position")).toBe("sticky");
    await expect(page.locator(".site-header .button")).toBeVisible();
    expect(await page.locator("audio, video[autoplay]").count()).toBe(0); // rule 5
  });
}

test("phone: the section links fold into a Menu button that opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".site-header nav a", { hasText: "Bundles" })).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".site-header nav a", { hasText: "Bundles" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("desktop: links shown, no Menu button; bundles three across; chapter still beside the text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  await expect(page.locator(".site-header nav a", { hasText: "Bundles" })).toBeVisible();
  const tops = await page
    .locator("#bundles .card")
    .evaluateAll((cards) => cards.map((c) => Math.round(c.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  const still = await page.locator("#inside .still").boundingBox();
  const text = await page.locator("#lights").boundingBox();
  expect(still !== null && text !== null && still.x > text.x).toBe(true);
});

test("phone: bundles stack in one column", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  const lefts = await page
    .locator("#bundles .card")
    .evaluateAll((cards) => cards.map((c) => Math.round(c.getBoundingClientRect().left)));
  expect(new Set(lefts).size).toBe(1);
});

test("the stills have text alternatives and fixed sizes (SPEC 9, no layout shift)", async ({
  page,
}) => {
  await page.goto("/");
  // The hero still always shows. The chapter still shows unless the 3D hub has replaced it (phase
  // 2b); the reduced-motion and no-WebGL tests check it shows in those cases.
  await expect(page.locator(".hero .still img")).toBeVisible();
  await expect(page.locator("#inside .still img, #inside .still canvas").first()).toBeVisible();
  for (const sel of [".hero .still img", "#inside .still img"]) {
    const img = page.locator(sel);
    expect((await img.getAttribute("alt"))?.length ?? 0).toBeGreaterThan(20);
    expect(await img.getAttribute("width")).toBeTruthy();
    expect(await img.getAttribute("height")).toBeTruthy();
  }
});

test("the Home bundle is the recommended one, with the only primary button among the cards", async ({
  page,
}) => {
  await page.goto("/");
  const home = page.locator("#bundles .card", { hasText: "Home" });
  await expect(home.getByText("Recommended")).toBeVisible();
  await expect(page.locator("#bundles .card .button:not(.secondary)")).toHaveCount(1);
  await expect(home.locator(".button:not(.secondary)")).toHaveCount(1);
});

test("the keyboard reaches every link, button, field and FAQ question in order, with a visible focus ring", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const expected = await page
    .locator("a[href], button:not([disabled]), input, select, summary")
    .evaluateAll((els) =>
      els
        .filter(
          (el) => getComputedStyle(el).visibility !== "hidden" && el.getClientRects().length > 0,
        )
        .map((el) => el.outerHTML.slice(0, 80)),
    );
  const seen: string[] = [];
  for (let i = 0; i < expected.length; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return {
        html: el.outerHTML.slice(0, 80),
        ring: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
      };
    });
    expect(info.ring, `focus ring on ${info.html}`).toBe(true);
    seen.push(info.html);
  }
  expect(seen).toEqual(expected);
});

test("every section shares one left edge with the header and footer", async ({ page }) => {
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const lefts = await page.evaluate(() =>
      [
        ".logo",
        "h1",
        "#inside .chapter h3",
        "#bundles h2",
        ".cards",
        ".register form",
        ".faq details",
        ".site-footer p",
      ].map((s) => Math.round(document.querySelector(s)?.getBoundingClientRect().left ?? -1)),
    );
    expect(new Set(lefts).size, `${width}px: ${lefts.join(", ")}`).toBe(1);
  }
});
