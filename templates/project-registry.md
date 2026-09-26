# Project registry — template

> Copy to `docs/portfolio-registry.md` (or wherever your management layer's docs live). This
> is the routing table a manager reads to decide which project a requirement belongs to, and
> whether it splits across more than one. See [`docs/portfolio.md`](../docs/portfolio.md) for
> the full model this table plugs into.

---

```markdown
# Project registry — requirement routing

The manager reads this table to route an incoming requirement to the project(s) that own it,
and to read off the right-sized workflow (the runtime tier) once there. See
`docs/portfolio.md` §2 for why the tier — not a per-project judgment call — decides the
handling.

## Projects

> **Machine-read block.** `route`, `portfolio-triage`, and `context-health` parse ONLY the rows
> between the `projects` markers below. Keep it a clean pipe-table, one project per row. Every other
> table in this file (the tier→policy table, prose) is for humans and must stay OUTSIDE the markers.
>
> **On adoption:** delete the three example rows below (`acme-notes` / `acme-web` / `acme-api`) —
> they are illustrations, not real projects — and add your own (or let `npx create-superharness add-project` add them).

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
- `<project>` — `<tier>` — `<policy that deviates from the tier default>` — `<one-line reason>`
```

---

## Why each section exists

- **Requirement keywords, not just a name.** The manager routes by matching a requirement's
  actual language against this column — a project name alone isn't enough because requests
  rarely say "route this to acme-web," they say "the reports page is broken."
- **Tier, not per-project policy.** Naming exactly one of two tiers per project means the
  git-workflow decision is made once per project, from a fixed two-row default table, instead
  of re-litigated on every requirement. A solo project never gets saddled with PR ceremony it
  doesn't need; a shared project never silently skips the review gate it does need. Overrides
  stay in one short list instead of forking the whole table.
- **One table, not one file per project.** The registry itself should stay short enough to
  read in full before every routing decision — detail belongs in each project's own agent
  definition ([`templates/agent-definition.md`](agent-definition.md)) and task board
  ([`templates/task-board.md`](task-board.md)), not here.

## Tips

- Keep responsibilities to one line. If a project needs two lines to describe, it's probably
  two projects, or the registry is the wrong place for that detail (put it in the agent
  definition instead).
- Keyword lists should be *specific* to the project's real vocabulary. A keyword shared by
  two rows (e.g. "API" on both `acme-web` and `acme-api`) doesn't disambiguate anything —
  tighten it or rely on responsibilities to break the tie.
- Add a project by adding one row, not by restructuring the table. If adding a project keeps
  requiring new columns, the registry is trying to hold detail that belongs in that project's
  own agent definition.
- Review this table when a project's scope actually changes — not on a schedule. Stale
  keywords silently misroute requirements, so fix drift the moment you notice it.
- Update a project's Tier the moment its maintainer count actually changes (a personal
  project gains a second contributor, a work project shrinks to one) — a stale tier misapplies
  the wrong workflow just as silently as a stale keyword misroutes a requirement.
