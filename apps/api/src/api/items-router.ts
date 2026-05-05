import { Hono } from "hono";
import type { ItemRepository } from "../application/item-repository.js";

export function createItemsRouter(_deps: { repo: ItemRepository }): Hono {
  const router = new Hono();
  router.get("/items", (c) => c.json({ error: "not implemented" }, 500));
  return router;
}
