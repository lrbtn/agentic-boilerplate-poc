import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Item } from "@app/contracts";
import { apiClient } from "./api-client.js";

const ITEMS_KEY = ["items"] as const;

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previous: readonly Item[] | undefined }>({
    mutationFn: async (id) => {
      const res = await apiClient.deleteItem({ params: { id }, body: undefined });
      if (res.status === 204) return;
      if (res.status === 404) {
        throw new Error(res.body.message);
      }
      throw new Error(`unexpected status ${res.status}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY });
      const previous = queryClient.getQueryData<readonly Item[]>(ITEMS_KEY);
      queryClient.setQueryData<readonly Item[]>(ITEMS_KEY, (old = []) =>
        old.filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<readonly Item[]>(ITEMS_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}
