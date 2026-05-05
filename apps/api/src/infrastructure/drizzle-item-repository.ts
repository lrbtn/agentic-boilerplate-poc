import type { ItemRepository } from "../application/item-repository.js";
import type { Item } from "../domain/item.js";
import type { AppDatabase } from "./db.js";

export class DrizzleItemRepository implements ItemRepository {
  constructor(private readonly _db: AppDatabase) {}

  async findAll(): Promise<readonly Item[]> {
    throw new Error("DrizzleItemRepository.findAll not implemented");
  }
}
