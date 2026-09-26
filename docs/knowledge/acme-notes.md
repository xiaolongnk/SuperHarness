# acme-notes — knowledge pack

> How this project actually works. Architecture, where things live, how to build/test/run/ship,
> the conventions, and the gotchas that aren't obvious from the code. (Fictional example.)

## Summary

acme-notes is a small cross-platform note-taking app. A React single-page web client talks to a
thin Node/Express API, which persists notes to a local SQLite file and keeps a separate full-text
**search index** alongside it. Notes are markdown; search is the headline feature. Offline-first
on the client is a product goal but only partially built (see *Gotchas*).

## Architecture

```
        ┌──────────────────┐        HTTPS / JSON         ┌──────────────────────┐
        │   React web app   │ ─────────────────────────► │   Node / Express API  │
        │   (web/)          │ ◄───────────────────────── │   (api/)              │
        │  - note editor    │                            │  - REST: /notes, ...  │
        │  - search box     │                            │  - search service     │
        └──────────────────┘                            └──────────┬───────────┘
                                                                     │
                                                        ┌────────────┴────────────┐
                                                        ▼                          ▼
                                                ┌──────────────┐         ┌──────────────────┐
                                                │  SQLite db    │         │  search index     │
                                                │  notes.db     │         │  search.idx       │
                                                │ (source of    │         │ (derived from db; │
                                                │  truth)       │         │  must be rebuilt) │
                                                └──────────────┘         └──────────────────┘
```

The key relationship: **`notes.db` is the source of truth; `search.idx` is derived.** Any write
path that changes notes must keep the index in sync, or search goes stale. (This is the root of
the 2026-02-14 incident.)

## Key directories

| Path | What |
|------|------|
| `web/src/` | React client — components, the editor, the search box. |
| `web/src/api.js` | Client-side fetch wrappers for the REST endpoints. |
| `api/routes/` | Express route handlers (`notes.js`, `search.js`, `import.js`). |
| `api/services/search.js` | Search service — builds/queries `search.idx`; exports `rebuildIndex()`. |
| `api/services/import.js` | Bulk import (CSV/JSON → notes). **The path that skipped the rebuild hook.** |
| `api/db/` | SQLite schema (`schema.sql`), migrations (`migrations/`), and `search.idx`. |
| `api/db/notes.db` | The database file (gitignored; created on first `npm run dev`). |
| `scripts/` | Helper scripts (`tag.sh`, `seed.js`). |

## Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` (run once at repo root; workspaces install web + api) |
| Run everything (dev) | `npm run dev` — starts the API on `:4000` and the web client on `:3000` |
| Run API only | `npm run dev:api` |
| Run web only | `npm run dev:web` |
| Tests | `npm test` (all) · `npm test -- search` (scoped to the search suite) |
| Lint | `npm run lint` |
| Rebuild the search index | `npm run reindex` (wraps `rebuildIndex()` over the whole db) |
| Seed sample data | `node scripts/seed.js` |

## Build / deploy

1. Confirm the working tree is clean and on `main`.
2. `npm run lint && npm test` — both must pass; quote the test summary line.
3. `npm run build` — produces `web/dist/` and a bundled API.
4. Tag: `scripts/tag.sh` bumps from the latest `vX.Y.Z` tag.
5. Deploy runs the bundled API behind the static `web/dist/`; **migrations run as part of deploy**,
   never by hand. After a deploy that changed note data shape, run `npm run reindex` against the
   deployed db (the deploy script does this automatically; verify it in the deploy log).
6. Write the release note (per the release-note rule) before reporting done.

## Conventions

- Notes are markdown; the API stores raw markdown and never rewrites it.
- All write paths to notes (`POST /notes`, `PUT /notes/:id`, bulk import) **must** end by
  refreshing the search index — single writes call `rebuildIndex()` for the touched note;
  bulk paths must call a full `npm run reindex` (see *Gotchas*).
- Timestamps are stored UTC (ISO-8601); the client renders local.
- Env config (`API_PORT`, `SIGNING_SECRET`, `IMPORT_BATCH_SIZE`) is read fresh per process from
  the environment — never hard-coded, never committed.

## Gotchas

1. **The search index must be rebuilt after a bulk import.** Single-note writes refresh the
   index inline, but the bulk-import path historically did **not** — so search returned stale
   results until the next single write or a manual `npm run reindex`. This is exactly the
   2026-02-14 incident; the fix added a rebuild at the end of the import transaction. If you add a
   new bulk write path, wire the rebuild in or you'll reintroduce the bug.
2. **`search.idx` is derived — never hand-edit or commit it.** It's rebuildable from `notes.db`
   at any time with `npm run reindex`. If it's missing or corrupt, delete it and reindex; do not
   try to repair it.
3. **The dev API and web client share a port range; a stale dev API on `:4000` will silently
   shadow a new one.** If client calls hit old behavior after a code change, check for a leftover
   `dev:api` process before debugging the code — kill it and re-run `npm run dev`.

## Dependencies

- **Runtime:** Node 20+, npm workspaces, Express, `better-sqlite3` (synchronous SQLite),
  a lightweight FTS library for the search index, React 18 + Vite for the client.
- **Dev/test:** Vitest (unit + integration), ESLint + Prettier.
- **External:** none — fully self-contained; no third-party service or network dependency at
  runtime. (This is deliberate: offline-first is a product goal.)
