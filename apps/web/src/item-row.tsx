import { useState } from "react";
import type { Item } from "@app/contracts";
import { useDeleteItem } from "./use-delete-item.js";

export function ItemRow({ item }: { item: Item }) {
  const [error, setError] = useState<string | null>(null);
  const deleteItem = useDeleteItem();

  function onDelete() {
    setError(null);
    deleteItem.mutate(item.id, {
      onError: (err) => setError(err.message),
    });
  }

  return (
    <li data-testid="item-row" className="flex items-center gap-2 py-1">
      <span className="flex-1">
        {item.name} × {item.quantity}
      </span>
      <button
        type="button"
        data-testid="item-delete"
        aria-label={`delete ${item.name}`}
        onClick={onDelete}
        className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        ×
      </button>
      {error ? (
        <p data-testid="item-error" className="basis-full text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </li>
  );
}
