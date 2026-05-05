import { ItemNotFoundError, type Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export async function editItem({
  repo,
  id,
  changes,
}: {
  repo: ItemRepository;
  id: string;
  changes: { name?: string; quantity?: number };
}): Promise<Item> {
  const existing = await repo.findById(id);
  if (existing === undefined) {
    throw new ItemNotFoundError(id);
  }
  const updated = existing.withChanges(changes);
  await repo.update(updated);
  return updated;
}
