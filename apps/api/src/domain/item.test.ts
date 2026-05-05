import { describe, it, expect } from "vitest";
import { Item, ItemValidationError } from "./item.js";

describe("Item.create — name", () => {
  it("rejects empty name", () => {
    expect(() => Item.create({ name: "", quantity: 1 })).toThrow(ItemValidationError);
  });

  it("rejects whitespace-only name", () => {
    expect(() => Item.create({ name: "   ", quantity: 1 })).toThrow(ItemValidationError);
  });

  it("accepts a 1-character name after trim", () => {
    const item = Item.create({ name: "a", quantity: 1 });
    expect(item.name).toBe("a");
  });

  it("trims surrounding whitespace from the name", () => {
    const item = Item.create({ name: "  milk  ", quantity: 1 });
    expect(item.name).toBe("milk");
  });

  it("accepts an 80-character name after trim", () => {
    const name = "a".repeat(80);
    const item = Item.create({ name, quantity: 1 });
    expect(item.name).toBe(name);
  });

  it("rejects an 81-character name after trim", () => {
    const name = "a".repeat(81);
    expect(() => Item.create({ name, quantity: 1 })).toThrow(ItemValidationError);
  });
});

describe("Item.create — quantity", () => {
  it("rejects quantity 0", () => {
    expect(() => Item.create({ name: "milk", quantity: 0 })).toThrow(ItemValidationError);
  });

  it("accepts quantity 1", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    expect(item.quantity).toBe(1);
  });

  it("accepts quantity 999", () => {
    const item = Item.create({ name: "milk", quantity: 999 });
    expect(item.quantity).toBe(999);
  });

  it("rejects quantity 1000", () => {
    expect(() => Item.create({ name: "milk", quantity: 1000 })).toThrow(ItemValidationError);
  });

  it("rejects non-integer quantity", () => {
    expect(() => Item.create({ name: "milk", quantity: 1.5 })).toThrow(ItemValidationError);
  });

  it("rejects NaN quantity", () => {
    expect(() => Item.create({ name: "milk", quantity: Number.NaN })).toThrow(ItemValidationError);
  });
});

describe("Item.create — bought default", () => {
  it("defaults bought to false on creation", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    expect(item.bought).toBe(false);
  });
});

describe("Item.withChanges", () => {
  it("returns a new Item with the updated name", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const updated = item.withChanges({ name: "soy milk" });
    expect(updated.name).toBe("soy milk");
  });

  it("returns a new Item with the updated quantity", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const updated = item.withChanges({ quantity: 3 });
    expect(updated.quantity).toBe(3);
  });

  it("preserves id, bought, and createdAt across changes", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const updated = item.withChanges({ name: "soy milk", quantity: 2 });
    expect(updated.id).toBe(item.id);
    expect(updated.bought).toBe(item.bought);
    expect(updated.createdAt).toBe(item.createdAt);
  });

  it("trims the new name", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const updated = item.withChanges({ name: "  bread  " });
    expect(updated.name).toBe("bread");
  });

  it("re-asserts invariants on the new name", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    expect(() => item.withChanges({ name: "" })).toThrow(ItemValidationError);
    expect(() => item.withChanges({ name: "a".repeat(81) })).toThrow(ItemValidationError);
  });

  it("re-asserts invariants on the new quantity", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    expect(() => item.withChanges({ quantity: 0 })).toThrow(ItemValidationError);
    expect(() => item.withChanges({ quantity: 1000 })).toThrow(ItemValidationError);
    expect(() => item.withChanges({ quantity: 1.5 })).toThrow(ItemValidationError);
  });

  it("returns the same Item when no changes are supplied", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const updated = item.withChanges({});
    expect(updated.name).toBe(item.name);
    expect(updated.quantity).toBe(item.quantity);
  });

  it("returns a new Item with bought set to true", () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    const updated = item.withChanges({ bought: true });
    expect(updated.bought).toBe(true);
  });

  it("returns a new Item with bought set back to false", () => {
    const bought = Item.create({ name: "milk", quantity: 1 }).withChanges({ bought: true });
    const updated = bought.withChanges({ bought: false });
    expect(updated.bought).toBe(false);
  });

  it("preserves name, quantity, id, and createdAt when only bought changes", () => {
    const item = Item.create({ name: "milk", quantity: 3 });
    const updated = item.withChanges({ bought: true });
    expect(updated.name).toBe(item.name);
    expect(updated.quantity).toBe(item.quantity);
    expect(updated.id).toBe(item.id);
    expect(updated.createdAt).toBe(item.createdAt);
  });
});
