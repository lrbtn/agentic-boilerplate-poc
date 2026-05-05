// Implemented in TDD cycle 2.
export class ItemValidationError extends Error {}

export class Item {
  static create(_input: { name: string; quantity: number }): Item {
    throw new Error("Item.create not implemented");
  }
  readonly id!: string;
  readonly name!: string;
  readonly quantity!: number;
  readonly bought!: boolean;
  readonly createdAt!: Date;
}
