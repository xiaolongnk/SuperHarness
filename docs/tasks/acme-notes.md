# acme-notes — task board

> Durable in-flight state. Read first, update as you go, flush before stopping. This is the
> single source of truth that survives a session reset. (Fictional example.)

**Last updated:** 2026-02-16  ·  **Current focus:** share-a-note feature + search hardening

---

## Now (actively in flight)

- **Share a note via a revocable link — revoke path.** Token generation and the read-only public
  view are done and merged; revoke is the last piece. Driving it with TDD: revoke must make an
  already-issued token stop resolving (currently a revoked token still 200s — see Parked).
- **Backfill the import-path acceptance test.** The 2026-02-14 search-stale fix shipped; add the
  edge-case regression test that drives a bulk import then immediately queries, so the original
  failure mode can never silently return. Ties to
  `knowledge/incidents/search-stale-after-import-2026-02-14.md` §7.

## Next (queued, not started)

- Offline-first: cache the last-opened notes in the client so the editor opens without the API.
- Empty-state and error-state polish for the search box (no results / API down).
- Migrate `IMPORT_BATCH_SIZE` from a magic number to documented env config.
- Add a `npm run reindex --note <id>` fast path (full reindex is wasteful for one note).

## Parked / Blocked

- **Revoked share tokens still resolve (security).**
  - **Commit:** `a3f9c1e` (revoke endpoint scaffolding — writes the revocation row but the
    resolver doesn't check it).
  - **Where:** `api/services/share.js:74` — `resolveToken()` looks up the token but never joins
    against the `revoked_tokens` table.
  - **Exact next step:** add a `WHERE NOT EXISTS (revoked_tokens.token = :token)` guard in
    `resolveToken()`, then a test that issues → revokes → asserts the public view 404s.
  - **Blocked on:** decision on revocation semantics — should a revoked link 404 (gone) or 410
    (gone, was valid)? Defaulting to **404** unless told otherwise; proceeding once the test is
    written. (Low-stakes, reversible — not waiting on a card.)

## Recently shipped

- **2026-02-15** — Search-stale-after-bulk-import fixed: import path now calls a full index
  rebuild inside the import transaction. (`d41f0a2`) Closed incident
  `search-stale-after-import-2026-02-14.md`.
- **2026-02-13** — Share: read-only public note view behind a signed token. (`7b2e88a`)
- **2026-02-12** — Share: signed share-token generation + `POST /notes/:id/share`. (`1c5d930`)
- **2026-02-10** — Search box debounce (250ms) to stop a request per keystroke. (`9af0b41`)
- **2026-02-08** — Markdown editor: live preview pane toggle. (`4e7d2ac`)
