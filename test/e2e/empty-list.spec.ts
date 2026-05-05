import { test, expect } from "@playwright/test";

test.describe("empty list", () => {
  test('shows "No items yet." on a fresh database', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("No items yet.")).toBeVisible();
  });
});

test.describe("initial fetch error", () => {
  test("renders an inline error when /items is unreachable", async ({ page }) => {
    await page.route("**/items*", (route) => route.abort("failed"));
    await page.goto("/");
    await expect(page.getByTestId("list-error")).toBeVisible();
  });
});
