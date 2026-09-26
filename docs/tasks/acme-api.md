# acme-api — task board

> EXAMPLE project — see [`runtime/README.md`](../../runtime/README.md).

**Updated:** 2026-07-02

## Now / In progress
- [ ] Auth endpoint returns a 500 on an expired refresh token instead of a 401 — highest
  priority, it's user-visible. Next: reproduce with an expired token fixture, confirm the
  exact code path in the token-validation middleware before patching.

## Next / Queued
- [ ] Export/report async job endpoint (`POST /jobs/export`) — needed by `acme-web`'s CSV
  export button (see `docs/tasks/acme-web.md`, Parked).
- [ ] Add rate limiting to the public REST endpoints.

## Parked / Blocked
- [ ] Export/report job worker
  - **What:** the background worker that actually processes a queued export job and writes
    the CSV artifact.
  - **Next step:** implement `exportJobStatus` in `main.go` as a real state machine
    (queued → running → done/failed) instead of the current stub that always returns
    "queued".
  - **Blocked on:** the job queue's storage backend hasn't been decided yet — needs a design
    call, not more code.
  - **Where:** `runtime/work/code/acme-api/main.go` — `exportJobStatus()`.

## Recently shipped
- [x] Project scaffold + `main.go` stub — 2026-07-02 — `runtime/work/code/acme-api/main.go`
