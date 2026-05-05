import { ItemNotFoundError, type Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function toggleBoughtItem({
  repo,
  id,
  bought,
}: {
  repo: ItemRepository;
  id: string;
  bought: boolean;
}): Promise<Item> {
  const existing = await repo.findById(id);
  if (existing === undefined) {
    throw new ItemNotFoundError(id);
  }
  const updated = existing.withChanges({ bought });
  await repo.update(updated);
  return updated;
}
