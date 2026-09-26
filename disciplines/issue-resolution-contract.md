# Issue resolution contract

> Heavyweight tier. For everyday diagnostic questions and quick "why did X
> fail" answers that don't warrant a written contract, see the lightweight
> `evidence-before-claim.md` tier instead — same underlying discipline,
> smaller footprint.

## Pattern

Non-trivial issues — bugs, regressions, incidents, "this doesn't work" reports
— follow a fixed sequence, written down: **problem → hypothesis → evidence →
root cause → proposed fix with prediction → acceptance test → attempt log →
resolution → retrospective.** No fix is dispatched until problem through
acceptance test are filled in.

## Why

Without the contract, the failure mode is consistent: the agent jumps to a
plausible patch, the patch addresses a symptom, the symptom returns in
another form, and the work iterates indefinitely at the surface layer. A
one-hour fix becomes a seven-hour death march of swapping patches that all
"sort of look right" against a problem that was never characterized.

Writing the contract is cheap. It forces:

- **Articulating what was actually observed**, not what the agent guesses
  was observed.
- **Naming a hypothesis as a hypothesis**, with competing alternatives — so
  the next observation can refute it rather than be assimilated into it.
- **Specifying what observation would confirm or refute** each hypothesis,
  before going to look. This is the difference between evidence and
  rationalization.
- **Predicting what the fix will produce.** A fix without a prediction is
  un-falsifiable. After it's applied, "did it work?" has no crisp answer.
- **Tracking attempts.** Two consecutive attempts with the same failed
  prediction class means the hypothesis is wrong; the rule is "go back to
  hypothesis," not "try a third patch."

The retrospective is what turns a single incident into a transferable lesson.
Without it, the next incident in the same shape gets the same death march.

## The contract artifact

For every non-trivial issue, create one durable document in a known location
under the repo (`knowledge/incidents/<slug>-<date>.md` — the knowledge archive's incident category). It is updated as the
investigation progresses and closed out with the retrospective.

### Sections (all required before any fix is dispatched)

1. **Problem.** Symptom verbatim, environment (versions, devices, recent
   changes), reproducibility, first-seen.
2. **Initial hypothesis.** Two to four competing hypotheses, ranked by
   likelihood. Be honest about uncertainty.
3. **Evidence required.** For each hypothesis: what observation would
   confirm; what would refute.
4. **Evidence gathered.** Append-only log of observations as they come in,
   each annotated with which hypothesis it confirms / refutes / leaves
   inconclusive.
5. **Root cause.** Only filled in when the evidence supports it. Jumping a
   guess in here is a contract violation.
6. **Proposed fix.** The change, plus a **prediction**: after the fix,
   observable outcome X will happen on scenario Y. Plus *why* the fix
   addresses the root cause and not just the symptom.
7. **Acceptance test.** The specific scenarios that must pass before the
   issue is closed. Includes at least one edge case that reproduces the
   original failure mode (not just the happy path) and one negative test
   (a scenario that should still *not* work, so the fix isn't over-broad).
8. **Attempts.** Chronological table: attempt number, what changed,
   predicted outcome, actual outcome, hypothesis still valid?
9. **Resolution.** Final state (resolved / partial / abandoned), where it
   shipped, acceptance-test evidence.
10. **Retrospective** (mandatory after close). What held up, what didn't,
    the gap between expected and actual, what to do differently. The
    bigger the gap, the more important the lesson.

## Rules of the contract

- **No fix dispatch until §1–§7 are filled.** The contract is the gate. If
  you can't write the prediction, you don't yet know what you're doing.
- **Every attempt records its prediction *before* the change**, and the
  actual outcome *after*. Predicting after the fact defeats the loop.
- **Two consecutive attempts with the same failed prediction class** → stop
  iterating and re-do §2–§5. The hypothesis is wrong; no amount of patching
  will fix it.
- **The retrospective is mandatory.** Without it, the next incident
  rediscovers the same wrong path.

## When NOT to apply

- Trivial typos and one-line fixes where the cause is obvious in under a
  minute of looking.
- Routine operational tasks (a scheduled deploy, a settings change) that
  aren't issue resolution.
- Tasks where the contract overhead would exceed the fix itself.

But the default is **apply**. The cost of writing the contract is small;
the cost of even one wasted hour of symptom-patching is large.

## Indexing

A simple index (the `incidents/` section of `knowledge/README.md`, or a dedicated `knowledge/incidents/INDEX.md`) lists open and recent
closed entries — one line per entry: slug, status, one-line problem. The
orchestrator scans it periodically to see what's open and audit
retrospectives for systemic patterns.
