import type { Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function toggleBoughtItem(_args: {
  repo: ItemRepository;
  id: string;
  bought: boolean;
}): Promise<Item> {
  throw new Error("not implemented");
}
