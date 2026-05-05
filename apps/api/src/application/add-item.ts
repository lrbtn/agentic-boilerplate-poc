import { Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function addItem({
  repo,
  input,
}: {
  repo: ItemRepository;
  input: { name: string; quantity: number };
}): Promise<Item> {
  const item = Item.create(input);
  await repo.insert(item);
  return item;
}
