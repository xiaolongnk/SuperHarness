---
name: route
description: Route a requirement to the project(s) that own it via the project registry, read each project's runtime tier, then delegate a tier-appropriate brief — splitting into parallel briefs when the requirement spans more than one project
domains: [portfolio]
tier: both
---

Turns "here's a thing that needs doing" into "here's who does it and the brief they're working
from." The manager's entry point for a single inbound requirement (contrast with `portfolio-triage`,
which surfaces work proactively across everything).

Arguments: `route <requirement description or task-board item>`
(Optional prefix: `route --project <name> <requirement>` to skip lookup when the owner is already known.)

## Steps

1. **Read the registry.** Parse the live registry `docs/portfolio-registry.md` (created from
   `templates/project-registry.md`) — ONLY the rows between its `<!-- projects:start -->` /
   `<!-- projects:end -->` markers. That block is the routing table (project · tier · responsibilities
   · keywords). IGNORE every other table in the file — the tier→policy table uses the same pipe/backtick
   shape and is NOT a project list. See `docs/portfolio.md` §3. Do not guess an owner from the
   requirement text alone; match it against the registry's stated responsibilities.
2. **Identify the owning project(s).**
   - **Single owner** — the common case. Confirm the match against the registry entry's stated
     responsibilities, not just a keyword hit (a keyword can be ambiguous across two projects).
   - **Spans multiple projects** — split into one independent requirement per project. Each split
     must be **self-contained**: a sub-agent executing it should not need the other projects' context
     to do its part. Note the dependency order if one project's output blocks another's (e.g. a
     shared schema change must land before the consumer).
   - **No match** — the requirement doesn't map to any registered project. Do not force it onto the
     closest-sounding one; either register a new project first (see `docs/portfolio.md` for the
     onboarding steps) or hand it back for scoping.
3. **Read the owning project's runtime tier** off the registry's Tier column (`docs/portfolio.md`
   §2) — `personal` or `work`. This decides the handling the brief must carry, not just which repo
   to touch:
   - **`personal`** → the brief says: commit direct to `main`, push when done, no branch, no PR.
   - **`work`** → the brief says: create a feature branch, open a PR, and stop there — do not merge
     without the review gate. Note the worktree the coworker should use for isolation.
   For a cross-project split, read each project's tier independently — a single requirement can
   legitimately fan out into one `personal`-tier brief and one `work`-tier brief with two different
   handlings.
4. **Enrich each brief before dispatch.** A bare requirement sentence is not a brief. Add: the
   objective, the acceptance criteria (what "done" looks like, concretely), the tier's handling from
   step 3, and any constraint the owning project's `agents/<project>.md` calls out (must-NOT-do
   scope, conventions). A coworker should never have to re-derive intent, or the right-sized
   workflow, from a one-liner.
5. **Record before delegating.** Write the task into the owning project's board
   (`docs/tasks/<project>.md`, per the durable-task-state discipline) as in-progress, so it survives
   a `/clear` even if the delegation itself is still running.
6. **Delegate.** Dispatch each project's brief (addressing and submitting the
   dispatch is your own execution setup's job — out of scope for this repo).
   **Multiple projects → multiple parallel dispatches in the
   same pass** — don't serialize independent work. Same-project multiple tasks may be merged into one
   brief or sequenced by dependency.
7. **Track to completion.** When a coworker ACKs, update that project's board (move the item to
   *Recently shipped* — with the commit SHA for a `personal`-tier project, or the PR link for a
   `work`-tier one — or the next queued step) before considering the route closed. A route that
   dispatches but never confirms completion isn't done — it's dangling.

## Why this exists

Every requirement has exactly one place it belongs; guessing costs a wrong delegation and a redo.
`route` makes "who owns this" a lookup against a written registry instead of a judgment call repeated
from scratch every time, and makes "does this span projects" an explicit branch instead of an
implicit assumption that everything is one project's problem. Reading the tier before dispatch is
what stops a `route`-generated brief from imposing the wrong workflow — PR ceremony on a solo
project, or a direct-to-main commit on a shared one — which is the single most common way a
portfolio-wide routing skill can silently do damage.
