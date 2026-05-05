import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Item, UpdateItemInput } from "@app/contracts";
import { apiClient } from "./api-client.js";

const ITEMS_KEY = ["items"] as const;

export interface EditItemArgs {
  id: string;
  changes: UpdateItemInput;
}

export function useEditItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, EditItemArgs, { previous: readonly Item[] | undefined }>({
    mutationFn: async ({ id, changes }) => {
      const res = await apiClient.updateItem({ params: { id }, body: changes });
      if (res.status === 200) return res.body;
      if (res.status === 400 || res.status === 404) {
        throw new Error(res.body.message);
      }
      throw new Error(`unexpected status ${res.status}`);
    },
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY });
      const previous = queryClient.getQueryData<readonly Item[]>(ITEMS_KEY);
      queryClient.setQueryData<readonly Item[]>(ITEMS_KEY, (old = []) =>
        old.map((i) =>
          i.id === id
            ? {
                ...i,
                ...(changes.name !== undefined ? { name: changes.name.trim() } : {}),
                ...(changes.quantity !== undefined ? { quantity: changes.quantity } : {}),
              }
            : i,
        ),
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
