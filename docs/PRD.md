# Product Requirements

## Problem Statement

We need a runnable, end-to-end vertical slice that exercises every layer of the pinned stack — Postgres, Drizzle, Hono, ts-rest, Zod, React, Vite, TanStack Query, TanStack Router, Tailwind, Vitest, Playwright — so we can validate that the agentic SDLC loop produces working code on a real codebase. The slice must be small enough to ship inside the loop yet rich enough that schema, API, and UI concerns are all genuinely involved. The product itself is incidental; the loop's output is the artifact.

## Solution

A single-page Grocery List application. One anonymous Shopper interacts with one shared List per running instance. The Shopper can Add, Edit, Toggle Bought, and Delete Items. Items are persisted in Postgres via Drizzle, exposed through a small ts-rest contract served by Hono, and rendered through a React UI that uses TanStack Query for server state and TanStack Router for the (single) route. The List displays unbought Items first and bought Items below, with each group sorted by recency of creation. All mutations are optimistic with rollback on failure, and all errors surface inline next to the form or row that triggered them.

The PoC is considered successful when a human can demo: open the app, Add three Items, Edit one, Toggle Bought on another, Delete a third — all round-tripping through the database — and the agent loop produced the implementing code.

## User Stories

1. As a Shopper, I want to open the app and immediately see the current List, so that I know what is already on it.
2. As a Shopper, I want to Add an Item by typing a name and quantity and pressing Enter, so that I can build the List quickly.
3. As a Shopper, I want the Add form to clear and refocus the name input after a successful Add, so that I can add several Items in a row without extra clicks.
4. As a Shopper, I want the quantity field to default to `1` after each Add, so that I can submit single-quantity Items without retyping the number.
5. As a Shopper, I want to be told when my Item name is empty or too long, so that I know how to correct it before submitting.
6. As a Shopper, I want to be told when my quantity is missing, non-integer, or out of range, so that I know how to correct it before submitting.
7. As a Shopper, I want newly added Items to appear at the top of the unbought group, so that I get immediate visual confirmation the Add worked.
8. As a Shopper, I want to Edit an Item's name by clicking on it, typing, and pressing Enter or blurring, so that I can correct mistakes without a modal.
9. As a Shopper, I want to Edit an Item's quantity the same way I edit its name, so that the interaction is consistent.
10. As a Shopper, I want to press Esc while editing to discard my change, so that I can back out without committing.
11. As a Shopper, I want the row to stay in place during and after an Edit, so that I do not lose track of which Item I just changed.
12. As a Shopper, I want to Toggle Bought by clicking a checkbox on the row, so that I can mark Items as I shop.
13. As a Shopper, I want a freshly bought Item to move to the top of the bought group, so that the bought group reflects recent activity.
14. As a Shopper, I want to un-toggle a bought Item by clicking the same checkbox again, so that I can recover from a mistaken click.
15. As a Shopper, I want to Delete an Item with a single click on its delete control, so that the demo step is crisp.
16. As a Shopper, I want my Add, Edit, Toggle, and Delete actions to update the UI immediately, so that the app feels responsive.
17. As a Shopper, I want the UI to roll back and show an inline error if a mutation fails on the server, so that I am not lied to about what happened.
18. As a Shopper, I want server-side validation errors to render in the same inline slot as network errors, so that I do not have to look in two places.
19. As a Shopper, I want to see a single line of text saying the List is empty when there are no Items, so that I am not confused by a blank screen.
20. As a Shopper, I want to see the inline error slot populated when the initial fetch fails, so that I know the app is broken and not just slow.
21. As a Shopper, I want my second tab to show the same List as my first tab when I refocus it, so that I do not work off stale data without trying.
22. As an Operator, I want all Item state to live in Postgres, so that restarts of the api process do not lose the List.
23. As an Operator, I want the List to start empty on a fresh database, so that the demo always begins from a known state.
24. As a Reviewer, I want every API endpoint to be defined in a single ts-rest contract shared between server and client, so that the typed end-to-end claim is enforceable.
25. As a Reviewer, I want backend code to follow the layered architecture in `docs/ARCHITECTURE_RULES.md`, so that domain logic is testable without HTTP or a database.
26. As a Reviewer, I want unit tests to cover the domain layer in isolation and integration tests to cover the API + DB path, so that failures point at the responsible layer.
27. As a Reviewer, I want a single Playwright e2e test that walks the demo script (Add three, Edit one, Toggle one, Delete one), so that the PoC has a green-or-red signal for "the slice works".

## Implementation Decisions

### Modules

**Backend (`apps/api`, layered per architecture rules):**

- **Domain — `Item`** — value object / entity with invariants enforced at construction time. Trims and validates `name` (1–80 chars after trim), validates `quantity` (integer 1–999), defaults `bought` to `false` on creation. Pure TS. Tested in isolation. This is the project's deep module: a tiny interface (factory + a couple of mutators) that encapsulates every rule about what a valid Item is.
- **Application — Item use cases** — `addItem`, `editItem`, `toggleBoughtItem`, `deleteItem`, `listItems`. Each depends only on the `ItemRepository` port and the `Item` domain module. No HTTP, no SQL.
- **Application port — `ItemRepository`** — interface with `findAll`, `findById`, `insert`, `update`, `delete`. Returns/accepts `Item` domain objects, not Drizzle rows.
- **Infrastructure — `DrizzleItemRepository`** — implements `ItemRepository` against the `items` table. Maps between domain `Item` and DB rows.
- **API — ts-rest router** — wires the contract from `packages/contracts` to the use cases. One handler per endpoint, each translating HTTP DTO ↔ use case input/output.
- **Composition root** — factory wiring at `apps/api` startup that constructs the repository, injects it into the use cases, and mounts the router on Hono.

**Contracts (`packages/contracts`):**

- **Zod schemas** — `ItemSchema`, `CreateItemInput`, `UpdateItemInput`, `ItemId`. The single source of truth for shape and validation, used by both backend and frontend.
- **ts-rest contract** — declares the four endpoints, their inputs (path/body), and their response shapes. No code generation; consumers import the contract directly.

**Frontend (`apps/web`):**

- **Route — `/`** — TanStack Router root + index route that mounts the List view.
- **`useItems` query hook** — wraps `useQuery(['items'])` against the ts-rest client.
- **Mutation hooks — `useAddItem`, `useEditItem`, `useToggleBought`, `useDeleteItem`** — each implements optimistic update on `onMutate`, rollback on `onError`, and invalidates `['items']` on `onSettled`.
- **`AddItemForm`** — name + quantity inputs, inline error slot, submit on Enter, clears + refocuses name on success, defaults quantity to `1`.
- **`ItemRow`** — renders one Item; click-to-edit on name and quantity; checkbox for bought; delete button; inline error slot for row-scoped failures.
- **`ListView`** — composes `AddItemForm` and a list of `ItemRow`s, handles loading/empty/error branches.

### Schema

One table only:

- `items` — columns: `id` (uuid, primary key, generated), `name` (varchar(80), not null), `quantity` (integer, not null, check 1–999), `bought` (boolean, not null, default false), `created_at` (timestamptz, not null, default `now()`).

No additional tables. No `updated_at`, no `bought_at` — sort uses only `created_at` per the ideation outcome.

### API contract

Four endpoints, all under `/items`:

- `GET /items` — returns all Items, already sorted server-side as `bought ASC, created_at DESC`. Status `200`. Empty list returns `200` with `[]`.
- `POST /items` — body `{ name, quantity }`. Returns the created Item with status `201`. Returns `400` on validation failure with a structured error body.
- `PATCH /items/:id` — body is any non-empty subset of `{ name, quantity, bought }`. Returns the updated Item with status `200`. Returns `400` on validation failure, `404` if the Item does not exist.
- `DELETE /items/:id` — returns `204` on success, `404` if the Item does not exist.

The `PATCH` endpoint is the single mutation surface for Edit name, Edit quantity, and Toggle Bought. There is no separate endpoint for marking an Item bought.

### Sort order

Sort is computed server-side in `listItems` (so the UI never re-sorts):

- Primary: `bought ASC` (unbought first, bought below).
- Secondary: `created_at DESC` (newest first within each group).

### Mutation strategy

All mutations are optimistic:

- On `onMutate`, the `['items']` cache is patched immediately.
- On `onError`, the previous cache snapshot is restored and the error message is written into the relevant inline error slot.
- On `onSettled`, `['items']` is invalidated and refetched.

TanStack Query runs on its defaults (`refetchOnWindowFocus: true`, `staleTime: 0`).

### Validation

- Validation rules live in the Zod schemas in `packages/contracts`.
- The backend validates every request body against those schemas before invoking a use case (the `400` path).
- The frontend validates on submit / blur using the same schemas (the inline error slot path) — the same rules, no drift.
- The `Item` domain module re-asserts the invariants on construction (defense in depth; pure-TS unit tests target this layer).

### UX contract

- Add form: name and quantity inputs side by side. Submit on Enter or click. On success, both fields reset (name to `""`, quantity to `1`) and focus returns to name.
- Item row: name and quantity render as text; clicking either swaps it for an `<input>`; Enter or blur commits via PATCH; Esc cancels and reverts.
- Bought checkbox sits on each row and toggles via PATCH.
- Delete button sits on each row; clicking it issues DELETE immediately, with no confirmation.
- Errors render in a per-form (Add) or per-row (ItemRow) inline slot. No toasts, no modals.
- Empty state: a single line `"No items yet."` below the Add form. Loading state: nothing rendered in the list area. Initial-fetch error: the empty-state slot renders an error message instead.

## Testing Decisions

### What makes a good test here

Tests describe Shopper-visible behavior and contract-visible behavior, never internal call shapes. A refactor that preserves behavior must not break a test. Arrange-Act-Assert. One assertion per test wherever practical.

### Coverage by layer

- **Domain unit tests (Vitest, co-located)** — exhaustive on the `Item` module: name trimming, name length boundaries (0, 1, 80, 81), quantity boundaries (0, 1, 999, 1000), non-integer quantity rejection, `bought` defaulting to `false` on create, toggle behavior. This is the project's deep module and is where the bulk of logic-level tests live.
- **Application use case tests (Vitest, co-located)** — each use case tested against an in-memory fake `ItemRepository` (not a mock). Cover the success path, the not-found path for edit/toggle/delete, and the validation-rejection path that surfaces from the domain module.
- **Infrastructure / repository tests (Vitest, integration, against the docker-compose Postgres)** — verify the `DrizzleItemRepository` correctly persists and retrieves Items, and that `findAll` returns rows in the agreed sort order. Database is reset between tests.
- **API tests (Vitest, integration, in-process Hono + real DB)** — for each endpoint: success path returns the documented status and body; validation failure returns `400` with a structured error; missing-id returns `404` for PATCH and DELETE; `GET /items` returns the sort order produced by the use case.
- **End-to-end test (Playwright, single spec)** — walks the demo script: open the app, Add three Items, Edit one, Toggle Bought on another, Delete the third, assert the final List state. This is the success-criterion test for the PoC.

### Prior art

The boilerplate has not yet scaffolded `apps/api`, `apps/web`, or `packages/contracts` — there is no prior art in this repository for any of the test types above. The first slice that introduces each layer is also responsible for introducing the test harness pattern for that layer (a Vitest setup file for DB-touching tests, a Playwright config that brings up the api + web stack). Subsequent slices follow the pattern set by the first.

## Out of Scope

- Authentication, authorization, sessions, accounts, identity of any kind.
- Multiple Lists, multiple Shoppers, sharing, permissions.
- Real-time sync, websockets, server-sent events. Cross-tab sync is the TanStack Query default and nothing more.
- Mobile-specific UI, responsive breakpoints beyond what Tailwind defaults provide for free.
- Categories, tags, aisles, recipes, store integrations, barcode scanning, history, undo, soft delete, archive.
- Quantity units (kg, oz, "a pinch"). Quantity is an integer, full stop.
- Search, filter, bulk operations, drag-and-drop reordering.
- Toast notifications, modals, dialogs, confirmation prompts. All UI lives inline on the page.
- Any second route. The router is wired but only `/` exists.
- Database migrations beyond the initial `items` table. `pnpm db:push` is sufficient for this PoC's lifetime.
- Internationalization, theming, dark mode.

## Further Notes

- The PoC's purpose is to exercise the agentic SDLC loop on every layer of the pinned stack. Decisions throughout this PRD favor "uses the pinned tool as advertised" over "ships the smallest possible code". TanStack Router gets wired for one route, ts-rest gets a four-endpoint contract, the backend gets four layers of separation — because the agent loop's value is in handling realistic structure, not in producing minimum lines.
- The optimistic-mutation choice intentionally creates a richer test surface (rollback paths) than pessimistic would, while still being well-trodden territory for TanStack Query.
- Vertical slices should each touch schema (where applicable), API, UI, and tests for the slice. The architectural rules forbid endpoint-only or schema-only issues; expect tracer-bullet slices like "Add Item end-to-end" rather than "build the schema, then build the API, then build the UI".
- All decisions in this PRD are traceable to the `/ideation` session that preceded it. If a decision needs to change, run `/update-prd`; do not edit this file directly.
