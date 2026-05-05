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
