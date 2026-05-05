# Project — Agentic SDLC

> This file is the project's constitution. It is read by Claude Code at the start of every session and by the agent loop on every iteration. Keep it under 500 lines.

## Status of this template

This file is a **boilerplate placeholder**. When you start a new project, replace the bracketed sections below with concrete project values during phase 1 (`/ideation`) and phase 2 (`/create-prd`). Do not delete sections — just fill them in.

## Stack

- pnpm monorepo (workspaces in `pnpm-workspace.yaml`)
- `apps/` — application code (filled in during PRD phase)
- `packages/contracts` — shared types and schemas (created when needed)
- Tests: Vitest (unit), Playwright (e2e)

[Update with concrete versions during /create-prd]

## Critical commands

- `pnpm dev` — start everything locally (docker-compose + apps)
- `pnpm test` — run all tests
- `pnpm typecheck` — types across the monorepo
- `pnpm lint` — eslint
- `pnpm verify` — typecheck + test + lint (the full feedback loop run by the agent before every commit)

## Workflow constitution

- We work in TDD red→green→refactor. Always.
- We work in vertical slices (tracer bullets). NEVER horizontal.
- Branch per issue: `afk/issue-<num>` or `burst/<num>` or `bugfix/issue-<num>`.
- Commit format: `test(red): ...`, `feat(green): ...`, `fix(green): ...`, `refactor: ...`, `docs: ...`, `chore(manual): ...`.
- One PR per issue. PR links the issue with "Closes #<num>".
- The `tdd-pattern-check` hook will block commits that violate the red→green pattern.

## Where the rules live

- Architecture rules → `docs/ARCHITECTURE_RULES.md`
- Domain glossary → `docs/GLOSSARY.md`
- Decisions → `docs/ADRs/`
- Product spec → `docs/PRD.md`

## Boundaries (hard rules for the agent)

- NEVER modify `docs/PRD.md` without an explicit `/update-prd` command from a human.
- NEVER modify `docs/ARCHITECTURE_RULES.md` without an explicit human request.
- NEVER skip TDD steps — the `tdd-pattern-check` hook will block you.
- Tests live in `src/**/*.test.ts` (co-located) for unit tests; `test/e2e/` for e2e.
- If you find a bug not related to your current issue, open a new issue with `/qa-fail`. Do NOT fix it inline.
- If you're stuck for more than 3 attempts on the same test, set the issue to label `stuck` and stop the iteration.

## Phase awareness

The agent loop operates in **phase 4** (implementation). Phases 1–3 (ideation, PRD, issues) are human-driven. Phase 5 (QA + close) is human-driven. The agent does not run skills like `/ideation` or `/create-prd` autonomously.
