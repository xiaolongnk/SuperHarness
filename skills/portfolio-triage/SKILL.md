---
name: portfolio-triage
description: Scan every project's task board across the monorepo and surface the single highest-priority open item per project as a ranked cross-project worklist
domains: [portfolio]
tier: both
---

The "one glance at the whole portfolio" skill. Run it cold, at the start of a session, or any time
you need to decide what to work on next across **more than one** project.

Arguments: `$ARGUMENTS`
(Optional. `--tier <personal|team>` filters to one tier. `--top N` caps the worklist to the top N
projects by priority, default: all. No arguments → full portfolio scan.)

## What "portfolio" means here

A **portfolio** is every project registered in `docs/portfolio.md` (the routing table: project →
responsibilities → keywords → task-board path). This skill does not discover projects on disk — it
trusts the registry, so a project only gets triaged once it's registered (see `route` for what to do
when a requirement names an unregistered project).

## Steps

1. **Read the registry.** Parse the live registry `docs/portfolio-registry.md` — ONLY the rows between
   its `<!-- projects:start -->` / `<!-- projects:end -->` markers — to get the full project list and each
   project's task-board path (`docs/tasks/<project>.md`). (`templates/project-registry.md` is the schema;
   `docs/portfolio.md` §3 is the model. IGNORE the tier→policy table — it is not a project list.)
2. **Read every board.** For each registered project, read its task board and extract:
   - The **Now / In progress** item, if any (this always outranks Next/Queued — work already
     started beats a fresh pick).
   - Otherwise the **top item in Next / Queued** (boards follow the priority-ordered convention from
     `templates/task-board.md`).
   - Any **Parked / Blocked** item whose blocker looks resolved (e.g. "blocked on review" and review
     context suggests it landed) — surface these separately, they're easy wins.
   - Skip a project cleanly if its board has no open items — do not manufacture a task.
3. **Normalize one line per project**: `<project> — <item> — <state: in-progress|next|unblock-check>`.
   Carry the exact task text and, if the board records one, its priority/date so ranking isn't just
   board order.
4. **Rank across projects.** In-progress items first (finish what's started), then unblock-checks
   (cheap wins), then queued items ordered by whatever priority signal the boards carry (explicit
   priority label, else recency, else board order as a last resort). State the ranking rule you used
   — don't rank silently.
5. **Emit the worklist:**
   ```
   Portfolio triage — <N> projects scanned, <M> with an open top item

   1. <project> — [in-progress] <task>
   2. <project> — [next] <task>
   3. <project> — [unblock-check] <task> — was blocked on <X>, check before assuming still blocked
   ...

   Skipped (no open items): <project>, <project>
   ```
6. **Do not act on the worklist yourself.** This skill triages; it does not delegate. Hand the
   ranked list to `route` (per item, or per a batch you choose) to actually dispatch work.

## Why this exists

Managing many projects from one control point needs a single command that answers "what
should get worked on right now, across everything" without a human re-reading N task boards by
hand. This is the portfolio-scale analogue of reading one project's board before starting work.
