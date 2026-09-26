# Model Routing

This document is the framework's model-selection guidance. It governs which
**capability tier** gets assigned to each dispatched task, each review pass,
and (where the harness allows) each sub-agent. It is written in terms of
tiers, not specific model names — the principle survives provider and
version changes; the names don't.

The companion discipline at `disciplines/model-routing-and-escalation.md`
states the rule; this doc operationalizes it for day-to-day dispatch
decisions.

---

## Tiers, in capability order

| Tier | Use for |
|---|---|
| **High** | Novel / under-specified work; regression-sensitive code; non-obvious root-cause analysis; cross-system architecture; prod-risk code review; two-strike escalations. |
| **Mid** | Spec-gated implementation against a written brief; tests; verification passes; routine review; mechanical refactors following an existing pattern; docs. **Default tier.** |
| **Low** | Read-only search and lookup; reading a single config; status checks; batched mechanical operations. |

The tier names are deliberately generic. Substitute the strongest model your
harness offers for "high," the standard everyday model for "mid," and the
fastest / cheapest for "low." The decision rules below are the load-bearing
part.

---

## Picking a task's tier

This decision gets made at dispatch time, per brief. Three legs
determine whether a coding task qualifies for the mid tier:

1. **A written spec exists.** Plan, contract, dispatch brief with named
   files and patterns to follow — anything that constrains the approach so
   the agent isn't inventing architecture.
2. **Established patterns cover the approach.** The change follows an
   existing in-repo idiom, not a novel design.
3. **Objective verification gates exist.** Tests, lints, type-checks,
   grep-able invariants the agent must pass before commit.

When **all three** hold → mid tier. When **any** is missing → high tier.

For pure read / lookup / search tasks, route to low. The threshold for low
is not "the task is small" — it is "the task does not generate code or make
decisions." Spinning a low-tier sub-agent to run one `git commit` costs
more in orchestration overhead than it saves; low tier pays off for
**batched** or **parallel** read-only work.

---

## The reviewer is a special case

Adversarial review is the single highest-leverage place to spend model
budget. A reviewer that finds one real regression per session pays for
itself many times over.

- The reviewer should be a **different model** than the implementer.
  Different blind spots; different priors; different failure modes. A
  reviewer that shares the implementer's context produces the same blind
  spots.
- For prod-risk or regression-sensitive change classes, the reviewer
  should be a **stronger model** than the implementer — high-tier review
  on mid-tier implementation is a common shape.
- For docs / pure mechanical changes, the reviewer can match or trail the
  implementer's tier.

The reviewer's tier is decided when dispatching the review brief, not fixed
in advance. A single reviewer instance can take changes of different tiers
if its model can be switched per task; otherwise route to a different
reviewer instance per tier.

---

## The two-strike escalation rule

When the **same task or fix** has been attempted twice at the current tier
without resolution — the test still fails, the error still appears, the
behavior is still broken — the next attempt is at a higher tier, **not** a
third attempt at the same tier.

| Current tier | Failed twice → next attempt |
|---|---|
| Low | Mid (or High if the task is now clearly off-pattern) |
| Mid | High |
| High | High at higher reasoning effort, fresh context, plus an adversarial verification pass. |

What counts as "tried twice": the same logical fix (same files, same
approach, same error class) attempted at least twice without success
confirmed by evidence. The manager self-assesses this from the ACK and
status history. No separate tracking file is needed.

The two-strike rule prevents the most stubborn failure mode in agent-driven
work: an agent generating slight variations of the same wrong fix forever,
each plausible enough to look like progress, none correcting the actual
gap.

---

## The effort dial (orthogonal to tier)

Within a tier, a **reasoning-effort** knob (low / medium / high / max,
depending on the harness) tunes depth without changing tier. Use:

- **Low effort** on mechanical work even at the high tier — type fixes,
  rote renames.
- **High / max effort** on the hardest tasks at the high tier, and as the
  first step of any two-strike escalation.

Effort is the cheaper lever; reach for it before tier when the question is
"how deeply should this be reasoned about?" rather than "which model is
needed?"

---

## What this framework explicitly does NOT do

- It does **not** prescribe vendor or model names. "High" / "mid" / "low"
  map to whatever the user's harness exposes.
- It does **not** assume a single provider. The reviewer being a
  *different* model often implies a *different vendor*; that is by design
  for blind-spot diversity, not an accident.
- It does **not** track tier history per task. The manager self-assesses
  from conversation and status; the framework does not enforce a tier
  graph.

If a routing rule in this doc only makes sense with a specific vendor's
naming, that is a leak — generalize it back to the tier vocabulary or omit
it.

---

## Quick decision table

| Situation | Tier |
|---|---|
| "Investigate why X is intermittent — no clear hypothesis yet." | High |
| "Run the unit test suite and report failures." | Low |
| "Implement the endpoint in `routes/items.ts` per the brief; tests provided." | Mid |
| "Adversarial review of the auth-flow change." | High |
| "Rename the `foo` symbol to `bar` across the package." | Low |
| "Refactor the cache layer for the new invalidation strategy." | High |
| "Add a unit test for the parser regression in `lexer.py`." | Mid |
| "Same failing test, attempt 3." | High (regardless of prior tier) |
| "Read the deploy config and report what's set." | Low |
| "Pick the right schema for a feature whose product brief is two paragraphs." | High |

The table is illustrative, not exhaustive. The three-leg test is the actual
rule; the table is what it looks like in practice.
