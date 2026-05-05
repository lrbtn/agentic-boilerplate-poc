import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateItemInput, Item } from "@app/contracts";
import { apiClient } from "./api-client.js";

const ITEMS_KEY = ["items"] as const;

const PENDING_ID_PREFIX = "pending:";

function makePendingItem(input: CreateItemInput): Item {
  return {
    id: `${PENDING_ID_PREFIX}${crypto.randomUUID()}`,
    name: input.name.trim(),
    quantity: input.quantity,
    bought: false,
    createdAt: new Date().toISOString(),
  };
}

export function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemInput, { previous: readonly Item[] | undefined }>({
    mutationFn: async (input) => {
      const res = await apiClient.createItem({ body: input });
      if (res.status === 201) return res.body;
      if (res.status === 400) {
        throw new Error(res.body.message);
      }
      throw new Error(`unexpected status ${res.status}`);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY });
      const previous = queryClient.getQueryData<readonly Item[]>(ITEMS_KEY);
      const optimistic = makePendingItem(input);
      queryClient.setQueryData<readonly Item[]>(ITEMS_KEY, (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<readonly Item[]>(ITEMS_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}
