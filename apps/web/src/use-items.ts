import { useQuery } from "@tanstack/react-query";
import type { Item } from "@app/contracts";
import { apiClient } from "./api-client.js";

export function useItems() {
  return useQuery<readonly Item[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await apiClient.listItems();
      if (res.status !== 200) {
        throw new Error(`unexpected status ${res.status}`);
      }
      return res.body;
    },
  });
}
