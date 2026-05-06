# Agentic Boilerplate

A starter pack for building software with an Agentic SDLC: 5 phases, 3 human gates, an autonomous agent loop with TDD and dual-layer code review.

> The application code is **not** here. This boilerplate provides the system that builds applications. The first thing you do after cloning is run `/ideation` — the agent loop will scaffold the actual app.

## What this is

This repo is the system, not the product:
- `.claude/` — skills, subagents, hooks (the human-facing tooling for phases 1–3)
- `agent-loop/` — the autonomous implementation engine (phase 4)
- `docs/` — placeholders for project-specific specs, filled in during phases 1–2
- `apps/` — empty until the agent loop starts implementing
- `.github/workflows/` — CI and the deep code review action

## The 6 phases

0. **BOOTSTRAP** (human + agent grilling) — `/bootstrap-project` configures the toolchain and team conventions in `CLAUDE.md`. One-time, run right after cloning the boilerplate.
1. **IDEATION** (human + agent grilling) — `/ideation` interrogates a human about a raw business requirement
2. **PRD** (agent synthesis) — `/create-prd` synthesizes the conversation into `docs/PRD.md`
3. **ISSUES** (human approval) — `/prd-to-issues` decomposes the PRD into vertical-slice GitHub issues
4. **IMPLEMENTATION** (autonomous loop) — the agent loop picks issues, runs TDD, opens PRs
5. **QA + CLOSE** (human) — humans verify acceptance criteria and merge PRs

When QA fails: `/qa-fail` creates a new bug issue with a proposed failing test. The agent loop picks it up next at priority 1.

## Quick start

```bash
# Clone for a new project
git clone https://github.com/<your-org>/agentic-boilerplate.git my-new-project
cd my-new-project
rm -rf .git
git init

# Open Claude Code
claude

# Inside Claude Code, run phase 0 (one-time stack setup), then phase 1
/bootstrap-project
/ideation "feature description"
```

After phase 3 produces issues, exit Claude Code and the human Operator runs:

```bash
./agent-loop/start.sh
```

Monitor the loop:

```bash
# Terminal 2 — live tail
tail -f agent-loop/logs/main-*.log | grep -E '\[agent\]'

# Terminal 3 — aggregated status
watch -n 30 ./agent-loop/status.sh
```

## Key documents

- `CLAUDE.md` — project constitution (boundaries, commands, workflow)
- `docs/ARCHITECTURE_RULES.md` — clean arch, deep modules, TDD enforcement
- `docs/GLOSSARY.md` — domain language, populated during PRD
- `docs/PRD.md` — product spec, populated by `/create-prd`
- `docs/ADRs/` — architectural decisions made during implementation

## Loop control (Operator-only)

- `./agent-loop/start.sh` — STOPPED → RUNNING
- `./agent-loop/pause.sh` — RUNNING → PAUSED (graceful)
- `./agent-loop/resume.sh` — PAUSED → RUNNING
- `./agent-loop/stop.sh` — → STOPPED (graceful, current iteration finishes)
- `./agent-loop/kill.sh` — hard kill + cleanup of `in-progress` labels
- `./agent-loop/status.sh` — agent + queue snapshot

Only one person on the team should run these scripts to avoid contradictory state transitions.

## Issue lifecycle (label scheme)

- `afk` / `afk-burst` — pools for the main loop / burst worktrees
- `hitl` — skipped by the loop, requires human implementation
- `bug` — bug issue created via `/qa-fail`, includes proposed failing test
- `priority:1/2/3` — bugs default to `priority:1`
- `parent:<num>` — link from a bug to its parent issue
- `in-progress` — semaphore set by the loop for the current iteration
- `qa-ready` — set by the loop after PR is opened
- `qa-failed` — informational on the parent of a bug
- `stuck` — set by the loop after 3 failed attempts
- `cannot-reproduce` — set by the loop if the proposed test does not fail
- `needs-human-fix` — escalation after 3 nested levels of `parent:`

## Customization

The skills in `.claude/commands/` are stubs based on Matt Pocock's pattern. Each contains a TODO block with prompts you can refine for your specific stack and team conventions. After your first hackathon or sprint, harvest improvements back into this boilerplate.
