import { test, expect } from "@playwright/test";

// SPEC 4.5, 6 and 9; rules 3 and 4.
const EMAIL_ERROR = "Enter an email address, like name@example.com";
const CONSENT_ERROR = "Tick the box to agree we can email you";
const THANKS = "Thanks. We'll email you when Strata launches.";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#register").scrollIntoViewIfNeeded();
});

const submit = (page: import("@playwright/test").Page) =>
  page.locator("#register form").getByRole("button", { name: "Register interest" }).click();

test("an empty email shows the SPEC 9 message next to the field and moves the focus to it", async ({
  page,
}) => {
  await submit(page);
  const email = page.getByLabel("Email", { exact: true });
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toBeFocused();
  const describedBy = await email.getAttribute("aria-describedby");
  await expect(page.locator(`#${describedBy}`)).toHaveText(EMAIL_ERROR);
});

test("an invalid email shows the same message", async ({ page }) => {
  await page.getByLabel("Email", { exact: true }).fill("sam@example");
  await page.getByLabel(/Email me about/).check();
  await submit(page);
  await expect(page.getByText(EMAIL_ERROR)).toBeVisible();
});

test("an unticked consent box shows its message next to the box", async ({ page }) => {
  await page.getByLabel("Email", { exact: true }).fill("sam@example.com");
  await submit(page);
  const consent = page.getByLabel(/Email me about/);
  await expect(consent).toHaveAttribute("aria-invalid", "true");
  const describedBy = await consent.getAttribute("aria-describedby");
  await expect(page.locator(`#${describedBy}`)).toHaveText(CONSENT_ERROR);
});

test("fixing the email clears its error", async ({ page }) => {
  await submit(page);
  await page.getByLabel("Email", { exact: true }).fill("sam@example.com");
  await page.getByLabel(/Email me about/).check();
  await submit(page);
  await expect(page.getByText(EMAIL_ERROR)).toHaveCount(0);
  await expect(page.getByLabel("Email", { exact: true })).not.toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("a valid submission shows the confirmation and sends nothing (rule 4)", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.getByLabel("Email", { exact: true }).fill("sam@example.com");
  await page.getByLabel("Which module interests you most?").selectOption("Security");
  await page.getByLabel(/Email me about/).check();
  await submit(page);
  await expect(page.getByRole("status")).toHaveText(THANKS);
  expect(requests).toEqual([]);
  expect(page.url()).not.toContain("sam");
});
