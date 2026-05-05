import { useRef, useState, type FormEvent } from "react";
import { CreateItemInput } from "@app/contracts";
import { useAddItem } from "./use-add-item.js";

export function AddItemForm() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const addItem = useAddItem();

  function reset() {
    setName("");
    setQuantity("1");
    nameRef.current?.focus();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = CreateItemInput.safeParse({ name, quantity: Number(quantity) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "invalid input");
      return;
    }
    addItem.mutate(parsed.data, {
      onSuccess: () => reset(),
      onError: (err) => setError(err.message),
    });
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 flex items-start gap-2">
      <input
        ref={nameRef}
        data-testid="add-name"
        aria-label="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded border px-2 py-1"
        placeholder="Item name"
      />
      <input
        data-testid="add-quantity"
        aria-label="quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-20 rounded border px-2 py-1"
        min={1}
        max={999}
      />
      <button
        data-testid="add-submit"
        type="submit"
        className="rounded bg-slate-800 px-3 py-1 text-white"
      >
        Add
      </button>
      {error ? (
        <p data-testid="add-error" className="basis-full text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
