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

  async findById(_id: string): Promise<Item | undefined> {
    throw new Error("not implemented");
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

  async update(_item: Item): Promise<void> {
    throw new Error("not implemented");
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
