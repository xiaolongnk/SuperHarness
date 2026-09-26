---
name: code-review
description: Reviews a change against its plan — checks scope match, hunts correctness bugs, and reports findings by severity.
domains: [quality, review]
tier: both
---

# Code-review skill

## When to use

Invoke after any **substantive change**, before shipping or merging. Most valuable when run by a
**fresh context** that wasn't steeped in writing the change — an implementer reviewing their own
work tends to rubber-stamp their own reasoning.

Skip for trivial mechanical edits (a rename, a formatting-only pass) where there's nothing to
judge. Use `/verify` separately to confirm it actually runs — review reads, verify runs.

## Steps

1. **Get the plan and the diff in front of you.** Read the plan (or the request) first, then the
   full diff — not just the latest commit. You're reviewing against an intent, so you need both.
2. **Check it against the plan.** Does the change implement what the plan said? Flag **scope creep**
   (it does more than asked — unrequested behavior, opportunistic refactors) and **gaps** (it does
   less — a planned piece missing). Both are findings.
3. **Hunt for correctness bugs.** Edge cases, error paths, off-by-one, null/empty handling, race
   conditions, resource leaks. Pay special attention to anything the plan's risk list called out.
4. **Check the invariants and the boundaries.** Does it respect the project's conventions and the
   agent's must-NOT-do scope? Any secrets committed, any generated/derived artifact hand-edited,
   any write to data it shouldn't touch?
5. **Look for simplification.** Duplication that could be reused, a custom solution where a library
   or existing helper exists, dead code, needless complexity. These are lower severity but worth a
   line.
6. **Report findings by severity** — critical / high / medium / low. For each: what, where
   (`file:line`), and the concrete fix. Be specific; "looks fragile" is not a finding.
7. **Fix critical and high before shipping.** Log medium/low to the task board for later. Re-run
   `/verify` after fixing — a fix can introduce a new finding.
