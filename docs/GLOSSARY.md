# Domain Glossary

> Canonical vocabulary for the Grocery List PoC. Read by the agent loop on every iteration. All code, tests, commits, and docs use these terms consistently.

## Core entities

- **Item** — a single entry on the List. Has a `name` (string, trimmed, 1–80 chars), a `quantity` (integer, 1–999), a `bought` flag (boolean), and a `createdAt` timestamp. Identified by an opaque `id`.
- **List** — the ordered collection of Items. There is exactly one List per running instance, shared across all visitors. Not a persisted entity itself — derived by reading all Items.
- **Shopper** — the anonymous person interacting with the List. There is no authentication, no identity, and no per-Shopper state. Use this term instead of "user" when describing UI interactions.

## Actions / use cases

- **Add Item** — create a new Item with a name and quantity. Newly added Items are unbought by default.
- **Edit Item** — change an Item's name and/or quantity after it has been added.
- **Toggle Bought** — flip an Item's `bought` flag in either direction.
- **Delete Item** — permanently remove an Item from the List.
- **View List** — fetch and render all Items, ordered with unbought Items first, then bought Items, each group sorted by `createdAt` descending.

## Out-of-domain terms (DO NOT use in this codebase)

- **User** — too vague. Use **Shopper** for the human at the keyboard, or omit entirely (most domain logic is Shopper-agnostic).
- **Task / Todo / Done / Complete** — this is a grocery list, not a task tracker. Use **Item** and **bought**, never "task" or "complete".
- **Cart / Basket / Checkout** — no commerce semantics. The List is not a cart.
- **Category / Tag / Aisle** — Items are uncategorized. Do not introduce grouping concepts.

## Examples of correct vs incorrect usage

- ✅ "the Shopper marks an Item as bought"
- ❌ "the user completes the task"
- ✅ "Add Item validation rejects empty names"
- ❌ "create todo validation rejects empty titles"
- ✅ "the List renders unbought Items first"
- ❌ "the cart shows pending items at the top"
