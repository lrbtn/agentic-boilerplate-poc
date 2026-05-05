import { Hono } from "hono";
import { CreateItemInput, ItemId, ItemListSchema, ItemSchema, itemsContract } from "@app/contracts";
import { addItem } from "../application/add-item.js";
import { deleteItem } from "../application/delete-item.js";
import type { ItemRepository } from "../application/item-repository.js";
import { listItems } from "../application/list-items.js";
import { ItemNotFoundError, ItemValidationError, type Item } from "../domain/item.js";

export function createItemsRouter({ repo }: { repo: ItemRepository }): Hono {
  const router = new Hono();

  router.get(itemsContract.listItems.path, async (c) => {
    const items = await listItems({ repo });
    const body = ItemListSchema.parse(items.map(toResponse));
    return c.json(body, 200);
  });

  router.post(itemsContract.createItem.path, async (c) => {
    const raw: unknown = await c.req.json().catch(() => undefined);
    const parsed = CreateItemInput.safeParse(raw);
    if (!parsed.success) {
      return c.json(
        { error: "validation" as const, message: parsed.error.issues[0]?.message ?? "invalid input" },
        400,
      );
    }
    try {
      const item = await addItem({ repo, input: parsed.data });
      return c.json(ItemSchema.parse(toResponse(item)), 201);
    } catch (err) {
      if (err instanceof ItemValidationError) {
        return c.json({ error: "validation" as const, message: err.message }, 400);
      }
      throw err;
    }
  });

  router.delete(itemsContract.deleteItem.path, async (c) => {
    const idParam = c.req.param("id");
    const parsedId = ItemId.safeParse(idParam);
    if (!parsedId.success) {
      return c.json({ error: "not_found" as const, message: `Item not found: ${idParam}` }, 404);
    }
    try {
      await deleteItem({ repo, id: parsedId.data });
      return c.body(null, 204);
    } catch (err) {
      if (err instanceof ItemNotFoundError) {
        return c.json({ error: "not_found" as const, message: err.message }, 404);
      }
      throw err;
    }
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
