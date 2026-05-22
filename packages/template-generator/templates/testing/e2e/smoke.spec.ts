import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (err) => errors.push(err));

  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  const heading = page.locator("h1, h2, [data-testid=page-title]");
  if ((await heading.count()) > 0) {
    await expect(heading.first()).toBeVisible();
  }

  expect(
    errors,
    `Page errors occurred: ${errors.map((e) => e.message).join(", ")}`,
  ).toHaveLength(0);
});
