import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

// PLAN phase 3: SEO, the size budget, layout shift and the Content Security Policy.

test("the page has a title, a description, sharing tags and a canonical link", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Strata: one hub for every room, built from modules");
  const meta = (sel: string) => page.locator(sel).getAttribute("content");
  expect((await meta('meta[name="description"]'))?.length ?? 0).toBeGreaterThan(70);
  expect((await meta('meta[name="description"]'))?.length ?? 0).toBeLessThan(170);
  expect(await meta('meta[property="og:title"]')).toBeTruthy();
  expect(await meta('meta[property="og:description"]')).toBeTruthy();
  expect(await meta('meta[property="og:type"]')).toBe("website");
  expect(await meta('meta[property="og:image"]')).toMatch(/^https:\/\/.+\/og-image\.png$/);
  expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https:\/\//);
});

test("robots.txt allows crawling and points to the sitemap; sitemap.xml lists the page", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const r = await robots.text();
  expect(r).toContain("User-agent: *");
  expect(r).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const s = await sitemap.text();
  expect(s).toContain("<urlset");
  expect(s).toMatch(/<loc>https:\/\/.+\/<\/loc>/);
  const image = await request.get("/og-image.png");
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
});

test("the built JavaScript and model stay under 600 KB compressed (SPEC 10)", () => {
  const dir = "dist/assets";
  const js = readdirSync(dir).filter((f) => f.endsWith(".js"));
  const total = js.reduce((sum, f) => sum + gzipSync(readFileSync(join(dir, f))).length, 0);
  const raw = js.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
  console.log(
    `JS files: ${js.length}, ${Math.round(raw / 1024)} KB raw, ${Math.round(total / 1024)} KB gzip`,
  );
  expect(total).toBeLessThan(600 * 1024);
});

test("layout shift stays under 0.1 while the page loads and scrolls", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[])
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const sel of ["#inside", "#climate", "#energy", "#bundles", "#faq"]) {
    await page.locator(sel).evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(300);
  }
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.1);
});

test("a Content Security Policy allows only the site's own files and blocks form sending", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  const csp = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute("content");
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("form-action 'none'");
  expect(csp).not.toContain("unsafe-eval");
  for (const sel of ["#climate", "#bundles", "#faq"]) {
    await page.locator(sel).evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(300);
  }
  expect(errors).toEqual([]);
});

test("touch targets: buttons and fields at least 44 px tall, links at least 24 px (WCAG 2.2)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  const small = await page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll("button, input, select, summary, a.button").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height < 44 && (el as HTMLInputElement).type !== "checkbox")
        out.push(`${el.tagName} ${Math.round(r.height)}`);
    });
    document.querySelectorAll("a:not(.button)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height < 24 && !el.classList.contains("skip-link"))
        out.push(`A ${el.textContent?.trim()} ${Math.round(r.height)}`);
    });
    return out;
  });
  expect(small).toEqual([]);
});
