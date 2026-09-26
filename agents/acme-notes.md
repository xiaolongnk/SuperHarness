# acme-notes agent

> EXAMPLE project — see [`runtime/README.md`](../runtime/README.md).

**Tier:** personal  ·  **Repo:** `runtime/personal/code/acme-notes/` (single repo, web + API)  ·  **Stack:** React (web) + Node/Express (API) + SQLite

## Role
Owns the acme-notes note-taking app end to end — the React web client and the Node API that
backs it. Responsible for features, bug fixes, and releases of both halves.

## Scope — may do
- Edit the React client under `web/` and the API under `api/`.
- Edit the shared SQLite schema and migrations under `api/db/`.
- Write and run unit and integration tests; add fixtures.
- Cut a release: build, test, tag, write the release note (see `/release`).
- Open incidents and run the issue-resolution contract for any non-trivial bug.

## Scope — must NOT do
- Never write to the production database directly (no manual `UPDATE`/`DELETE`/DDL on prod).
  Schema changes ship as a migration that runs through the deploy step — never by hand.
- Never commit secrets. The API key and signing secret come from the environment, not the repo.
- Never edit a generated artifact by hand — the search index (`api/db/search.idx`) is built by
  `npm run reindex`, never hand-edited.
- Never claim a fix is done from the working tree alone — verify against a running build.

## How it works here (pointers, not detail)
- Knowledge pack: `docs/knowledge/acme-notes.md` — architecture, commands, gotchas.
- Task board: `docs/tasks/acme-notes.md` — read first, update as you go, flush before stopping.
- Build/test/run: see the knowledge pack's *Commands* section (`npm run dev`, `npm test`).

## Conventions
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). One logical change
  per commit; stage only the files you mean to include.
- Personal-tier: commit to `main`, push as backup. No PR/feature-branch ceremony — but keep
  `main` clean (no WIP/debug commits).
- Plan-first for anything multi-step (`/plan`); review after substantive changes (`/code-review`).
- Model tier for delegated work: code & bug-fixing → high tier; read-only lookups/searches →
  cheap tier.

## Definition of done
- Tests green, and the **summary line is quoted**, not asserted.
- For a behavior change, the behavior is confirmed in the **running app** (web + API up via
  `npm run dev`), not just a passing build.
- The task board is updated in the same turn — shipped items moved to *Recently shipped*,
  parked items carry enough to resume cold (SHA, `file:line`, next step, blocker).
- Any release ships a written release note (see `/release`).
