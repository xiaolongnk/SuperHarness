# Delegation

This document explains *how a control point turns one inbound task into
well-scoped briefs*. Decomposition is the core skill; this doc is the
operating manual for it.

*Boundary: this describes a decomposition/delegation pattern, not a shipped
multi-agent execution engine. "Coworker" below names a unit of independent
execution — a sub-agent call, a future session of yourself working the next
item, or a literal parallel agent process if you bring your own
orchestration. SuperHarness doesn't spawn, route between, or supervise
agent processes itself.*

---

## The default — decompose, then dispatch

When work arrives, the manager's first move is to decompose, not to dispatch.
A single inbound request typically contains several independent sub-tasks
that can run in parallel; routing the whole request to one coworker
serializes work that did not need to be serial.

Decomposition asks one question, repeated:

> Is this still one unit of work, or can I split it into independent pieces
> a coworker could run without waiting on another coworker's output?

When the answer is "split," split. When the answer is "this is one unit,"
dispatch as one brief. The manager's value is making this judgment well —
not running the work itself.

---

## Independence is the test

A piece of work is **independent** when:

- It can be completed without reading another in-flight brief's output.
- Its acceptance criteria don't depend on a sibling brief's choices.
- A reviewer of just this piece could decide SHIP / NEEDS-FIX from the
  brief and the diff alone.

A piece is **not** independent when it is downstream of a sibling — when
"verify the migration" depends on "write the migration." Sequencing matters
there; running them in parallel produces wasted work or stale verification.

When a sub-task is not independent, hold it in the manager's backlog and
dispatch it the moment its upstream sibling ACKs. The pane that does the
upstream work moves to the next idle slot; the downstream brief lands on
whichever pane is free next.

---

## Common decomposition shapes

These are templates, not a checklist. Pick the ones that fit; ignore the
ones that don't.

### Feature work

- **Implement** — the named code change.
- **Tests** — unit / integration / regression tests for the change.
- **Docs** — anything user-visible changes a public surface (README, API
  reference, release notes).
- **Recon** — for the *next* task in the backlog, so the manager can route
  it as soon as a coworker frees up.
- **Review** — adversarial pass before the work ships.

The first four can run in parallel; review is a barrier on the implementer.

### Bug fix

- **Reproduce** — write a failing test or a deterministic repro before any
  fix is written. (See the issue-resolution discipline.)
- **Diagnose** — read the relevant code, name the root cause, write it
  down.
- **Fix** — apply the change.
- **Acceptance test** — re-run the repro, plus an adjacent case to confirm
  the fix isn't over-broad.
- **Retro** — close out the incident doc once shipped.

Reproduce and diagnose can sometimes run in parallel on the same coworker
(they share context); fix waits for both; acceptance test waits for fix.
Retro is asynchronous after ship.

### Investigation

- **Read** — primary sources (code, logs, prior incidents).
- **Survey** — adjacent work, prior art, comparable systems.
- **Hypothesize** — write up two-to-four competing hypotheses with the
  observations that would confirm or refute each.

Read and survey fan out; hypothesize is the synthesis step on one
coworker.

### Cross-repo feature

- One brief per repo, scoped to that repo only (the "Scope clause" your
  own execution model should enforce, if you have one beyond a single
  session).
- Manager owns the merge order.
- Coworkers must **not** reach across repo boundaries — a coworker that
  needs to touch another repo emits BLOCKED, and the manager dispatches a
  separate brief.

---

## When NOT to decompose

Decomposition has overhead — writing N briefs, tracking N ACKs, merging
N artifacts. For small tasks, the overhead exceeds the parallelism gain.

Skip decomposition when:

- The work is genuinely one mechanical edit (a rename, a typo, a single
  config change). One brief, one coworker, done.
- The sub-tasks are so tightly coupled that a coworker would have to read
  the others' output mid-task. Parallelism would produce inconsistent
  results.
- The acceptance criterion is "all of these as one atomic commit."
  Decomposing forces a merge step that adds risk for no parallelism gain.

The smell test: if you can't write three distinct briefs without one
referring to "what the other coworker is doing," it's one unit of work.

---

## Filling spare capacity

When the critical path must run one task at a time and other coworkers
would otherwise sit idle, give them useful adjacent work:

- **Independent verification** of the in-flight change — a second
  coworker (or reviewer) running the same acceptance test from a fresh
  checkout.
- **Recon for the next task** — so the manager's backlog is shovel-ready
  the moment the critical path completes.
- **Doc updates** — almost always behind on real projects; a coworker
  with no other work can usually find a doc that drifted.
- **Tests for an adjacent untested area** — pure additive work, never
  blocks anything.

The bar for spare-capacity work: it is **safe to discard** if priorities
shift. If discarding the result would cost real time, it wasn't spare
capacity — it was a deferred main-line task.

---

## Routing decisions the manager owns

Some decisions are routing decisions and the manager owns them outright
without escalation:

- Which idle coworker gets the brief.
- Whether to use a worktree per coworker for parallel safety.
- Which coworker takes the merge step at the end of a parallel fan-out.
- When to escalate a stuck coworker's task to a stronger model (see
  `model-routing.md`).
- When to refuse a brief that violates the "one repo per brief" rule and
  send it back for split.

Decisions the manager does **not** own — these are escalation cases:

- A choice that changes the *direction* of the work, not its mechanics.
- A binding external commitment (a deploy, a paid action, a public
  comment).
- A trade-off the user explicitly reserved (a product call, a strategy
  decision).

For these, surface upward as a structured question on the manager→owner
notify channel.

---

## Anti-patterns

- **The mega-brief.** One five-page brief routed to one coworker, with
  twelve goals. Split it.
- **The chained brief.** "Do A, then if A works, do B" — the coworker has
  no authority to make the B decision. Split A and B; the manager
  routes B after A's ACK.
- **The cross-repo brief.** "Edit repo X and repo Y." Split per repo;
  manager owns merge order.
- **The implicit-context brief.** Assumes the coworker remembers prior
  conversation. The framework's reset model means the coworker may have
  been `/cleared`. Every brief is self-contained.
- **The serial fan-out.** Manager dispatches one brief, waits for ACK,
  dispatches the next. If the briefs were independent, all of them should
  have gone out together.
