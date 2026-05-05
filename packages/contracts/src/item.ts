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

export const CreateItemInput = z.object({
  name: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(999),
});

export type CreateItemInput = z.infer<typeof CreateItemInput>;

export const ValidationErrorSchema = z.object({
  error: z.literal("validation"),
  message: z.string(),
});

export const NotFoundErrorSchema = z.object({
  error: z.literal("not_found"),
  message: z.string(),
});
