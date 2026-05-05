import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Item, UpdateItemInput } from "@app/contracts";
import { UpdateItemInput as UpdateItemInputSchema } from "@app/contracts";
import { useDeleteItem } from "./use-delete-item.js";
import { useEditItem } from "./use-edit-item.js";
import { useToggleBought } from "./use-toggle-bought.js";

type EditingField = "name" | "quantity" | null;

export function ItemRow({ item }: { item: Item }) {
  const [editing, setEditing] = useState<EditingField>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editItem = useEditItem();
  const deleteItem = useDeleteItem();
  const toggleBought = useToggleBought();

  useEffect(() => {
    if (editing !== null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditingName() {
    setError(null);
    setDraft(item.name);
    setEditing("name");
  }

  function startEditingQuantity() {
    setError(null);
    setDraft(String(item.quantity));
    setEditing("quantity");
  }

  function cancel() {
    setEditing(null);
    setError(null);
  }

  function commit() {
    if (editing === null) return;
    const changes: UpdateItemInput =
      editing === "name" ? { name: draft } : { quantity: Number(draft) };
    const parsed = UpdateItemInputSchema.safeParse(changes);
    if (!parsed.success) {
      setEditing(null);
      setError(parsed.error.issues[0]?.message ?? "invalid input");
      return;
    }
    editItem.mutate(
      { id: item.id, changes: parsed.data },
      {
        onSuccess: () => {
          setEditing(null);
          setError(null);
        },
        onError: (err) => {
          setEditing(null);
          setError(err.message);
        },
      },
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  function onDelete() {
    setError(null);
    deleteItem.mutate(item.id, {
      onError: (err) => setError(err.message),
    });
  }

  function onToggleBought() {
    setError(null);
    toggleBought.mutate(
      { id: item.id, bought: !item.bought },
      { onError: (err) => setError(err.message) },
    );
  }

  return (
    <li data-testid="item-row" className="flex flex-wrap items-center gap-2 py-1">
      <input
        type="checkbox"
        data-testid="item-bought"
        aria-label={`mark ${item.name} as bought`}
        checked={item.bought}
        onChange={onToggleBought}
        className="h-4 w-4 cursor-pointer"
      />
      {editing === "name" ? (
        <input
          ref={inputRef}
          data-testid="item-name-input"
          aria-label={`edit name of ${item.name}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          className="flex-1 rounded border px-2 py-1"
        />
      ) : (
        <button
          type="button"
          data-testid="item-name"
          onClick={startEditingName}
          className="flex-1 cursor-text text-left"
        >
          {item.name}
        </button>
      )}
      <span aria-hidden>×</span>
      {editing === "quantity" ? (
        <input
          ref={inputRef}
          data-testid="item-quantity-input"
          aria-label={`edit quantity of ${item.name}`}
          type="number"
          min={1}
          max={999}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          className="w-20 rounded border px-2 py-1"
        />
      ) : (
        <button
          type="button"
          data-testid="item-quantity"
          onClick={startEditingQuantity}
          className="w-12 cursor-text text-left tabular-nums"
        >
          {item.quantity}
        </button>
      )}
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
