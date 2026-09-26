# Simulators, stubs, and mocks are not the target

## Pattern

A change that has been validated only against a simulator, stub, mock, or local
fake is **not validated**. Final verification runs against the real target
surface — the real device, the real OS, the real server, the real network
path. Simulator-green is permission to *try* the real target, never a substitute
for it.

## Why

The same code runs differently against the real target than against a
substitute. The substitute has, by design, fewer constraints than the real
thing:

- A simulator does not enforce the same sandbox, permission model, file system
  semantics, or hardware quirks as a real device.
- A mock returns the value the test author imagined; a real dependency returns
  what its current production state says, including failure modes that no one
  thought to mock.
- A local fake server has no rate limits, no transient 5xx, no latency, no
  TLS chain to negotiate, no proxy in front of it.
- An in-process stub of a queue / database / cache has none of the contention,
  partial-failure, or ordering surprises of the real one.

When a change passes against the substitute and fails against the real target,
the lesson isn't "make a better substitute." The substitute will always be a
projection. The lesson is: **the substitute is a development convenience; the
target is the gate.**

## How to apply

- **Local fakes are for the inner loop, not the gate.** While iterating, run
  against whichever fake is fastest. Before declaring the change ready, run it
  through the real target end-to-end and capture the result.
- **Name the substitute in the verification claim.** If the only thing you ran
  was a simulator pass, the claim is "passes in simulator" — not "verified." A
  reviewer can then decide whether simulator parity is enough for this change
  class.
- **Match the substitute to the failure mode you care about.** A test that
  mocks the dependency you suspect of being broken cannot tell you anything
  about it. If the question is "does this OAuth flow work?" the substitute
  cannot be a mock OAuth provider; it has to be the real one (or a target
  environment that uses the real one).
- **Treat substrate switches as risk.** Going from "works in simulator" to
  "works on a real device," or "works in local dev" to "works in staging," is
  not a formality — it is a verification step that often surfaces the actual
  bug.

## Concrete shape

When a fix is proposed:

1. Reproduce the bug against the **real target**, not a substitute. (If you
   can only reproduce against a substitute, you haven't reproduced the bug —
   you've reproduced a related one. Keep looking.)
2. Iterate against fakes for speed.
3. Re-run against the **real target** at the end. The same surface that
   reproduced the bug must now show it gone.

## When NOT to apply

Pure logic refactors with no external surface — internal functions whose
inputs and outputs are entirely in-process — can be verified by unit tests
alone. The rule kicks in when the change touches anything that crosses a
process, device, or environment boundary.

## Boundary

This is not "never use mocks." Mocks are essential for fast feedback. The rule
is that they do not *close* a verification claim. A mock-green inner loop +
target-green outer check is the right shape.
