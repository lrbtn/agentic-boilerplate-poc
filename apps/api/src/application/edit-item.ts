import type { Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function editItem(_args: {
  repo: ItemRepository;
  id: string;
  changes: { name?: string; quantity?: number };
}): Promise<Item> {
  // Intentionally unimplemented — the failing use-case test drives the implementation.
  throw new Error("not implemented");
}
