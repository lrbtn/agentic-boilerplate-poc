import { Hono } from "hono";
import { ItemListSchema, itemsContract } from "@app/contracts";
import type { ItemRepository } from "../application/item-repository.js";
import { listItems } from "../application/list-items.js";
import type { Item } from "../domain/item.js";

export function createItemsRouter({ repo }: { repo: ItemRepository }): Hono {
  const router = new Hono();

  router.get(itemsContract.listItems.path, async (c) => {
    const items = await listItems({ repo });
    const body = ItemListSchema.parse(items.map(toResponse));
    return c.json(body, 200);
  });

  return router;
}

function toResponse(item: Item): unknown {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    bought: item.bought,
    createdAt: item.createdAt.toISOString(),
  };
}
