import { describe, it, expect } from "vitest";
import { deleteItem } from "./delete-item.js";
import { InMemoryItemRepository } from "./item-repository.fake.js";
import { Item, ItemNotFoundError } from "../domain/item.js";

describe("deleteItem", () => {
  it("removes the Item with the given id", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const repo = new InMemoryItemRepository([item]);
    await deleteItem({ repo, id: item.id });
    expect(await repo.findAll()).toEqual([]);
  });

  it("leaves other Items untouched", async () => {
    const target = Item.create({ name: "milk", quantity: 1 });
    const survivor = Item.create({ name: "bread", quantity: 1 });
    const repo = new InMemoryItemRepository([target, survivor]);
    await deleteItem({ repo, id: target.id });
    const remaining = await repo.findAll();
    expect(remaining.map((i) => i.id)).toEqual([survivor.id]);
  });

  it("throws ItemNotFoundError when no Item has the given id", async () => {
    const repo = new InMemoryItemRepository();
    await expect(
      deleteItem({ repo, id: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow(ItemNotFoundError);
  });
});
