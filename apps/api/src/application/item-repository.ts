import type { Item } from "../domain/item.js";

export interface ItemRepository {
  findAll(): Promise<readonly Item[]>;
  findById(id: string): Promise<Item | undefined>;
  insert(item: Item): Promise<void>;
  update(item: Item): Promise<void>;
  delete(id: string): Promise<void>;
}
