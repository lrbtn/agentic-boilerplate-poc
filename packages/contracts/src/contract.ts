import { initContract } from "@ts-rest/core";
import { CreateItemInput, ItemListSchema, ItemSchema, ValidationErrorSchema } from "./item.js";

const c = initContract();

export const itemsContract = c.router({
  listItems: {
    method: "GET",
    path: "/items",
    responses: {
      200: ItemListSchema,
    },
    summary: "List all Items, sorted bought ASC then created_at DESC.",
  },
  createItem: {
    method: "POST",
    path: "/items",
    body: CreateItemInput,
    responses: {
      201: ItemSchema,
      400: ValidationErrorSchema,
    },
    summary: "Create a new Item.",
  },
});
