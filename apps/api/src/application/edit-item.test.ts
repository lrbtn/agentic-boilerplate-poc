import { describe, it, expect } from "vitest";
import { editItem } from "./edit-item.js";
import { InMemoryItemRepository } from "./item-repository.fake.js";
import { Item, ItemNotFoundError, ItemValidationError } from "../domain/item.js";

describe("editItem", () => {
  it("updates the Item's name", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    const updated = await editItem({ repo, id: item.id, changes: { name: "soy milk" } });
    expect(updated.name).toBe("soy milk");
    const persisted = (await repo.findAll()).find((i) => i.id === item.id);
    expect(persisted?.name).toBe("soy milk");
  });

  it("updates the Item's quantity", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    const updated = await editItem({ repo, id: item.id, changes: { quantity: 5 } });
    expect(updated.quantity).toBe(5);
  });

  it("preserves the Item's id, bought, and createdAt", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    const updated = await editItem({ repo, id: item.id, changes: { name: "bread", quantity: 2 } });
    expect(updated.id).toBe(item.id);
    expect(updated.bought).toBe(item.bought);
    expect(updated.createdAt).toBe(item.createdAt);
  });

  it("rejects an invalid name with a domain validation error", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    await expect(
      editItem({ repo, id: item.id, changes: { name: "" } }),
    ).rejects.toThrow(ItemValidationError);
  });

  it("does not persist a rejected change", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    await editItem({ repo, id: item.id, changes: { name: "soy milk" } }).catch(() => {
      /* ignore */
    });
    await editItem({ repo, id: item.id, changes: { name: "" } }).catch(() => {
      /* ignore */
    });
    const persisted = (await repo.findAll()).find((i) => i.id === item.id);
    expect(persisted?.name).toBe("soy milk");
  });

  it("throws ItemNotFoundError when no Item has the given id", async () => {
    const repo = new InMemoryItemRepository();
    await expect(
      editItem({
        repo,
        id: "00000000-0000-0000-0000-000000000000",
        changes: { name: "milk" },
      }),
    ).rejects.toThrow(ItemNotFoundError);
  });
});
