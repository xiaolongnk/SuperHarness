# Self-improvement loop

## Pattern

Work produces failures and feedback. Instead of letting each one dead-end as
a one-off patch, run it through a fixed loop that turns it into a durable,
correctly-layered asset — and the loop is engineered so that the
always-loaded core it feeds *stays bounded* even as the library it feeds
grows without limit:

```
WORK
  │
  ▼
FAILURE / FEEDBACK              a bug, a correction, a wrong assumption,
  │                              a "no, do it this way instead"
  ▼
REASON                          first-principles (PHILOSOPHY.md) +
  │                              hard evidence (evidence-before-claim.md /
  │                              issue-resolution-contract.md) — never a
  │                              guess dressed up as a root cause
  ▼
CAPTURE                         the lesson gets written down, once, in the
  │                              right shape — the `learn` skill runs this
  │                              step: end-of-task extraction + routing
  ▼
CURATE                          find the PRINCIPLE the lesson is really
  │                              about, then act in priority order:
  │                              sharpen existing → fix-in-place → sediment
  │                              stale → add-with-retire (adding net-new is
  │                              the last resort) — see
  │                              curate-dont-accrete.md, enforced by the
  │                              `curate` skill
  ▼
LAYER                           the result lands in the correct on-demand
  │                              tier from docs/architecture.md's table —
  │                              a discipline, a skill, a memory cluster, or
  │                              a knowledge/ entry — loaded by domain match,
  │                              never speculatively pasted into the
  │                              always-loaded core
  ▼
CLEAN                           periodic health audit (`context-health`)
  │                              sweeps every layer for staleness, bloat,
  │                              orphaned entries, and drift between what's
  │                              indexed and what's actually on disk
  ▼
next pass on this class of work is FASTER + more correct
  → efficiency compounds, because the always-loaded core did not grow to
    hold it — only the on-demand library did
```

## Why

An agent that fixes the same class of mistake the same way every time is not
learning — it's re-deriving. Without a loop, one of two failure modes
happens instead: either lessons are never captured (the same mistake recurs
indefinitely), or every lesson gets bolted onto the always-loaded core as
"one more IMPORTANT rule" (the mistake stops recurring, but the tax every
agent pays on every task climbs without bound until the rules that matter
are drowned out by the rules that don't).

The loop exists to get the benefit of the first failure mode's fix — the
mistake stops recurring — without paying the second failure mode's cost. The
CURATE step is what makes that possible: it forces every captured lesson
through a decision that defaults to *not* growing the always-loaded core.

## How to apply

- **REASON before CAPTURE.** A lesson captured from a plausible-sounding
  guess instead of verified evidence encodes a wrong belief permanently. Run
  `evidence-before-claim.md` (everyday) or `issue-resolution-contract.md`
  (non-trivial) *before* writing anything down — capturing garbage is worse
  than capturing nothing, because it now looks authoritative.
- **CURATE is not optional and not automatic.** Every captured lesson passes
  through the four-way decision in `curate-dont-accrete.md` before it's
  written anywhere durable. Do not skip straight from CAPTURE to "add a new
  file" — that skip is exactly how the always-loaded core grows unchecked.
- **LAYER by the architecture table, not by convenience.** A lesson that's
  really a project-specific fact belongs in that project's memory cluster,
  not in a globally-loaded discipline; a lesson that's a repeatable procedure
  belongs in a skill with a `domains:` tag, not inlined into PHILOSOPHY.md.
  Picking the wrong layer defeats the on-demand model even if the content
  itself is correct — see `docs/architecture.md`'s layer table before
  deciding where something goes.
- **CLEAN on a cadence, not only when something breaks.** The `context-health`
  audit is what catches slow drift — an index entry pointing at a file that
  moved, a discipline that's been superseded but never retired, a memory
  cluster nobody has matched against in months. Waiting for a visible failure
  to trigger cleanup means the always-loaded core only ever grows between
  audits.
- **The metric that proves the loop is working**: the always-loaded core
  (disciplines index, memory routing index, skills index) trends flat or
  down over time while the on-demand library (`disciplines/*.md` bodies,
  memory clusters, `skills/*/SKILL.md`, `knowledge/**`) grows without limit.
  If the always-loaded core is climbing, the loop is degrading into "add a
  rule" instead of "curate a rule" — treat that as the bug to fix, not as a
  sign the loop needs more rules.

## When NOT to apply

- A one-turn detail with no cross-session value ("I misread this file path")
  doesn't need the loop — it needs nothing. Not every mistake is a lesson;
  most aren't. Forcing every friction point through CAPTURE is itself a way
  the always-loaded core grows unchecked.
- Routine, non-diagnostic work that didn't involve a failure or a correction
  has nothing for this loop to act on — it only fires off a WORK step that
  produced FAILURE / FEEDBACK.

## Relationship to other disciplines

This file is the loop; `curate-dont-accrete.md` is the decision procedure
inside its CURATE step; `evidence-before-claim.md` and
`issue-resolution-contract.md` are what the REASON step draws on;
`docs/architecture.md` is the map the LAYER step routes against. Read this
file to understand *why* the loop exists and how the steps chain together;
read the others for the mechanics of one specific step.
