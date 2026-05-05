import { useItems } from "./use-items.js";

export function ListView() {
  const { data, isPending, isError } = useItems();

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-2xl font-semibold">Grocery List</h1>
      {isPending ? null : isError ? (
        <p data-testid="list-error" className="text-red-600">
          Could not load the list. Try again later.
        </p>
      ) : data && data.length === 0 ? (
        <p data-testid="empty-state">No items yet.</p>
      ) : (
        <ul>
          {data?.map((item) => (
            <li key={item.id}>
              {item.name} × {item.quantity}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
