import { randomUUID } from "node:crypto";

const NAME_MIN = 1;
const NAME_MAX = 80;
const QUANTITY_MIN = 1;
const QUANTITY_MAX = 999;

export class ItemValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemValidationError";
  }
}

export class ItemNotFoundError extends Error {
  constructor(id: string) {
    super(`Item not found: ${id}`);
    this.name = "ItemNotFoundError";
  }
}

export interface ItemSnapshot {
  id: string;
  name: string;
  quantity: number;
  bought: boolean;
  createdAt: Date;
}

export class Item {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly quantity: number,
    public readonly bought: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(input: { name: string; quantity: number }): Item {
    const name = validateName(input.name);
    const quantity = validateQuantity(input.quantity);
    return new Item(randomUUID(), name, quantity, false, new Date());
  }

  static rehydrate(snapshot: ItemSnapshot): Item {
    const name = validateName(snapshot.name);
    const quantity = validateQuantity(snapshot.quantity);
    return new Item(snapshot.id, name, quantity, snapshot.bought, snapshot.createdAt);
  }

  withChanges(_changes: { name?: string; quantity?: number }): Item {
    return this;
  }
}

function validateName(raw: string): string {
  if (typeof raw !== "string") {
    throw new ItemValidationError("name must be a string");
  }
  const trimmed = raw.trim();
  if (trimmed.length < NAME_MIN) {
    throw new ItemValidationError("name must be at least 1 character after trim");
  }
  if (trimmed.length > NAME_MAX) {
    throw new ItemValidationError(`name must be at most ${NAME_MAX} characters after trim`);
  }
  return trimmed;
}

function validateQuantity(raw: number): number {
  if (!Number.isInteger(raw)) {
    throw new ItemValidationError("quantity must be an integer");
  }
  if (raw < QUANTITY_MIN || raw > QUANTITY_MAX) {
    throw new ItemValidationError(
      `quantity must be between ${QUANTITY_MIN} and ${QUANTITY_MAX} inclusive`,
    );
  }
  return raw;
}
