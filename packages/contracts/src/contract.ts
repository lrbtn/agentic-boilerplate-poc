import { initContract } from "@ts-rest/core";
import { ItemListSchema } from "./item.js";

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
});
