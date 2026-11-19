import { test, expect } from "@playwright/test";

// Rule 2: the content never depends on 3D or JavaScript.
test.use({ javaScriptEnabled: false });

test("with JavaScript off, every heading, story, spec, price and FAQ question is readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const body = page.locator("body");
  for (const name of ["Lights", "Climate", "Security", "Energy"]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  for (const price of ["$199", "$349", "$499"]) await expect(body).toContainText(price);
  await expect(page.locator("#faq summary")).toHaveCount(6);
  await expect(body).toContainText("Strata is a fictional product");
  await expect(page.getByText("Turn on JavaScript to register interest.")).toBeVisible();
});

test.describe("with JavaScript on", () => {
  test.use({ javaScriptEnabled: true });
  test("the JavaScript-off notice is removed", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    await expect(page.getByText("Turn on JavaScript to register interest.")).toHaveCount(0);
  });
});
