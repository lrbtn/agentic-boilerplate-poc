import { test, expect } from "@playwright/test";
import { resetDb } from "./reset-db.js";

test.describe("add item", () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test("appends a new Item at the top of the list and resets the form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("No items yet.")).toBeVisible();

    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");

    await nameInput.fill("milk");
    await quantityInput.fill("2");
    await nameInput.press("Enter");

    const rows = page.getByTestId("item-row");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("milk");
    await expect(rows.first()).toContainText("2");

    await expect(nameInput).toHaveValue("");
    await expect(quantityInput).toHaveValue("1");
    await expect(nameInput).toBeFocused();

    await nameInput.fill("bread");
    await quantityInput.fill("3");
    await page.getByTestId("add-submit").click();
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("bread");
    await expect(rows.nth(1)).toContainText("milk");
  });

  test("renders an inline error and adds nothing when the name is empty", async ({ page }) => {
    await page.goto("/");
    const nameInput = page.getByTestId("add-name");
    await nameInput.fill("");
    await page.getByTestId("add-submit").click();

    await expect(page.getByTestId("add-error")).toBeVisible();
    await expect(page.getByTestId("item-row")).toHaveCount(0);
  });
});
