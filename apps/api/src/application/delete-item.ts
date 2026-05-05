import type { ItemRepository } from "./item-repository.js";

export async function deleteItem({
  repo: _repo,
  id: _id,
}: {
  repo: ItemRepository;
  id: string;
}): Promise<void> {
  // Intentionally unimplemented — the failing use-case test drives the implementation.
}
