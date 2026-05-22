import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (err) => errors.push(err));

  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("h1")).toBeVisible();

  expect(errors).toHaveLength(0);
});
