import type { Item } from "../domain/item.js";

export interface ItemRepository {
  findAll(): Promise<readonly Item[]>;
}
