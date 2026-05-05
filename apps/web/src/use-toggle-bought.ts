import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Item } from "@app/contracts";
import { apiClient } from "./api-client.js";

const ITEMS_KEY = ["items"] as const;

export interface ToggleBoughtArgs {
  id: string;
  bought: boolean;
}

export function useToggleBought() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, ToggleBoughtArgs, { previous: readonly Item[] | undefined }>({
    mutationFn: async ({ id, bought }) => {
      const res = await apiClient.updateItem({ params: { id }, body: { bought } });
      if (res.status === 200) return res.body;
      if (res.status === 400 || res.status === 404) {
        throw new Error(res.body.message);
      }
      throw new Error(`unexpected status ${res.status}`);
    },
    onMutate: async ({ id, bought }) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY });
      const previous = queryClient.getQueryData<readonly Item[]>(ITEMS_KEY);
      queryClient.setQueryData<readonly Item[]>(ITEMS_KEY, (old = []) =>
        old.map((i) => (i.id === id ? { ...i, bought } : i)),
      );
      return { previous };
    },
    onError: (_err, _args, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<readonly Item[]>(ITEMS_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}
