import { test, expect } from "@playwright/test";
import { resetDb } from "./reset-db.js";

test.describe("delete item", () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test.afterEach(async () => {
    await resetDb();
  });

  test("removes the targeted Item and leaves the other in place", async ({ page }) => {
    await page.goto("/");

    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");
    const rows = page.getByTestId("item-row");

    await nameInput.fill("milk");
    await quantityInput.fill("1");
    await nameInput.press("Enter");
    await expect(rows).toHaveCount(1);

    await nameInput.fill("bread");
    await quantityInput.fill("1");
    await nameInput.press("Enter");
    await expect(rows).toHaveCount(2);
    // Newest first: bread on top, milk below.
    await expect(rows.first()).toContainText("bread");
    await expect(rows.nth(1)).toContainText("milk");

    // Delete bread (the newer one, which sits on top).
    await rows.first().getByTestId("item-delete").click();

    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("milk");

    // Reload — the deletion must have reached the database.
    await page.reload();
    const reloadedRows = page.getByTestId("item-row");
    await expect(reloadedRows).toHaveCount(1);
    await expect(reloadedRows.first()).toContainText("milk");
  });
});
