# apps/

This directory holds application code.

**Do NOT commit anything here manually.** Application code is created by the agent loop during phase 4 (implementation), based on the PRD and the issue backlog.

When the loop completes its first iteration that touches a new app, you will see directories appear here: `apps/api/`, `apps/web/`, `apps/worker/`, etc. — depending on what the PRD called for.

If you find yourself wanting to scaffold an app manually, stop and ask: "is this something `/ideation` and `/create-prd` should have produced?" If yes, go back to phase 1 and let the system do its job.
