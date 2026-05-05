import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  CreateItemInput,
  ItemId,
  ItemListSchema,
  ItemSchema,
  NotFoundErrorSchema,
  UpdateItemInput,
  ValidationErrorSchema,
} from "./item.js";

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
  updateItem: {
    method: "PATCH",
    path: "/items/:id",
    pathParams: z.object({ id: ItemId }),
    body: UpdateItemInput,
    responses: {
      200: ItemSchema,
      400: ValidationErrorSchema,
      404: NotFoundErrorSchema,
    },
    summary: "Apply a partial update to an Item.",
  },
  deleteItem: {
    method: "DELETE",
    path: "/items/:id",
    pathParams: z.object({ id: ItemId }),
    body: z.void(),
    responses: {
      204: z.void(),
      404: NotFoundErrorSchema,
    },
    summary: "Delete an Item by id.",
  },
});
