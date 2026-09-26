# Verify by interaction, not by proxy

## Pattern

A change is "done" only when the **observed symptom is gone in the actual
surface a user touches**. A passing unit test, a successful build, a green
assertion about a derived value, or a rendered snapshot inspected only by code
are all proxies. They may agree with reality. They are not reality.

## Why

Proxies fail in well-known ways:

- A unit test asserts on the *input* to a renderer, not the rendered output —
  a layout regression is invisible to it.
- A snapshot test that "compares pixels" can pass while a user-visible state
  (focus ring, hit region, animation) is broken, because the pixel diff didn't
  cover that region.
- A reachability check ("the function was called") doesn't catch "the function
  was called with the wrong argument" or "the function returned, but the
  downstream side-effect didn't fire."
- A build success guarantees nothing about runtime behavior.

The recurring shape is *the same bug shipping twice* because the gate that
"caught it" was structurally incapable of seeing the failure mode. The fix is
not "be more careful" — it's to align the verification surface with the user's
surface.

## How to apply

For any change that affects an externally observed behavior — UI layout,
network responses, file output, log lines a user reads, exit codes a script
consumes — verification means:

1. **Reproduce the original symptom in the actual surface first.** If a button
   doesn't respond to taps, drive a tap at the button (a real input event into
   the running app) and watch what happens. Add this as a characterization
   test that *reproduces the bug* before any fix is written.
2. **Apply the fix.**
3. **Re-run the same reproduction.** The symptom must be visibly gone in the
   same surface where it was first observed. Only then is the bug fixed.

For non-visual bugs the same shape holds: reproduce the failing call against
the real handler with the real input; fix; re-call; observe the actual return
value / side effect / log line. Don't substitute a mock or a derived assertion
for the observable.

## What counts as a proxy (incomplete list)

- "The build succeeded" → not verification.
- "The unit tests pass" → verification of unit-level invariants only; says
  nothing about composition.
- "The function returned the expected value in a stub harness" → verification
  of the function, not the system.
- "A screenshot was captured" → not verification unless the screenshot was
  *looked at* and matches the intended outcome.
- "A log line appeared" → verification only if the line carries the *content*
  that proves the right thing happened, not just that a code path was taken.

## When NOT to apply

The discipline is about *closing* a fix, not about gating every line. While
exploring, proxies are fine — they're fast. The rule kicks in at the boundary
where you say "this is done" or claim a bug is fixed. At that boundary, an
interaction-level verification is required.

## Boundary against over-verification

Don't demand a render-and-look-at-it pass for changes that have no observable
surface (a refactor with byte-identical output, a rename, a comment). The
target is symptom parity, not theatrical thoroughness.
