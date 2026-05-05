import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Pool } from "pg";
import { createDb, createPool } from "./db.js";
import { items } from "./schema.js";
import { DrizzleItemRepository } from "./drizzle-item-repository.js";
import { Item, ItemNotFoundError } from "../domain/item.js";

const pool: Pool = createPool();
const db = createDb(pool);
const repo = new DrizzleItemRepository(db);

beforeEach(async () => {
  await db.delete(items);
});

afterAll(async () => {
  await pool.end();
});

describe("DrizzleItemRepository.findAll", () => {
  it("returns an empty array on a fresh table", async () => {
    expect(await repo.findAll()).toEqual([]);
  });

  it("returns inserted Items as domain Items with full fields", async () => {
    const now = new Date("2026-01-01T00:00:00Z");
    await db.insert(items).values({ name: "milk", quantity: 2, bought: false, createdAt: now });
    const result = await repo.findAll();
    expect(result).toHaveLength(1);
    const [only] = result;
    expect(only?.name).toBe("milk");
    expect(only?.quantity).toBe(2);
    expect(only?.bought).toBe(false);
    expect(only?.createdAt.toISOString()).toBe(now.toISOString());
    expect(typeof only?.id).toBe("string");
  });

  it("returns rows in bought ASC, created_at DESC order", async () => {
    await db.insert(items).values([
      { name: "u-old", quantity: 1, bought: false, createdAt: new Date("2026-01-01") },
      { name: "u-new", quantity: 1, bought: false, createdAt: new Date("2026-01-05") },
      { name: "b-old", quantity: 1, bought: true, createdAt: new Date("2026-01-02") },
      { name: "b-new", quantity: 1, bought: true, createdAt: new Date("2026-01-04") },
    ]);
    const names = (await repo.findAll()).map((i) => i.name);
    expect(names).toEqual(["u-new", "u-old", "b-new", "b-old"]);
  });
});

describe("DrizzleItemRepository.insert", () => {
  it("persists a new Item so findAll returns it with full fields", async () => {
    const item = Item.create({ name: "milk", quantity: 2 });
    await repo.insert(item);
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    const [only] = all;
    expect(only?.id).toBe(item.id);
    expect(only?.name).toBe("milk");
    expect(only?.quantity).toBe(2);
    expect(only?.bought).toBe(false);
    expect(only?.createdAt.toISOString()).toBe(item.createdAt.toISOString());
  });
});

describe("DrizzleItemRepository.delete", () => {
  it("removes the row with the given id", async () => {
    const item = Item.create({ name: "milk", quantity: 1 });
    await repo.insert(item);
    await repo.delete(item.id);
    expect(await repo.findAll()).toEqual([]);
  });

  it("leaves other rows untouched", async () => {
    const target = Item.create({ name: "milk", quantity: 1 });
    const survivor = Item.create({ name: "bread", quantity: 1 });
    await repo.insert(target);
    await repo.insert(survivor);
    await repo.delete(target.id);
    const remaining = await repo.findAll();
    expect(remaining.map((i) => i.id)).toEqual([survivor.id]);
  });

  it("throws ItemNotFoundError when no row matches the id", async () => {
    await expect(
      repo.delete("00000000-0000-0000-0000-000000000000"),
    ).rejects.toThrow(ItemNotFoundError);
  });
});
