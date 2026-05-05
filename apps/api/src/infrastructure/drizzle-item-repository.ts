import { asc, desc, eq } from "drizzle-orm";
import type { ItemRepository } from "../application/item-repository.js";
import { Item, ItemNotFoundError } from "../domain/item.js";
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

  async findById(id: string): Promise<Item | undefined> {
    const rows = await this.db.select().from(items).where(eq(items.id, id)).limit(1);
    const row = rows[0];
    return row === undefined ? undefined : toDomain(row);
  }

  async insert(item: Item): Promise<void> {
    await this.db.insert(items).values({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      bought: item.bought,
      createdAt: item.createdAt,
    });
  }

  async update(item: Item): Promise<void> {
    const updated = await this.db
      .update(items)
      .set({ name: item.name, quantity: item.quantity, bought: item.bought })
      .where(eq(items.id, item.id))
      .returning({ id: items.id });
    if (updated.length === 0) {
      throw new ItemNotFoundError(item.id);
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.db.delete(items).where(eq(items.id, id)).returning({ id: items.id });
    if (deleted.length === 0) {
      throw new ItemNotFoundError(id);
    }
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
