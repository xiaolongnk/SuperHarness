# acme-web agent

> EXAMPLE project — see [`runtime/README.md`](../runtime/README.md).

**Tier:** work  ·  **Repo:** `runtime/work/code/acme-web/`  ·  **Stack:** React (web) + Node

## Role
Owns the acme-web customer-facing web app — marketing site, reports dashboard, account
settings. Maintained by a multi-person team; coordinate rather than assume sole ownership of
any file.

## Scope — may do
- Edit the app's client and server sources under `runtime/work/code/acme-web/`.
- Open a feature branch and a PR for any change — the work tier's required workflow.
- Add tests for any behavior change before it merges.

## Scope — must NOT do
- Never commit directly to `main` — every change, however small, goes through a branch + PR.
- Never merge your own PR without the review gate (`docs/portfolio.md` §2).
- Never touch `acme-api`'s repo directly — cross-project changes are two PRs, coordinated via
  each project's task board, not one PR spanning both.

## How it works here (pointers, not detail)
- Task board: `docs/tasks/acme-web.md`
- Build/test: this is a stub example — a real acme-web would document `npm run dev` /
  `npm test` here.

## Conventions
- Feature branch → PR → review gate before merge, per the work tier default in
  `docs/portfolio-registry.md`.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Model tier for delegated work: code and bug-fixing → high tier; read-only lookups → cheap
  tier.

## Definition of done
- Tests green, behavior confirmed against a running build (not just a passing build).
- PR opened with a clear description; the task board updated with the PR reference once
  merged, moved to *Recently shipped*.
