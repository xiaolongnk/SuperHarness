---
name: rebuild-index-after-bulk-import
description: A derived artifact (search index, cache, materialized view) must be refreshed inside
  the same transaction as the source write — on every write path, including bulk/import paths
  added later. Apply when touching any code that writes notes or imports data in acme-notes.
metadata:
  type: feedback
---

# Refresh a derived artifact atomically, on every write path

When a piece of state is **derived** from a source of truth — the acme-notes `search.idx` is
derived from `notes.db` — every path that writes the source must refresh the derived state, and
must do it **inside the same transaction** as the write.

**Why:** the bug class is invisible. The data is correct (the note is in the db), so direct reads
work and nothing looks broken — only the derived view (search) is stale, which is easy to miss and
maddening to chase. It happens precisely on paths added *after* the invariant was established: the
single-write path refreshed the index, the bulk-import path (added later) didn't, and search went
stale after every import. Refreshing *outside* the transaction is its own trap — a write that fails
mid-way leaves the derived artifact partially rebuilt and inconsistent with the rolled-back source.

**How to apply:**
- When you add or edit any write/import path, ask: does this change the source of a derived
  artifact? If yes, refresh that artifact before the path returns.
- Put the refresh **inside the write's transaction** so it commits or rolls back atomically — never
  after the function returns.
- For bulk volume, prefer one full rebuild (`npm run reindex` / `rebuildIndex()`) over per-row
  refresh — fewer moving parts, harder to get wrong.
- Add a regression test that drives **write-then-read-the-derived-view in one go** (import → search
  immediately), plus a negative test that a failed write leaves the derived view consistent.

Source: [[search-stale-after-import-2026-02-14]] (the incident this lesson came from).
Related: the same invariant is recorded as a gotcha in the acme-notes knowledge pack.
