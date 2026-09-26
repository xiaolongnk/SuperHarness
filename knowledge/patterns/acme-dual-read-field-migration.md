# Dual-read field migration

**Observed in**: acme-notes (canonical-field rename), acme-billing (currency field split)
**Pattern type**: best-practice

## Pattern

When changing a canonical field that multiple independent consumers depend on, migrate in
three phases instead of one atomic cutover:

1. **Producer writes both** the old and new field for a soak period.
2. **Each consumer reads the new field first, falls back to the old field** if the new one
   is absent — so producer and consumer PRs can ship in any order without a window where
   something is broken.
3. **Cleanup PR** removes the old field and the fallback reads, only after the soak period
   confirms every consumer has deployed the dual-read logic.

## When to Apply

Any time a field, event shape, or API contract changes and more than one independently
deployed service reads it. The single-cutover alternative requires perfectly coordinated
deploys across every consumer — which is fragile the moment there are 2+ independently
released services, or even just 2+ independently released client versions in the wild.

## Example

acme-notes renamed `note.body` to `note.content` to make room for structured content
blocks. Producer (the API) wrote both fields for two weeks. Each of the three consumers
(web, mobile, export-worker) updated independently, in any order, to read `content` with a
fallback to `body`. Only after telemetry confirmed zero remaining `body`-only reads did the
cleanup PR drop the old field and the fallback branches.
