# Architecture Rules

> Mandatory architectural rules for this project. Read by the agent loop on every iteration. The agent treats these as non-negotiable.
>
> **Edit these only with explicit human approval.** They are foundational. The boilerplate ships sensible defaults — refine to match your project's stack and conventions during phase 1–2, then leave alone.

## Clean Architecture

For backend services (e.g. NestJS, Hono, Express):

- **Domain layer** — entities, value objects, domain services. Pure TS, no framework dependencies. No imports from infrastructure or API layers.
- **Application layer** — use cases. Depends on domain only. Defines ports (interfaces) for I/O.
- **Infrastructure layer** — DB drivers, HTTP clients, file system, queues. Implements ports defined in domain/application.
- **API layer** — controllers, request DTOs, response shaping. Translates HTTP/RPC to use case invocations.

**Layer dependency rule:** `domain ← application ← infrastructure, api`. Never the reverse.

For frontend:

- **State** — server state via TanStack Query (or equivalent), UI state via local hooks or a small store
- **Components** — presentational components are pure (props in, JSX out), container components own data fetching
- **API client** — generated from contracts (e.g. ts-rest, orval), never hand-written

## Deep modules

Following Ousterhout's "A Philosophy of Software Design": prefer deep modules over shallow.

- A deep module has a **simple interface** that **encapsulates significant functionality**.
- Prefer few exported functions with rich behavior over many exports with thin behavior.
- If a module has 8+ exports, it is probably shallow — split or refactor.
- Hide implementation details behind named exports. Don't re-export everything.

## TDD is mandatory

The agent loop enforces this technically (via `tdd-pattern-check` hook), not just by convention.

- **RED** — write the failing test FIRST. Commit with `test(red): <what>`.
- **Confirm the test fails for the RIGHT reason** — not import error, not typo. The agent must run the test and observe a real assertion failure.
- **GREEN** — minimal implementation to make the test pass. Commit with `feat(green): <what>` or `fix(green): <what>` (for bug issues).
- **REFACTOR** — only after green. Each refactor commit must keep all tests green.

## Test quality

- Test EXTERNAL behavior, not implementation details. A refactor that keeps behavior identical should not break a test.
- One assertion per test (ideal). More than 3 assertions = the test is doing too much.
- Arrange-Act-Assert structure.
- Prefer fakes/stubs over mocks. Never mock the thing under test.
- E2E tests cover vertical slices end-to-end (Playwright, in `test/e2e/`).
- Unit tests live next to their subject (`src/**/*.test.ts`).

## Vertical slices

Every issue must touch the layers it needs to deliver end-to-end behavior:

- Schema (if applicable) → API → UI → tests for the slice
- An issue that only adds endpoints without UI integration is INVALID
- An issue that only adds DB tables without API exposure is INVALID
- Exception: pure infra issues (CI, build config, dev tooling) are allowed but rare

## Commit conventions

- `test(red): <what>` — failing test, no implementation
- `feat(green): <what>` — implementation that makes a red test pass (closes #N)
- `fix(green): <what>` — bugfix implementation that makes a red test pass (closes #N for bugs)
- `refactor: <what>` — no behavior change, all tests still pass
- `docs: <what>` — documentation only
- `chore(manual): <what>` — manual human commit (typo fix, emergency fix not via the loop)

## Forbidden in code

- `any` without justification comment
- `@ts-ignore` / `@ts-expect-error` without justification comment
- `console.log` / `console.debug` / `debugger` in committed code
- Committed `TODO` / `FIXME` markers without an associated issue number
- Cyclic imports between layers
