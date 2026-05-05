import type { Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function listItems(_deps: { repo: ItemRepository }): Promise<readonly Item[]> {
  throw new Error("listItems not implemented");
}
