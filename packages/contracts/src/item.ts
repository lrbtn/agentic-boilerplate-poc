import { z } from "zod";

export const ItemId = z.string().uuid();

export const ItemSchema = z.object({
  id: ItemId,
  name: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(999),
  bought: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Item = z.infer<typeof ItemSchema>;

export const ItemListSchema = z.array(ItemSchema);
