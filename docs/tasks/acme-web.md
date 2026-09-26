# acme-web — task board

> EXAMPLE project — see [`runtime/README.md`](../../runtime/README.md).

**Updated:** 2026-07-02

## Now / In progress
- [ ] Reports dashboard is showing stale numbers after a report is re-run — investigate
  whether `renderDashboard()` in `app.js` is being called with a cached `reports` array.
  Next: reproduce locally, then follow `disciplines/evidence-before-claim.md` before naming
  a cause.

## Next / Queued
- [ ] Account-settings page: add an email-change flow (request → verify → confirm), gated
  behind a feature branch and PR per the work tier's policy.
- [ ] Marketing site: swap the static hero image for a lazy-loaded responsive set.

## Parked / Blocked
- [ ] Dashboard CSV export button
  - **What:** a button on the reports dashboard that exports the current view to CSV.
  - **Next step:** wire the export handler to the `acme-api` export-job endpoint once that
    endpoint ships (see `docs/tasks/acme-api.md`).
  - **Blocked on:** `acme-api`'s export-job endpoint (Parked there too).
  - **Where:** not yet started — no branch cut.

## Recently shipped
- [x] Project scaffold + `app.js` stub — 2026-07-02 — `runtime/work/code/acme-web/app.js`
