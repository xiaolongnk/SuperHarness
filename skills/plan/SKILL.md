---
name: plan
description: Turns a request into a short written plan — problem, risks, phases, tasks — before any code is written.
domains: [planning]
tier: both
---

# Plan skill

## When to use

Invoke for any **multi-step** task: a feature, a non-trivial bug fix, a refactor, anything where
the steps aren't obvious in one line. Plan first, then execute against the plan.

Skip for genuinely trivial one-liners (a typo, a one-line config change) where writing a plan costs
more than the change. For a big or risky feature, get the plan reviewed before implementing.

## Steps

1. **Restate the request in your own words.** One or two sentences. If your restatement and the
   request disagree, you've found a misunderstanding — resolve it before planning further.
2. **State the problem.** What are we actually solving, and for whom? Name the user-visible outcome
   that means "done."
3. **List the risks and unknowns.** What could go wrong, what's uncertain, what might break that's
   adjacent. Flag anything you'd want a second opinion on. An honest risk list now saves a rewrite
   later.
4. **Break the work into ordered phases.** Each phase is independently checkable — you can stop
   after it and have something coherent. Order them so the riskiest or most uncertain phase comes
   early, where a wrong assumption is cheap to correct.
5. **List the concrete tasks inside each phase.** Specific enough to execute without re-deciding:
   which file, which function, what behavior. Note where tests drive the work (write the failing
   test first).
6. **Define done.** The observable outcome and the check that proves it (a test, a command, a
   behavior in the running app) — this becomes the acceptance bar for `/verify`.
7. **Write the plan down** (a short doc or the task board) and, for a big feature, hand it to a
   fresh-context reviewer before any code. Record the agreed plan so the implementer executes it
   rather than re-improvising.
