import { test, expect } from "@playwright/test";
import { resetDb } from "./reset-db.js";

test.describe("edit item", () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test.afterEach(async () => {
    await resetDb();
  });

  test("commits a name edit on Enter and the row stays in place", async ({ page }) => {
    await page.goto("/");

    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");
    const rows = page.getByTestId("item-row");

    await nameInput.fill("milk");
    await quantityInput.fill("1");
    await nameInput.press("Enter");
    await expect(rows).toHaveCount(1);

    await nameInput.fill("bread");
    await quantityInput.fill("2");
    await nameInput.press("Enter");
    await expect(rows).toHaveCount(2);
    // Newest first: bread on top, milk below.
    await expect(rows.first()).toContainText("bread");
    await expect(rows.nth(1)).toContainText("milk");

    // Edit the milk row's name (bottom row, index 1).
    const milkRow = rows.nth(1);
    await milkRow.getByTestId("item-name").click();
    const nameEditor = milkRow.getByTestId("item-name-input");
    await nameEditor.fill("oat milk");
    await nameEditor.press("Enter");

    // Row count unchanged, position unchanged, content updated.
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("bread");
    await expect(rows.nth(1)).toContainText("oat milk");
  });

  test("commits a quantity edit on blur", async ({ page }) => {
    await page.goto("/");

    const rows = page.getByTestId("item-row");
    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");

    await nameInput.fill("eggs");
    await quantityInput.fill("1");
    await nameInput.press("Enter");
    await expect(rows).toHaveCount(1);

    await rows.first().getByTestId("item-quantity").click();
    const qtyEditor = rows.first().getByTestId("item-quantity-input");
    await qtyEditor.fill("12");
    await qtyEditor.blur();

    await expect(rows.first()).toContainText("12");
    await expect(rows.first()).toContainText("eggs");
  });

  test("Esc reverts an edit without committing", async ({ page }) => {
    await page.goto("/");

    const rows = page.getByTestId("item-row");
    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");

    await nameInput.fill("milk");
    await quantityInput.fill("1");
    await nameInput.press("Enter");
    await expect(rows).toHaveCount(1);

    await rows.first().getByTestId("item-name").click();
    const nameEditor = rows.first().getByTestId("item-name-input");
    await nameEditor.fill("not-actually-this");
    await nameEditor.press("Escape");

    // Row reverts to the original name; no commit happened.
    await expect(rows.first()).toContainText("milk");

    // Reload to confirm nothing was persisted.
    await page.reload();
    await expect(rows.first()).toContainText("milk");
  });

  test("renders an inline error when the edit is invalid", async ({ page }) => {
    await page.goto("/");

    const rows = page.getByTestId("item-row");
    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");

    await nameInput.fill("milk");
    await quantityInput.fill("1");
    await nameInput.press("Enter");
    await expect(rows).toHaveCount(1);

    await rows.first().getByTestId("item-name").click();
    const nameEditor = rows.first().getByTestId("item-name-input");
    await nameEditor.fill("");
    await nameEditor.press("Enter");

    await expect(rows.first().getByTestId("item-error")).toBeVisible();
    await expect(rows.first()).toContainText("milk");
  });
});
