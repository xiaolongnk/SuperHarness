# Search returns stale results after a bulk import

**Opened**: 2026-02-14 09:20
**Reporter**: maintainer (dogfooding acme-notes)
**Severity**: high
**Status**: verified

> Fictional incident, used to demonstrate the issue-resolution contract end to end.

## 1. Problem (what is observed)

- **Symptom:** After importing ~400 notes via the bulk-import path, searching for text that
  appears in the imported notes returns **no results** (or only pre-import results). Opening an
  imported note directly works — the data is there; only **search** can't see it.
- **Environment:** local dev, `npm run dev`, single SQLite db. Reproduced on a clean checkout.
- **Reproducible?** Yes, every time: import a batch, then search a term unique to an imported note.
- **First seen:** right after the 2026-02-12 share work; bulk import itself hadn't changed, but it
  had never been exercised at this volume before. Single-note creation has always searched fine.

## 2. Initial hypothesis (what we think the cause is)

Ranked by likelihood:

- **(A — most likely) The bulk-import path never refreshes the search index.** Single writes call
  `rebuildIndex()` inline; the bulk path may skip that hook, leaving `search.idx` stale.
- **(B) The import writes to the db but the transaction doesn't commit before search reads**, so
  the index *and* the read see old data — a transaction-ordering bug.
- **(C) The search query itself is broken** — a recent change to `search.js` made queries miss
  rows regardless of import.

## 3. Evidence required to confirm / refute

- **A** → grep `api/services/import.js` for any call to `rebuildIndex()` / `reindex`. Absent →
  confirms A. Also: run `npm run reindex` manually after an import; if search then works → strongly
  confirms A (the only missing step was the rebuild).
- **B** → after import, query the db directly for an imported note. If the row is committed and
  present → refutes B (data is durable; only the index is behind).
- **C** → search for a term in a **pre-existing** (non-imported) note. If that still works →
  refutes C (the query engine is fine; only newly-imported rows are unindexed).

## 4. Evidence gathered

- [2026-02-14 09:40] `grep -n "rebuildIndex\|reindex" api/services/import.js` → **no matches.**
  The import path writes rows and returns; it never touches the index. → **confirms A.**
- [2026-02-14 09:44] After the same failing import, ran `npm run reindex` → search immediately
  returns the imported notes. → **confirms A.**
- [2026-02-14 09:47] Queried the db directly for an imported note post-import → row present and
  committed. → **refutes B** (data is durable; the index is the only stale thing).
- [2026-02-14 09:50] Searched a pre-existing note's term → works fine. → **refutes C** (query
  engine is healthy; only un-indexed imported rows are invisible).

## 5. Root cause (after evidence)

`api/services/import.js` writes imported notes straight to `notes.db` and returns **without
rebuilding the search index**. `search.idx` is a derived artifact; every write path is supposed to
refresh it, but the bulk-import path was added later and never wired in the rebuild that the
single-write paths have. So after a bulk import the index is stale until the next single write or a
manual `npm run reindex`. Evidence: no `rebuildIndex` call in the import path (§4), and a manual
reindex fully fixes search while leaving everything else untouched.

## 6. Proposed fix

- Add a **full index rebuild at the end of the import transaction** in `import.js`, inside the same
  transaction boundary so a failed import doesn't leave a half-rebuilt index. Use the existing
  `rebuildIndex()` (full rebuild) rather than per-note refresh — bulk volume makes per-note
  refresh both slow and easy to get wrong.
- **Prediction:** after the fix, importing a batch and then immediately searching a term unique to
  an imported note returns that note **with no manual `npm run reindex`**. A pre-existing-note
  search continues to work, and an import that fails mid-way leaves search consistent (no partial
  index).
- **Why it addresses the root cause, not the symptom:** the symptom is "search is stale"; the cause
  is "one write path skips the index-refresh invariant." Fixing it at the import path restores the
  invariant *every write path refreshes the index* rather than telling users to reindex manually.

## 7. Acceptance test (mandatory, includes edge cases)

- **Happy path:** create a single note with a unique term, search it → found (regression guard for
  the existing path).
- **Edge case reproducing the original failure:** bulk-import a batch containing a note with a
  unique term, then **immediately** search that term with **no manual reindex** → found. This is
  the exact condition that broke; the test must drive import-then-search in one go.
- **Negative test (don't over-fix):** an import that throws mid-batch must **not** leave search
  serving partially-indexed data — after a failed import, the index reflects the pre-import state
  (rebuild is inside the transaction, so it rolls back with the failed import).

## 8. Attempts (chronological)

| # | When | What was changed | Predicted outcome | Actual outcome | Hypothesis still valid? |
|---|------|------------------|-------------------|----------------|--------------------------|
| 1 | 2026-02-14 10:10 | Called `rebuildIndex()` **after** the import function returned (outside the transaction) | import-then-search finds imported notes | Happy + edge pass, but the negative test fails: a mid-batch failure leaves a stale/partial index because the rebuild ran outside the transaction | Cause right (A), fix placement wrong |
| 2 | 2026-02-14 10:35 | Moved the `rebuildIndex()` call **inside** the import transaction, so it commits/rolls back atomically with the import | all three tests pass, including the failed-import negative case | All three pass; manual reindex no longer needed | Yes — resolved |

> Note: attempt 1's failure was a fix-placement bug, not a wrong hypothesis — the cause (A) held,
> so per the contract we refined the fix rather than re-diagnosing. Had attempt 2 also failed the
> same way, that would have been the signal to go back to §2.

## 9. Resolution

- **Final state:** resolved.
- **Shipped where:** commit `d41f0a2` on `main`, 2026-02-15. Added the in-transaction rebuild plus
  the three acceptance tests in `api/services/import.test.js`.
- **Acceptance test pass:** yes. `npm test -- import` → `Test Files 1 passed · Tests 3 passed`.
  Manual repro (import 400 notes → search) now returns imported notes with no manual reindex.

## 10. Retrospective (mandatory after closing)

- **What we got right:** hypothesis A was ranked first and confirmed in ~30 minutes with three
  cheap observations (grep, manual reindex, direct db query). Refuting B and C early stopped us
  from rewriting the (healthy) query engine.
- **What we got wrong:** attempt 1 placed the rebuild outside the transaction — a real (if small)
  consistency bug the negative test caught. Without that negative test we'd have shipped a fix that
  passed the happy + edge cases but left a partial-index hole on import failure.
- **The gap:** we assumed "call rebuild after import" was the whole fix; the real invariant is
  "the index update is atomic with the write," which only the in-transaction version satisfies.
- **What to do differently / transferable takeaway:** *a derived artifact must be refreshed inside
  the same transaction as the source write — every write path, no exceptions.* Captured as a
  reusable principle in `memory/feedback-rebuild-index-after-bulk-import.md`, and added as a gotcha
  to the knowledge pack so the next person adding a bulk path wires the rebuild in.
- **Time spent vs ideal:** ~1h15m actual. Ideal ~40m — the extra time was attempt 1's
  outside-the-transaction detour, which the negative test would have prevented if written first
  (TDD the acceptance test before the fix).
