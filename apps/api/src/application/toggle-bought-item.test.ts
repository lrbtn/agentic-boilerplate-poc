import { describe, it, expect } from "vitest";
import { toggleBoughtItem } from "./toggle-bought-item.js";
import { InMemoryItemRepository } from "./item-repository.fake.js";
import { Item, ItemNotFoundError } from "../domain/item.js";

describe("toggleBoughtItem", () => {
  it("sets bought to true on a previously unbought Item", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    const updated = await toggleBoughtItem({ repo, id: item.id, bought: true });
    expect(updated.bought).toBe(true);
  });

  it("sets bought to false on a previously bought Item", async () => {
    const bought = Item.create({ name: "milk", quantity: 1 }).withChanges({ bought: true });
    const repo = new InMemoryItemRepository([bought]);
    const updated = await toggleBoughtItem({ repo, id: bought.id, bought: false });
    expect(updated.bought).toBe(false);
  });

  it("persists the change so a subsequent findAll reflects it", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    await toggleBoughtItem({ repo, id: item.id, bought: true });
    const persisted = (await repo.findAll()).find((i) => i.id === item.id);
    expect(persisted?.bought).toBe(true);
  });

  it("preserves the Item's id, name, quantity, and createdAt", async () => {
    const item = Item.create({ name: "milk", quantity: 3 });
    const repo = new InMemoryItemRepository([item]);
    const updated = await toggleBoughtItem({ repo, id: item.id, bought: true });
    expect(updated.id).toBe(item.id);
    expect(updated.name).toBe(item.name);
    expect(updated.quantity).toBe(item.quantity);
    expect(updated.createdAt).toBe(item.createdAt);
  });

  it("throws ItemNotFoundError when no Item has the given id", async () => {
    const repo = new InMemoryItemRepository();
    await expect(
      toggleBoughtItem({
        repo,
        id: "00000000-0000-0000-0000-000000000000",
        bought: true,
      }),
    ).rejects.toThrow(ItemNotFoundError);
  });
});
