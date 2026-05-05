import type { Item } from "../domain/item.js";

export interface ItemRepository {
  findAll(): Promise<readonly Item[]>;
  insert(item: Item): Promise<void>;
  delete(id: string): Promise<void>;
}
