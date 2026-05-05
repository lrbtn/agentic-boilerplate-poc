import { test, expect } from "@playwright/test";
import { resetDb } from "./reset-db.js";

test.describe("toggle bought", () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test.afterEach(async () => {
    await resetDb();
  });

  test("clicking the checkbox moves an Item to the bought group, then back", async ({ page }) => {
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
    // Newest first: bread on top, milk below — both unbought.
    await expect(rows.first()).toContainText("bread");
    await expect(rows.nth(1)).toContainText("milk");

    // Toggle the milk row (bottom row, index 1) to bought.
    await rows.nth(1).getByTestId("item-bought").click();

    // Both rows still present, but milk has moved below bread within the
    // bought group (sort: bought ASC, createdAt DESC). Unbought (bread) first,
    // bought (milk) below.
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("bread");
    await expect(rows.nth(1)).toContainText("milk");
    await expect(rows.nth(1).getByTestId("item-bought")).toBeChecked();

    // Reload to confirm persistence.
    await page.reload();
    const reloadedRows = page.getByTestId("item-row");
    await expect(reloadedRows.nth(1).getByTestId("item-bought")).toBeChecked();

    // Un-toggle: clicking the bought milk row's checkbox returns it to unbought.
    await reloadedRows.nth(1).getByTestId("item-bought").click();
    await expect(reloadedRows.first().getByTestId("item-bought")).not.toBeChecked();
    await expect(reloadedRows.nth(1).getByTestId("item-bought")).not.toBeChecked();
  });

  test("toggling a freshly-bought Item moves it to the top of the bought group", async ({
    page,
  }) => {
    await page.goto("/");

    const nameInput = page.getByTestId("add-name");
    const quantityInput = page.getByTestId("add-quantity");
    const rows = page.getByTestId("item-row");

    // Seed three unbought Items: a (oldest), b, c (newest). Wait between
    // adds so the next form submission does not race the previous render.
    let expected = 0;
    for (const name of ["a", "b", "c"]) {
      await nameInput.fill(name);
      await quantityInput.fill("1");
      await nameInput.press("Enter");
      expected += 1;
      await expect(rows).toHaveCount(expected);
    }
    // Unbought group, newest first: c, b, a.
    await expect(rows.nth(0)).toContainText("c");
    await expect(rows.nth(1)).toContainText("b");
    await expect(rows.nth(2)).toContainText("a");

    // Toggle "a" (the oldest, currently at the bottom) to bought.
    await rows.nth(2).getByTestId("item-bought").click();

    // a moves to the bought group (now last) — but it is the only bought Item,
    // so it sits at the top of the bought group.
    await expect(rows.nth(0)).toContainText("c");
    await expect(rows.nth(1)).toContainText("b");
    await expect(rows.nth(2)).toContainText("a");
    await expect(rows.nth(2).getByTestId("item-bought")).toBeChecked();

    // Now toggle "b" (newer, currently at the unbought middle) to bought.
    await rows.nth(1).getByTestId("item-bought").click();

    // Bought group sorts by createdAt DESC, so b (newer) sits on top of a.
    // Final order: c (unbought) → b (bought, newer) → a (bought, older).
    await expect(rows.nth(0)).toContainText("c");
    await expect(rows.nth(1)).toContainText("b");
    await expect(rows.nth(2)).toContainText("a");
    await expect(rows.nth(0).getByTestId("item-bought")).not.toBeChecked();
    await expect(rows.nth(1).getByTestId("item-bought")).toBeChecked();
    await expect(rows.nth(2).getByTestId("item-bought")).toBeChecked();
  });
});
