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

  test("on wide screens a callout beside the hub names the active module", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
    await scrollTo(page, "#climate");
    await expect(page.locator("#inside .callout")).toBeVisible();
    await expect(page.locator("#inside .callout")).toContainText("Climate");
  });

  test("the hub has snapped back together while it is still fully on screen (review S1)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
    await scrollTo(page, "#energy");
    await page.waitForTimeout(1200);
    let explode = 1;
    for (let i = 0; i < 80 && explode >= 0.05; i++) {
      await page.mouse.wheel(0, 40);
      await page.waitForTimeout(120);
      explode = Number(await inside(page).getAttribute("data-explode"));
    }
    expect(explode).toBeLessThan(0.05);
    const box = await page.locator("#inside canvas").boundingBox();
    expect(box !== null && box.y >= 0 && box.y + box.height <= 900).toBe(true);
  });
});

test.describe("on phones and tablets (review B1, S3)", () => {
  for (const width of [375, 768]) {
    test(`${width}px: the highlighted module is the chapter being read, and a label in the band names it`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 375 ? 800 : 1024 });
      await page.goto("/");
      await expect(page.locator("#inside canvas")).toBeVisible({ timeout: 15_000 });
      for (const id of ["lights", "climate", "security", "energy"]) {
        // Put the chapter's story just below the band at the top, where it is read.
        await page.locator(`#${id}`).evaluate((el) => {
          const band = document.querySelector("#inside .still") as HTMLElement;
          // Where the band sits once it sticks under the 64 px header, not where it is now.
          const below = 64 + band.offsetHeight + 16;
          const story = el.querySelector("p") as HTMLElement;
          window.scrollBy(0, story.getBoundingClientRect().top - below);
        });
        await expect(inside(page)).toHaveAttribute("data-active", id);
        const name = id[0]?.toUpperCase() + id.slice(1);
        await expect(page.locator("#inside .callout")).toBeVisible();
        await expect(page.locator("#inside .callout")).toContainText(name);
        // And with the chapter in the middle of the screen, as the review measured it.
        await scrollTo(page, `#${id}`);
        await expect(inside(page)).toHaveAttribute("data-active", id);
      }
    });
  }
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

// Verifier finding: with reduced motion or no WebGL, nothing is pinned at any width (SPEC 9, DESIGN 7).
for (const mode of ["reduced motion", "no WebGL"] as const) {
  test(`1280px with ${mode}: the chapter still scrolls with the page, it is not pinned`, async ({
    page,
  }) => {
    if (mode === "reduced motion") await page.emulateMedia({ reducedMotion: "reduce" });
    else
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...rest: unknown[]
        ) {
          if (type.startsWith("webgl")) return null;
          return (original as (...a: unknown[]) => RenderingContext | null).call(
            this,
            type,
            ...rest,
          );
        } as typeof HTMLCanvasElement.prototype.getContext;
      });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    const still = page.locator("#inside .still");
    expect(await still.evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
    // Smooth scrolling is on without reduced motion, so wait for each scroll to finish.
    await scrollTo(page, "#climate");
    await page.waitForTimeout(1000);
    const a = (await still.boundingBox())?.y ?? 0;
    await scrollTo(page, "#security");
    await page.waitForTimeout(1000);
    const b = (await still.boundingBox())?.y ?? 0;
    expect(Math.abs(a - b)).toBeGreaterThan(100);
  });
}
