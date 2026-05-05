import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  ItemListSchema,
  ItemSchema,
  NotFoundErrorSchema,
  ValidationErrorSchema,
} from "@app/contracts";
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

async function postItem(body: unknown): Promise<Response> {
  return app.request("/items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /items", () => {
  it("returns 201 with the created Item on a valid body", async () => {
    const res = await postItem({ name: "milk", quantity: 2 });
    expect(res.status).toBe(201);
    const body = ItemSchema.parse(await res.json());
    expect(body.name).toBe("milk");
    expect(body.quantity).toBe(2);
    expect(body.bought).toBe(false);
  });

  it("persists the new Item so a subsequent GET returns it", async () => {
    const created = ItemSchema.parse(await (await postItem({ name: "bread", quantity: 1 })).json());
    const list = ItemListSchema.parse(await (await app.request("/items")).json());
    expect(list.map((i) => i.id)).toContain(created.id);
  });

  it("trims surrounding whitespace from the name before persisting", async () => {
    const res = await postItem({ name: "  eggs  ", quantity: 1 });
    expect(res.status).toBe(201);
    const body = ItemSchema.parse(await res.json());
    expect(body.name).toBe("eggs");
  });

  it.each([
    { case: "empty name", body: { name: "", quantity: 1 } },
    { case: "whitespace-only name", body: { name: "   ", quantity: 1 } },
    { case: "name longer than 80", body: { name: "a".repeat(81), quantity: 1 } },
    { case: "quantity 0", body: { name: "milk", quantity: 0 } },
    { case: "quantity 1000", body: { name: "milk", quantity: 1000 } },
    { case: "non-integer quantity", body: { name: "milk", quantity: 1.5 } },
  ])("returns 400 with a structured error on $case", async ({ body }) => {
    const res = await postItem(body);
    expect(res.status).toBe(400);
    const parsed = ValidationErrorSchema.parse(await res.json());
    expect(parsed.error).toBe("validation");
    expect(parsed.message.length).toBeGreaterThan(0);
  });

  it("does not persist Items rejected by validation", async () => {
    await postItem({ name: "", quantity: 1 });
    const list = ItemListSchema.parse(await (await app.request("/items")).json());
    expect(list).toEqual([]);
  });
});

describe("DELETE /items/:id", () => {
  it("returns 204 with no body and removes the Item", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    const res = await app.request(`/items/${created.id}`, { method: "DELETE" });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    const list = ItemListSchema.parse(await (await app.request("/items")).json());
    expect(list.map((i) => i.id)).not.toContain(created.id);
  });

  it("returns 404 with a structured error when the Item does not exist", async () => {
    const res = await app.request("/items/00000000-0000-0000-0000-000000000000", {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
    const body = NotFoundErrorSchema.parse(await res.json());
    expect(body.error).toBe("not_found");
    expect(body.message.length).toBeGreaterThan(0);
  });

  it("only removes the targeted Item", async () => {
    const a = ItemSchema.parse(await (await postItem({ name: "milk", quantity: 1 })).json());
    const b = ItemSchema.parse(await (await postItem({ name: "bread", quantity: 1 })).json());
    const res = await app.request(`/items/${a.id}`, { method: "DELETE" });
    expect(res.status).toBe(204);
    const list = ItemListSchema.parse(await (await app.request("/items")).json());
    expect(list.map((i) => i.id)).toEqual([b.id]);
  });
});

async function patchItem(id: string, body: unknown): Promise<Response> {
  return app.request(`/items/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /items/:id", () => {
  it("returns 200 with the updated Item on a name change", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    const res = await patchItem(created.id, { name: "soy milk" });
    expect(res.status).toBe(200);
    const body = ItemSchema.parse(await res.json());
    expect(body.id).toBe(created.id);
    expect(body.name).toBe("soy milk");
    expect(body.quantity).toBe(1);
  });

  it("returns 200 with the updated Item on a quantity change", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    const res = await patchItem(created.id, { quantity: 5 });
    expect(res.status).toBe(200);
    const body = ItemSchema.parse(await res.json());
    expect(body.quantity).toBe(5);
    expect(body.name).toBe("milk");
  });

  it("trims the new name before persisting", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    const res = await patchItem(created.id, { name: "  bread  " });
    expect(res.status).toBe(200);
    const body = ItemSchema.parse(await res.json());
    expect(body.name).toBe("bread");
  });

  it("preserves bought and createdAt across the update", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    const res = await patchItem(created.id, { name: "bread" });
    const body = ItemSchema.parse(await res.json());
    expect(body.bought).toBe(false);
    expect(body.createdAt).toBe(created.createdAt);
  });

  it("returns 404 with a structured error when the Item does not exist", async () => {
    const res = await patchItem("00000000-0000-0000-0000-000000000000", { name: "milk" });
    expect(res.status).toBe(404);
    const body = NotFoundErrorSchema.parse(await res.json());
    expect(body.error).toBe("not_found");
  });

  it.each([
    { case: "empty body", body: {} },
    { case: "empty name", body: { name: "" } },
    { case: "name longer than 80", body: { name: "a".repeat(81) } },
    { case: "quantity 0", body: { quantity: 0 } },
    { case: "quantity 1000", body: { quantity: 1000 } },
    { case: "non-integer quantity", body: { quantity: 1.5 } },
    { case: "unknown field", body: { name: "ok", colour: "blue" } },
  ])("returns 400 with a structured error on $case", async ({ body }) => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    const res = await patchItem(created.id, body);
    expect(res.status).toBe(400);
    const parsed = ValidationErrorSchema.parse(await res.json());
    expect(parsed.error).toBe("validation");
    expect(parsed.message.length).toBeGreaterThan(0);
  });

  it("does not persist a rejected change", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    await patchItem(created.id, { name: "" });
    const list = ItemListSchema.parse(await (await app.request("/items")).json());
    const persisted = list.find((i) => i.id === created.id);
    expect(persisted?.name).toBe("milk");
  });

  it("returns 200 with bought=true after a toggle", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    const res = await patchItem(created.id, { bought: true });
    expect(res.status).toBe(200);
    const body = ItemSchema.parse(await res.json());
    expect(body.bought).toBe(true);
    expect(body.name).toBe("milk");
    expect(body.quantity).toBe(1);
  });

  it("returns 200 with bought=false after un-toggling", async () => {
    const created = ItemSchema.parse(
      await (await postItem({ name: "milk", quantity: 1 })).json(),
    );
    await patchItem(created.id, { bought: true });
    const res = await patchItem(created.id, { bought: false });
    expect(res.status).toBe(200);
    const body = ItemSchema.parse(await res.json());
    expect(body.bought).toBe(false);
  });

  it("moves a freshly-bought Item to the bought group in GET /items", async () => {
    const a = ItemSchema.parse(await (await postItem({ name: "a", quantity: 1 })).json());
    const b = ItemSchema.parse(await (await postItem({ name: "b", quantity: 1 })).json());
    await patchItem(a.id, { bought: true });
    const list = ItemListSchema.parse(await (await app.request("/items")).json());
    expect(list.map((i) => i.id)).toEqual([b.id, a.id]);
    expect(list.find((i) => i.id === a.id)?.bought).toBe(true);
  });

  it("returns 404 with a structured error when toggling a missing Item", async () => {
    const res = await patchItem("00000000-0000-0000-0000-000000000000", { bought: true });
    expect(res.status).toBe(404);
    const body = NotFoundErrorSchema.parse(await res.json());
    expect(body.error).toBe("not_found");
  });
});
