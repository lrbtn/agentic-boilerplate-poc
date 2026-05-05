import { initClient } from "@ts-rest/core";
import { itemsContract } from "@app/contracts";

export const apiClient = initClient(itemsContract, {
  baseUrl: "",
  baseHeaders: {},
});
