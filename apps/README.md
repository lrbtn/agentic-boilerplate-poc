# apps/

This directory will hold:

- `apps/api/` — Hono backend with Drizzle ORM and PostgreSQL
- `apps/web/` — React + Vite frontend with TanStack Query, TanStack Router, and Tailwind

**Do NOT scaffold these manually.** The agent loop creates them during phase 4 (implementation), based on the PRD and the issue backlog.

If you find yourself wanting to scaffold an app manually, stop and ask: "is this something `/ideation` and `/create-prd` should have produced?" If yes, go back to phase 1 and let the system do its job.
