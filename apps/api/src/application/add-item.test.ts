import { describe, it, expect } from "vitest";
import { addItem } from "./add-item.js";
import { InMemoryItemRepository } from "./item-repository.fake.js";
import { ItemValidationError } from "../domain/item.js";

describe("addItem", () => {
  it("persists a new Item with the requested name and quantity", async () => {
    const repo = new InMemoryItemRepository();
    const item = await addItem({ repo, input: { name: "milk", quantity: 2 } });
    expect(item.name).toBe("milk");
    expect(item.quantity).toBe(2);
    const all = await repo.findAll();
    expect(all.map((i) => i.id)).toEqual([item.id]);
  });

  it("creates Items with bought=false by default", async () => {
    const repo = new InMemoryItemRepository();
    const item = await addItem({ repo, input: { name: "milk", quantity: 1 } });
    expect(item.bought).toBe(false);
  });

  it("trims surrounding whitespace from the name", async () => {
    const repo = new InMemoryItemRepository();
    const item = await addItem({ repo, input: { name: "  bread  ", quantity: 1 } });
    expect(item.name).toBe("bread");
  });

  it("rejects an empty name with a domain validation error (defense in depth)", async () => {
    const repo = new InMemoryItemRepository();
    await expect(addItem({ repo, input: { name: "", quantity: 1 } })).rejects.toThrow(
      ItemValidationError,
    );
    expect(await repo.findAll()).toEqual([]);
  });

  it("rejects an out-of-range quantity with a domain validation error", async () => {
    const repo = new InMemoryItemRepository();
    await expect(addItem({ repo, input: { name: "milk", quantity: 1000 } })).rejects.toThrow(
      ItemValidationError,
    );
    expect(await repo.findAll()).toEqual([]);
  });
});
