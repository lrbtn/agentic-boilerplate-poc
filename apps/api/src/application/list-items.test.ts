import { describe, it, expect } from "vitest";
import { Item } from "../domain/item.js";
import { listItems } from "./list-items.js";
import { InMemoryItemRepository } from "./item-repository.fake.js";

function snapshot(overrides: {
  id: string;
  name: string;
  quantity?: number;
  bought?: boolean;
  createdAt: Date;
}): Item {
  return Item.rehydrate({
    id: overrides.id,
    name: overrides.name,
    quantity: overrides.quantity ?? 1,
    bought: overrides.bought ?? false,
    createdAt: overrides.createdAt,
  });
}

describe("listItems", () => {
  it("returns an empty array when the repository is empty", async () => {
    const repo = new InMemoryItemRepository([]);
    expect(await listItems({ repo })).toEqual([]);
  });

  it("returns unbought Items before bought Items", async () => {
    const oldDate = new Date("2026-01-01T00:00:00Z");
    const repo = new InMemoryItemRepository([
      snapshot({ id: "1", name: "bread", bought: true, createdAt: oldDate }),
      snapshot({ id: "2", name: "milk", bought: false, createdAt: oldDate }),
    ]);
    const result = await listItems({ repo });
    expect(result.map((i) => i.id)).toEqual(["2", "1"]);
  });

  it("sorts within each bought-group by createdAt DESC", async () => {
    const repo = new InMemoryItemRepository([
      snapshot({ id: "a", name: "apples", bought: false, createdAt: new Date("2026-01-01") }),
      snapshot({ id: "b", name: "bananas", bought: false, createdAt: new Date("2026-01-03") }),
      snapshot({ id: "c", name: "cherries", bought: false, createdAt: new Date("2026-01-02") }),
    ]);
    const result = await listItems({ repo });
    expect(result.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("applies the full sort: bought ASC then createdAt DESC", async () => {
    const repo = new InMemoryItemRepository([
      snapshot({ id: "u-old", name: "u-old", bought: false, createdAt: new Date("2026-01-01") }),
      snapshot({ id: "u-new", name: "u-new", bought: false, createdAt: new Date("2026-01-05") }),
      snapshot({ id: "b-old", name: "b-old", bought: true, createdAt: new Date("2026-01-02") }),
      snapshot({ id: "b-new", name: "b-new", bought: true, createdAt: new Date("2026-01-04") }),
    ]);
    const result = await listItems({ repo });
    expect(result.map((i) => i.id)).toEqual(["u-new", "u-old", "b-new", "b-old"]);
  });
});
