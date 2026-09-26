# Evidence before claim (everyday tier)

## Pattern

Before stating *why* something failed — not just *that* it failed — get one
piece of hard evidence: read the actual log, run the actual command, inspect
the actual config. A plausible explanation formed from memory or a first
guess is a hypothesis, not a diagnosis. This is the lightweight, every-task
tier; see `issue-resolution-contract.md` for the heavyweight tier that applies
once an issue is non-trivial enough to warrant a written contract.

## Why

A confident-sounding wrong explanation is worse than "I don't know yet" — it
gets acted on, encoded into fixes, and repeated the next time the same shape
of failure appears. The everyday version of this failure doesn't need a full
incident document to prevent; it needs three firing triggers recognized in
the moment, before the explanation leaves your mouth.

## The three firing triggers

1. **A generic or low-level error code is a SYMPTOM, not a root cause.**
   Codes like a generic auth failure, a broken-pipe error, a non-zero exit,
   an HTTP 500, or "connection reset" each map to *many* possible causes. The
   code tells you *that* it failed, never *why*. Get to the specific cause —
   the underlying error, the actual log line, the real code path — before
   naming a culprit. Never let the code's *name* (e.g. "canceled", "timeout")
   pick the layer for you; the name can mislead.
2. **Clean checks on the easy outer layers do NOT prove the cause is
   external.** When a failure is opaque, enumerate the stack (config /
   auth / network / server / application code) and produce one fact that
   rules out each layer. Verifying the outer layers looks clean is real
   progress — it eliminates suspects — but it does not conclude the cause is
   outside your own code. Keep working inward until the evidence, not the
   order of convenience, closes the search.
3. **"It's the platform's fault / not our code" is the most dangerous
   conclusion — it STOPS investigation.** It's the comfortable answer (it
   absolves the person investigating) and it is exactly the moment to look
   hardest at your own code, config, and recent changes. Most "unfixable
   external cause" verdicts turn out to be a small, local bug once someone
   keeps looking past the comfortable stopping point.

## How to apply

- State a confidence level with reasons when full verification isn't
  possible — "hypothesis, not confirmed, because X" — rather than asserting
  a root cause outright.
- Instrument first: get the full error text and confirm whether the request
  or action actually reached the next layer, before hypothesizing about what
  that layer did with it. This one step often collapses the search space by
  itself.
- If a hypothesis is contradicted by the evidence gathered, say so and
  revise — don't quietly keep the original explanation because it was
  already stated.

## When NOT to apply

- The cause is directly visible in the same output that showed the failure
  (a syntax error with a line number, a typo in a command) — no separate
  evidence-gathering step is needed.
- The task doesn't involve diagnosing a cause at all (routine, non-diagnostic
  work).

## Relationship to the heavyweight tier

`issue-resolution-contract.md` is the full written contract for non-trivial
issues (bugs, regressions, incidents) — problem → hypothesis → evidence →
root cause → fix with prediction → acceptance test → retrospective. This file
is the everyday middle ground: quick diagnostic questions, "why did X fail"
answers, configuration troubleshooting — situations where no incident
document gets created but the same evidence-before-claim discipline still
applies before naming a cause.
