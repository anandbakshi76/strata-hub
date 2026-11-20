import { test, expect, type Page } from "@playwright/test";

// PLAN phase 2b: the 3D hub and the scroll motion, with its fallbacks (SPEC 4.2 and 9).
const inside = (page: Page) => page.locator("#inside");

async function scrollTo(page: Page, selector: string) {
  await page.locator(selector).evaluate((el) => el.scrollIntoView({ block: "center" }));
}

test.describe("with WebGL and motion", () => {
  test("the 3D hub replaces the chapter still and the page has no console errors while scrolling", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#inside .still img")).toBeHidden();
    for (const sel of ["#lights", "#climate", "#security", "#energy", "#reassemble", "#faq"]) {
      await scrollTo(page, sel);
      await page.waitForTimeout(300);
    }
    expect(errors).toEqual([]);
  });

  test("scrolling explodes the hub, highlights each module and reassembles it; scrolling up reverses it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
    await expect(inside(page)).toHaveAttribute("data-explode", "0");

    for (const id of ["lights", "climate", "security", "energy"]) {
      await scrollTo(page, `#${id}`);
      await expect(inside(page)).toHaveAttribute("data-active", id);
    }
    await expect
      .poll(async () => Number(await inside(page).getAttribute("data-explode")))
      .toBeGreaterThan(0.95);

    await scrollTo(page, "#bundles");
    await expect
      .poll(async () => Number(await inside(page).getAttribute("data-explode")))
      .toBeLessThan(0.05);

    await scrollTo(page, "#security");
    await expect(inside(page)).toHaveAttribute("data-active", "security");
    await scrollTo(page, "#lights");
    await expect(inside(page)).toHaveAttribute("data-active", "lights");
  });

  test("the hub stays in place (one pinned area) while the chapters scroll past", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
    await scrollTo(page, "#climate");
    await page.waitForTimeout(400);
    const a = await page.locator("#inside canvas").boundingBox();
    await scrollTo(page, "#security");
    await page.waitForTimeout(400);
    const b = await page.locator("#inside canvas").boundingBox();
    expect(a && b && Math.abs(a.y - b.y)).toBeLessThan(2);
  });

  test("on wide screens a callout names the active module; on phones it is hidden (gap 21)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
    await scrollTo(page, "#climate");
    await expect(page.locator("#inside .callout")).toBeVisible();
    await expect(page.locator("#inside .callout")).toContainText("Climate");
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.locator("#inside .callout")).toBeHidden();
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("the stills show, no canvas is made, nothing is pinned and all content reads", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    await page.waitForTimeout(1000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("#inside .still img")).toBeVisible();
    await expect(inside(page)).not.toHaveAttribute("data-explode", /.*/);
    await expect(page.getByRole("heading", { name: "Energy", exact: true })).toBeVisible();
  });
});

test.describe("without WebGL", () => {
  test("the stills show and no canvas is made", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...rest: unknown[]
      ) {
        if (type.startsWith("webgl")) return null;
        return (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto("/");
    await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    await page.waitForTimeout(1000);
    await expect(page.locator("#inside canvas")).toHaveCount(0);
    await expect(page.locator("#inside .still img")).toBeVisible();
  });
});
