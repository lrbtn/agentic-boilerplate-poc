import { ItemNotFoundError, type Item } from "../domain/item.js";
import type { ItemRepository } from "./item-repository.js";

export class InMemoryItemRepository implements ItemRepository {
  private items: Item[];

  constructor(seed: readonly Item[] = []) {
    this.items = [...seed];
  }

  async findAll(): Promise<readonly Item[]> {
    return [...this.items];
  }

  async insert(item: Item): Promise<void> {
    this.items.push(item);
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new ItemNotFoundError(id);
    }
    this.items.splice(index, 1);
  }
}
