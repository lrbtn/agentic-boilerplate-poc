import type { Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function listItems({ repo }: { repo: ItemRepository }): Promise<readonly Item[]> {
  const items = await repo.findAll();
  return [...items].sort(compareForList);
}

function compareForList(a: Item, b: Item): number {
  if (a.bought !== b.bought) return a.bought ? 1 : -1;
  return b.createdAt.getTime() - a.createdAt.getTime();
}
