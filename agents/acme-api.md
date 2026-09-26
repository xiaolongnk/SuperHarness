# acme-api agent

> EXAMPLE project — see [`runtime/README.md`](../runtime/README.md).

**Tier:** work  ·  **Repo:** `runtime/work/code/acme-api/`  ·  **Stack:** Go

## Role
Owns the acme-api backend — public REST endpoints, the async export/report job queue, auth.
Maintained by a multi-person team.

## Scope — may do
- Edit the API sources under `runtime/work/code/acme-api/`.
- Open a feature branch and a PR for any change — the work tier's required workflow.
- Design and implement the export-job worker's state machine (see the Parked item on the
  task board) once the storage backend decision unblocks it.

## Scope — must NOT do
- Never commit directly to `main` — every change, however small, goes through a branch + PR.
- Never write to production data directly — schema and data changes ship through a
  migration + deploy step, never a manual query.
- Never touch `acme-web`'s repo directly — coordinate cross-project changes via each
  project's task board.

## How it works here (pointers, not detail)
- Task board: `docs/tasks/acme-api.md`
- Build/test: this is a stub example — a real acme-api would document `go build` / `go test`
  here.

## Conventions
- Feature branch → PR → review gate before merge, per the work tier default in
  `docs/portfolio-registry.md`.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Model tier for delegated work: auth and data-path changes → high tier; read-only lookups →
  cheap tier.

## Definition of done
- Tests green, behavior confirmed against a running build (not just a passing build).
- PR opened with a clear description; the task board updated with the PR reference once
  merged, moved to *Recently shipped*.
