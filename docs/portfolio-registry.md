# Project registry — requirement routing

The manager reads this table to route an incoming requirement to the project(s) that own it,
and to read off the right-sized workflow (the runtime tier) once there. See
[`docs/portfolio.md`](portfolio.md) §2 for why the tier — not a per-project judgment call —
decides the handling.

## Projects

> **Machine-read block.** `route`, `portfolio-triage`, and `context-health` parse ONLY the rows
> between the `projects` markers below. Keep it a clean pipe-table, one project per row. Every other
> table in this file (the tier→policy table, prose) is for humans and must stay OUTSIDE the markers.
>
> These three rows are the framework's shipped EXAMPLE projects (see
> [`runtime/README.md`](../runtime/README.md)) — solo-maintained `acme-notes`, and
> multi-maintainer `acme-web` / `acme-api`. **On adoption:** delete these example rows — they
> are illustrations, not real projects — and add your own (or let `npx create-superharness add-project` add them).

<!-- projects:start -->
| Project | Tier | Responsibilities | Requirement keywords |
|---|---|---|---|
| `acme-notes` | personal | Solo-maintained note-taking app (React web + Node/Express API + SQLite, markdown notes, full-text search) — the only runtime project one owner ships alone; commits go straight to `main`. | notes, acme-notes, search, import, markdown editor, share link |
| `acme-web` | work | Customer-facing web app (React + Node), maintained by a multi-person team — marketing site, reports dashboard, account settings. | web app, dashboard, reports page, frontend, React, marketing site, account settings |
| `acme-api` | work | Backend API + job queue (Go), maintained by a multi-person team — public REST endpoints, async export/report jobs, auth. | API, endpoint, backend, job queue, export job, auth, REST |
<!-- projects:end -->

## Runtime tier → default policy

| Tier | Git policy | Review gate | Deploy path |
|---|---|---|---|
| `personal` | Commit direct to `main`; push as backup. No feature branch, no PR. | None — the owner is the only reviewer that exists. | Whatever is simplest for one person to run. |
| `work` | Feature branch → PR. Never commit straight to `main`. | Required before merge (human or reviewer agent). | A defined ceremony (CI, staged rollout, approvals) matching the team's risk tolerance. |

### Overrides
None currently — all three example projects follow their tier's default policy.
