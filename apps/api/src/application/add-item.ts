import type { Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function addItem(_args: {
  repo: ItemRepository;
  input: { name: string; quantity: number };
}): Promise<Item> {
  throw new Error("addItem not implemented");
}
