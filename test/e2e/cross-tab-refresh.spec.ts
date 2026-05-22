import { test, expect, type Page } from "@playwright/test";
import { resetDb } from "./reset-db.js";

// In headless Chromium, multiple browser contexts are all treated as visible
// simultaneously, so calling bringToFront() on one does not flip the
// visibilityState of the other. TanStack Query's focus manager subscribes to
// `visibilitychange` on `window` and reads `document.visibilityState`, so we
// drive the same event chain a real Shopper would create when switching tabs:
// override visibilityState, dispatch visibilitychange on both document and
// window. This exercises the same refetch-on-focus code path as a real tab
// switch.
async function setVisibilityState(page: Page, state: "visible" | "hidden"): Promise<void> {
  await page.evaluate((value) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => value,
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => value === "hidden",
    });
    const event = new Event("visibilitychange", { bubbles: true });
    document.dispatchEvent(event);
    window.dispatchEvent(event);
  }, state);
}

test.describe("cross-tab refresh", () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test.afterEach(async () => {
    await resetDb();
  });

  test("a second tab refetches the List when refocused after a mutation in the first tab", async ({
    browser,
  }) => {
    // Two independent contexts simulate two browser windows on the same instance.
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    try {
      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();

      await pageA.goto("/");
      await pageB.goto("/");

      // Both tabs see the empty List.
      await expect(pageA.getByText("No items yet.")).toBeVisible();
      await expect(pageB.getByText("No items yet.")).toBeVisible();

      // Send tab B to the background while tab A mutates.
      await setVisibilityState(pageB, "hidden");

      // Tab A adds an Item.
      await pageA.getByTestId("add-name").fill("milk");
      await pageA.getByTestId("add-quantity").fill("1");
      await pageA.getByTestId("add-name").press("Enter");
      await expect(pageA.getByTestId("item-row")).toHaveCount(1);

      // Tab B has not seen the change yet — still empty until refocus refetches.
      await expect(pageB.getByText("No items yet.")).toBeVisible();

      // Refocus tab B — TanStack Query's focusManager refetches on this event.
      await setVisibilityState(pageB, "visible");

      // Tab B now reflects the change made in tab A.
      const rowsB = pageB.getByTestId("item-row");
      await expect(rowsB).toHaveCount(1);
      await expect(rowsB.first()).toContainText("milk");
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
