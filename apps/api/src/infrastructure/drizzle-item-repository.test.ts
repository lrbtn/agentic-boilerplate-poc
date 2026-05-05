import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Pool } from "pg";
import { createDb, createPool } from "./db.js";
import { items } from "./schema.js";
import { DrizzleItemRepository } from "./drizzle-item-repository.js";

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
