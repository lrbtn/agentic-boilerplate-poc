import { asc, desc } from "drizzle-orm";
import type { ItemRepository } from "../application/item-repository.js";
import { Item } from "../domain/item.js";
import type { AppDatabase } from "./db.js";
import { items, type ItemRow } from "./schema.js";

export class DrizzleItemRepository implements ItemRepository {
  constructor(private readonly db: AppDatabase) {}

  async findAll(): Promise<readonly Item[]> {
    const rows = await this.db
      .select()
      .from(items)
      .orderBy(asc(items.bought), desc(items.createdAt));
    return rows.map(toDomain);
  }
}

function toDomain(row: ItemRow): Item {
  return Item.rehydrate({
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    bought: row.bought,
    createdAt: row.createdAt,
  });
}
