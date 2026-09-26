---
name: demand-pipeline
description: Run a requirement through a fixed staged pipeline — breakdown, design, implement, verify — each stage a context-isolated sub-agent, so a big requirement gets the same rigor as a reviewed feature instead of one long improvised session
domains: [portfolio]
tier: both
---

For requirements too big to hand a coworker as one brief: a fixed sequence of stages, each run by an
independent sub-agent that sees **only its own stage's input**, not the whole conversation history.
Context isolation is the point — a stage that inherits every prior decision tends to rubber-stamp
them instead of evaluating the requirement fresh.

Arguments: `$ARGUMENTS`
- **Full pipeline**: `demand-pipeline <requirement description or path to a written requirement>`
- **Single stage**: `demand-pipeline breakdown <requirement>` | `design <breakdown_doc_path>` |
  `implement <design_doc_path>` | `verify <task_or_pr>`

## Context isolation rule (mandatory, every stage)

Each stage is dispatched as an independent sub-agent (a fresh coworker, or an isolated sub-agent call
if your CLI supports one). The dispatch prompt for a stage may contain **only**:
1. A short role description for that stage (below), or a pointer to a role file.
2. The **one input document** for that stage — a file path or pasted text.
3. The **one output** the stage must produce — a file path and its required structure.

Do not fold in the parent session's other conversation, unrelated files, or "context you already
have" — a sub-agent that doesn't independently re-derive the plan from the stated input isn't
providing isolation, just a second read of the same reasoning.

## Stage 1 — Breakdown

**Role:** turn a raw requirement into a scoped demand doc — what's being asked, who it's for, what's
explicitly out of scope, and which project(s) it likely touches (cross-reference `docs/portfolio.md`
via `route`, but don't delegate execution yet — this stage only scopes).

**Input:** the raw requirement (file path or pasted text).
**Output:** `docs/plans/<demand-id>_demand.md` — problem statement, in/out of scope, affected
project(s), open questions. Choose `<demand-id>` from the requirement (short slug); check it doesn't
collide with an existing plan file.

## Stage 2 — Design

**Role:** produce the technical/task design — architecture or approach, a task breakdown table
(project, task, acceptance criteria), and the risks worth flagging before anyone writes code.

**Input:** `docs/plans/<demand-id>_demand.md` only. May consult `docs/portfolio.md` and each affected
project's `agents/<project>.md` to understand ownership and constraints — nothing else.
**Output:** `docs/plans/<demand-id>_design.md` with an explicit task-breakdown table.

## Stage 3 — Review

**Role:** an adversarial second opinion — a fresh sub-agent with no stake in the design it's
reviewing (the reviewer persona itself isn't a role contract this repo defines; any capable
sub-agent call or fresh session works). Checks the design for
soundness, missing risks, and whether the task breakdown is actually implementable as written.
Concludes **approved** or **needs revision**, never a silent pass-through.

**Input:** `docs/plans/<demand-id>_design.md` only.
**Output:** `docs/plans/<demand-id>_review.md` — conclusion +, if `needs revision`, the specific
revision items.

- **If `needs revision`:** send the revision items back to stage 2 with both `_design.md` and
  `_review.md` as input; produce an updated `_design.md`; re-run stage 3. Do not proceed to
  implementation on an unapproved design.
- **If `approved`:** proceed to stage 4.

## Stage 4 — Implement (context-isolated per task)

**Role:** execution. Read the task-breakdown table from the approved `_design.md` and, for each
task, dispatch it via `route` (or a direct delegation) with **only that task's description +
acceptance criteria + owning project** — not the full demand or design doc. This is what keeps a
5-task design from becoming one coworker's 5-page mega-brief (the exact anti-pattern
`docs/delegation.md` warns against).

Write each task into its owning project's `docs/tasks/<project>.md` before dispatch, so it's durable
even mid-pipeline.

## Stage 5 — Verify

**Role:** confirm each implemented task actually meets its stated acceptance criteria — run it, don't
just read the diff (see the `verify` skill / `verify-by-interaction-not-proxy` discipline). Roll up
per-task verification into one pipeline completion report: which tasks passed, which didn't, and
what's still open.

## Single-stage invocation

Any stage can run alone (e.g. re-running `design` after a requirement changes). A single-stage call
still goes through the same context-isolation rule — the dispatch prompt contains only that stage's
declared input and output, nothing borrowed from a prior full-pipeline run.

## Outputs and traceability

All stage docs land in `docs/plans/<demand-id>_<stage>.md`. Tasks written to a project's board during
Stage 4 should carry the `demand-id` and the design-doc path, so a task on a board can always be
traced back to the requirement that generated it.
