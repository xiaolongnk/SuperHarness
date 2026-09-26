---
name: verify
description: Verifies a change actually works by running it and quoting the observed output — a build passing is an assertion, a quoted test summary is evidence.
domains: [quality, verification]
tier: both
---

# Verify skill

## When to use

Invoke before claiming any change is **fixed / passing / done**, and before committing or shipping.
This is the gate that stops "I think it works" from being reported as "done."

Always run it — there's no change too small to confirm. For a pure behavior change, also confirm the
behavior in the running app, not just a passing build.

## Steps

1. **State what "works" means** for this change — the specific observable outcome that proves it
   (a test passes, a command returns X, the feature behaves correctly in the running app). Pull this
   from the plan's definition of done if there is one.
2. **Run the project's checks** — lint, then the test suite (scoped to the area you changed is fine,
   but don't skip the relevant tests). Run the real command, not a remembered result.
3. **Read the output.** A command that *errored* is not a pass — confirm it exited cleanly and the
   numbers are real (e.g. `Tests 3 passed`, not a crash or a "0 tests run"). A green-looking line
   from a run that never executed your test is a false pass.
4. **For a behavior change, exercise the behavior.** Start the app, drive the actual path the change
   affects, and observe the result. Reproduce the original failure scenario if this was a bug fix —
   confirm it no longer happens.
5. **Verify the artifact that actually runs**, not just the working tree. A fix that's saved but not
   in the running build/deploy is not shipped — confirm the change is present in what executes.
6. **Quote the evidence in your report.** Paste the test summary line, the command output, or
   describe the observed behavior. Claiming success without quoting what you saw is the failure
   this skill exists to prevent.
7. **If it doesn't work, say so plainly** and stop — do not report done. Hand the failing output to
   `/code-review` or back to the fix.
