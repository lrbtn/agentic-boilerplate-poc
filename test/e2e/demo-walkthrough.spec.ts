import { test, expect } from "@playwright/test";
import { resetDb } from "./reset-db.js";

test.describe("demo walkthrough", () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test.afterEach(async () => {
    await resetDb();
  });

  test("Add three, Edit one, Toggle one, Delete one — final List state is correct", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("No items yet.")).toBeVisible();

    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");
    const rows = page.getByTestId("item-row");

    // Add three Items, oldest to newest: milk, bread, eggs.
    let expected = 0;
    for (const [name, qty] of [
      ["milk", "1"],
      ["bread", "2"],
      ["eggs", "3"],
    ] as const) {
      await nameInput.fill(name);
      await quantityInput.fill(qty);
      await nameInput.press("Enter");
      expected += 1;
      await expect(rows).toHaveCount(expected);
    }

    // Newest first within unbought group: eggs, bread, milk.
    await expect(rows.nth(0)).toContainText("eggs");
    await expect(rows.nth(1)).toContainText("bread");
    await expect(rows.nth(2)).toContainText("milk");

    // Edit "bread" (middle row) to "sourdough bread".
    const breadRow = rows.nth(1);
    await breadRow.getByTestId("item-name").click();
    const nameEditor = breadRow.getByTestId("item-name-input");
    await nameEditor.fill("sourdough bread");
    await nameEditor.press("Enter");

    await expect(rows).toHaveCount(3);
    await expect(rows.nth(1)).toContainText("sourdough bread");

    // Toggle "milk" (bottom row) to bought. It moves into the bought group.
    await rows.nth(2).getByTestId("item-bought").click();

    // Order now: eggs (unbought), sourdough bread (unbought), milk (bought).
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText("eggs");
    await expect(rows.nth(1)).toContainText("sourdough bread");
    await expect(rows.nth(2)).toContainText("milk");
    await expect(rows.nth(2).getByTestId("item-bought")).toBeChecked();

    // Delete "eggs" (top row).
    await rows.nth(0).getByTestId("item-delete").click();

    // Final state: two rows — sourdough bread (unbought, top), milk (bought, bottom).
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("sourdough bread");
    await expect(rows.nth(0).getByTestId("item-bought")).not.toBeChecked();
    await expect(rows.nth(1)).toContainText("milk");
    await expect(rows.nth(1).getByTestId("item-bought")).toBeChecked();
    await expect(page.getByText("eggs")).toHaveCount(0);

    // Reload to confirm every change reached the database.
    await page.reload();
    const reloadedRows = page.getByTestId("item-row");
    await expect(reloadedRows).toHaveCount(2);
    await expect(reloadedRows.nth(0)).toContainText("sourdough bread");
    await expect(reloadedRows.nth(1)).toContainText("milk");
    await expect(reloadedRows.nth(1).getByTestId("item-bought")).toBeChecked();
  });
});
