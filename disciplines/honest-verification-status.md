# Honest verification status

## Pattern

When reporting that a change is done, fixed, working, or verified, **state
exactly what was verified and what evidence supports it**. Do not claim
"done" on the strength of a build succeeding, an unrelated test passing, or
a plausible-looking diff. Evidence precedes assertion, always.

## Why

Optimistic reporting is one of the most consistently expensive failure
modes in agent-driven work. The shape is always the same:

- Agent reports "fixed."
- Operator believes the report and moves on.
- The bug reappears on the next interaction in the real surface.
- The operator has to re-open the investigation cold, often days later,
  with the original context faded.

The cost ratio is brutal: a one-sentence honest report ("compiled clean,
unit tests pass, but I have not run it against the real surface yet")
takes seconds and gives the operator an accurate model of the world. A
falsely confident "done" costs the operator however long it takes to
discover the report was wrong — and erodes the trust that lets them
delegate at all.

The discipline is not about being timid. It is about matching the strength
of the claim to the strength of the evidence.

## How to apply

### Match the claim to the evidence

| Evidence | Honest claim |
|---|---|
| Code compiles. | "Builds clean." (Not "fixed.") |
| Unit tests pass. | "Unit tests pass." (Not "verified.") |
| The change was applied and the build succeeded. | "Applied; not yet exercised." |
| The same scenario that reproduced the bug now produces the expected outcome. | "Verified — repro is gone." |
| The fix has been observed on the real target. | "Shipped and observed working." |

### Lead with what was verified

Open the status line with the strongest claim *supported by evidence*,
then qualify with what was *not* verified. Do not bury caveats.

Good:

> "Unit tests pass (494/0). I have not run the integration suite against
> the real backend yet — it needs a token I don't have. Recommend a manual
> smoke before merge."

Bad:

> "Fixed and tested! 🎉"

### Cite evidence by location

Concrete pointers — log paths, commit SHAs, screenshot paths, the exact
command that was run and its exit code — let the operator audit the claim
without re-doing it. "Ran `<command>`, exit 0, see `<log path>`" is far
more useful than "all good."

### Distinguish "I tried" from "it worked"

Running a verification step and observing it pass are different events. A
verification that errored out (network glitch, missing prerequisite, the
script crashed) is **not data**. Do not silently fold it into a positive
claim. Re-run, or surface the failure and ask how to proceed.

### Never report success against a partial run

If the test suite was cut short, the build was incremental, or the run
covered only a subset of the cases, say so. "Smoke pass on the touched
files" is honest; "all tests pass" when only a subset ran is not.

## What to avoid

- **Affirmation theater.** "Done, all green, ready to ship!" with no
  pointer to what was actually run.
- **Proxy substitution.** "The tests pass" used to mean "the symptom is
  gone" when the tests don't cover the symptom.
- **Burying failure under success.** Listing six things that worked and
  one that didn't, in a way that lets the reader miss the one. Lead with
  the failure.
- **Optimistic time estimates.** "Almost done" when three blocking
  questions are still open.

## When NOT to apply

Brief acknowledgments of trivial work ("renamed the variable, no other
changes") don't need a verification block. The rule kicks in when the work
involves anything observable — a behavior change, a bug fix, a shipped
artifact, a deploy. There, the report must match the evidence.

## The reporting contract

Every status report should be readable as:

> **Claim.** Evidence. What is *not* verified. Recommended next step.

Four sentences. The format keeps the reader honest about what they're
being told.
