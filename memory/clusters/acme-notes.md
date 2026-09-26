# acme-notes — memory cluster

Loaded only when a task routes to `acme-notes`. Facts that change decisions here — the
knowledge pack (`docs/knowledge/acme-notes.md`) holds the stable architecture and commands;
this file holds what was learned the hard way. (Fictional example.)

- **Derived artifacts refresh inside the write transaction, on every write path.** The one
  lesson from the 2026-02-14 incident, as a transferable principle:
  [feedback-rebuild-index-after-bulk-import](../feedback-rebuild-index-after-bulk-import.md).
  Load before touching `api/services/import.js` or any new path that writes notes.
- **Share tokens: revoke is scaffolded but the resolver ignores it** (`api/services/share.js:74`,
  commit `a3f9c1e`). Parked on the board with the exact next step — read it before touching share.
- **Full reindex over per-row refresh for bulk volume** (`npm run reindex` / `rebuildIndex()`) —
  fewer moving parts; a per-note fast path is queued on the board, not built.
