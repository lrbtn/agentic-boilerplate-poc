import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ItemListSchema } from "@app/contracts";
import { createApp } from "../main.js";
import { createDb, createPool } from "../infrastructure/db.js";
import { items } from "../infrastructure/schema.js";

const pool = createPool();
const db = createDb(pool);
const app = createApp({ db });

beforeEach(async () => {
  await db.delete(items);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /items", () => {
  it("returns 200 with [] on a fresh database", async () => {
    const res = await app.request("/items");
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    expect(body).toEqual([]);
    expect(ItemListSchema.parse(body)).toEqual([]);
  });

  it("returns rows in sort order with the contract-shaped body", async () => {
    await db.insert(items).values([
      { name: "u-old", quantity: 1, bought: false, createdAt: new Date("2026-01-01") },
      { name: "u-new", quantity: 2, bought: false, createdAt: new Date("2026-01-05") },
      { name: "b", quantity: 3, bought: true, createdAt: new Date("2026-01-02") },
    ]);
    const res = await app.request("/items");
    expect(res.status).toBe(200);
    const body = ItemListSchema.parse(await res.json());
    expect(body.map((i) => i.name)).toEqual(["u-new", "u-old", "b"]);
    expect(body[0]?.quantity).toBe(2);
    expect(body[2]?.bought).toBe(true);
  });
});
