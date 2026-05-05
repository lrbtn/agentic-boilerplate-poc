import type { ItemRepository } from "./item-repository.js";

export async function deleteItem({
  repo,
  id,
}: {
  repo: ItemRepository;
  id: string;
}): Promise<void> {
  await repo.delete(id);
}
