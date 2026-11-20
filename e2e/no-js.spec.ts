import { test, expect } from "@playwright/test";
import { content } from "../web/content";

// Rule 2: the content never depends on 3D or JavaScript.
test.use({ javaScriptEnabled: false });

test("with JavaScript off, every heading, story, spec, price and FAQ question is readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const body = page.locator("body");
  for (const m of content.modules) {
    await expect(page.getByRole("heading", { name: m.name, exact: true })).toBeVisible();
    await expect(body).toContainText(m.story);
    for (const s of m.specs) {
      await expect(body).toContainText(s.label);
      await expect(body).toContainText(s.value);
    }
  }
  for (const b of content.bundles) await expect(body).toContainText(b.price);
  await expect(page.locator("#faq summary")).toHaveCount(content.faq.length);
  for (const q of content.faq) await expect(body).toContainText(q.question);
  await expect(body).toContainText(content.footer);
  await expect(page.getByText(content.register.noScript)).toBeVisible();
});

test.describe("with JavaScript on", () => {
  test.use({ javaScriptEnabled: true });
  test("the JavaScript-off notice is removed", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    await expect(page.getByText(content.register.noScript)).toHaveCount(0);
  });
});
