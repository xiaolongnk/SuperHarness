# Model routing and escalation

## Pattern

Match the **model tier** to the **complexity of the work**, not to whichever
tier the session happens to be running. When the same task fails twice at the
current tier, **escalate** to a stronger tier (or higher reasoning effort) on
the next attempt rather than repeating at the same level.

## Why

Models have very different cost / capability curves. Running every task on
the most capable tier is expensive and slow; running every task on the
cheapest tier silently fails on the hard ones. Picking by complexity is the
basic discipline.

Escalation matters because the failure mode of "retry at the same tier" is
particularly stubborn: the agent generates a slight variation of the same
wrong fix, costing another round and producing the same outcome. The signal
that the tier is *insufficient for this task* gets buried under "maybe just
one more try." Two strikes is the policy that converts that signal into a
decision.

## Routing by tier

Three tiers are the right granularity for most setups. Call them
**high / mid / low** so the rule survives provider and version changes.

### High tier — use for:

- Novel or under-specified work. No written spec; the approach itself must
  be designed.
- Regression-sensitive code. Fragile guards, prod-risk paths (security,
  data loss, races), concurrency / lifetime bugs.
- Non-obvious root-cause analysis or debugging that spans systems.
- Cross-cutting architectural decisions.
- Production-risk code review.
- Any task where being wrong has high cost and no easy undo.
- **Two-strike escalations** from a lower tier.

### Mid tier — use for (this is the *default* for well-specified
implementation work):

- Spec-gated implementation. A written contract, brief, or plan exists; the
  approach is constrained.
- Established in-repo patterns cover the approach (no architecture
  invention).
- Objective verification gates exist (test suite, lint, grep-able
  invariants) that the agent must pass before commit.
- Writing and extending tests, verification passes, smoke runs.
- Routine (non-prod-risk) code review.
- Build / type errors, mechanical refactors following an existing pattern.
- Documentation, report analysis, summarization.
- Default tier when no other trigger matches.

A coding task qualifies for the mid tier when **all three** hold: written
spec exists; established patterns cover the approach; objective verification
gates exist. If any leg is missing, route to high tier.

### Low tier — use for:

- Read-only search and lookup.
- Listing files, reading a single config, status checks.
- Batched mechanical operations (e.g. routine commits, status polls).
- Any task that is pure read or lookup, no code generation.

The low tier does **not** pay for one-off inline operations — spinning a
sub-agent just to run one `git commit` costs more in orchestration overhead
than it saves in model cost. Low-tier routing pays off for *batched* or
*parallel* read-only work.

## The 2-strike escalation rule

When the **same task or fix** has been attempted twice at the current tier
without resolution (test still fails, error still present, behavior still
broken), the next attempt is at a higher tier OR a higher reasoning effort:

- Attempted at low / mid → next attempt is at high tier.
- Already at high → re-dispatch a fresh-context high-tier attempt at higher
  effort plus an adversarial verification pass.

What counts as "tried twice": the same logical fix (same files, same
approach, same error class) attempted ≥ 2× without success confirmed by
evidence. The agent self-assesses from conversation history; no separate
tracking file is needed.

Do **not** quietly retry a third time at the same tier. Do not ask the
operator to escalate manually.

## Effort dial

Within a tier, a reasoning-effort knob (low / medium / high / max) tunes
depth without changing tier. Use low on mechanical work, high or max on the
hardest tasks at the top tier and on two-strike escalations. The effort dial
is orthogonal to the tier dial; both are levers.

## Routing governs delegated work

This discipline governs how the orchestrating agent picks the tier for
**sub-agents it dispatches**, not the main loop. A session itself runs at
one tier. To change the main tier mid-task, use the harness's model-switch
control; to change a sub-agent's tier, set it at dispatch time.

## Why "always max tier" is wrong

Stronger models are not strictly better at every task. They are also
slower, more expensive, and sometimes over-think simple work — turning a
five-line edit into a ten-paragraph plan. Picking by complexity is what
makes a fleet of agents economical at scale.
