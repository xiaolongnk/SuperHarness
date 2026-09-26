---
name: curate
description: The bounded self-maintenance pass that sediments stale always-loaded content into the on-demand archive without ever deleting it, keeping the working set flat-or-down while the archive grows freely.
domains: [knowledge, meta]
tier: both
---

# Curate skill

The curation half of the self-improvement loop (`disciplines/self-improvement-loop.md`).
`learn` fills the library; `curate` is what keeps the *always-loaded* part of it from growing
without bound while the library itself keeps growing. Run it periodically (weekly, or any time
the routing index feels cluttered) — not after every task.

Governed by `PHILOSOPHY.md` primitive #4 (subtract before you add) and
`disciplines/curate-dont-accrete.md` — read both before running this, they define *why* this
pass is bounded the way it is.

## When to use

- On a schedule (weekly baseline) as harness hygiene.
- Any time the always-loaded routing index (`docs/memory-system.md` Layer 1) feels long, or an
  agent reports it's hard to find the right memory.
- After a burst of `learn` activity (a heavy multi-session feature, a big incident) that likely
  added several new entries at once.

Skip if the working set is already at or under its cap and nothing has been added since the
last pass — there's nothing to sediment.

## Hard rules (safety — read before running)

- **Preserve the layered on-demand architecture.** The whole point of the two-layer memory
  system (and the same shape applied to disciplines/skills/knowledge) is that a large on-demand
  archive costs *zero* context until matched. The ONLY optimization target is the
  **always-loaded tax** — the routing index's line count and the always-on discipline set's
  total size. **Never** shrink the on-demand archive for its own sake, and never collapse
  domain/project routing to make the archive "smaller" — that defeats the architecture this
  whole system is built on.
- **Never delete content.** The only two moves are: (a) **relocate** (move a file or a bullet
  from always-loaded to on-demand, or from one on-demand location to a better one) and
  (b) **merge** (combine two entries that say the same thing into the sharper one, keeping the
  content). Both are reversible by construction — the content survives, just not in the
  always-loaded set.
- **Metrics guard.** Capture the working-set metrics *before* and *after* the pass:
  - Routing index line count (against its stated cap, e.g. ~200 lines — see
    `docs/memory-system.md`).
  - Always-on discipline set total size (bytes/lines — against whatever cap this portfolio has
    set).
  - On-demand archive file count (`knowledge/`, per-project packs, clusters) — this number must
    stay **flat or go up**. A curate pass that shrinks the archive has deleted content, which
    violates the rule above — abort and report instead.
  If the pass can't get the always-loaded set under cap without losing routing (i.e. every
  remaining entry is genuinely load-bearing for every task), stop and report the overage rather
  than force a cut that breaks recall.
- **No secrets ever reach a commit.** Grep the staged diff for anything that looks like a
  credential before committing (see the portfolio's own secret-handling convention if one
  exists).
- **Small, reversible commits.** One logical relocation/merge per commit where practical, clear
  messages, so a bad call is a single revert away.

## The pass (in order)

1. **Baseline.** Record the before-metrics: routing index lines, discipline-set size, archive
   file count. This is the number the pass is judged against.
2. **Find sediment candidates.** An entry is a candidate if it meets ANY of:
   - It hasn't been referenced or matched by a task in a long time (stale) AND its content is
     narrow enough that it doesn't need to be *always* loaded — it needs to be *loadable*.
   - It duplicates, or nearly duplicates, another entry.
   - It's a verbose multi-paragraph entry sitting directly in the always-loaded index instead of
     behind a pointer (violates the "index is pointers, not content" rule).
3. **Sediment.** For each candidate: move its content into the correct on-demand location — a
   domain cluster, a project's knowledge pack, or `knowledge/<category>/` (pick the category
   using the same decision tree `learn` uses) — and replace the always-loaded entry with either
   nothing (if it was pure verbose content now living elsewhere) or a one-line pointer (if it's
   still plausible something will need to pull it back on demand).
4. **Merge near-duplicates.** Two entries covering the same lesson: fold into the one with the
   sharper wording and the more accurate routing metadata; the other's unique content (if any)
   gets appended into the survivor before it's retired. Nothing is lost, only consolidated.
5. **Verify the guard.** Re-measure the three metrics from step 1. Confirm: routing index ≤
   cap, discipline set ≤ cap, archive file count ≥ baseline. If any check fails, the pass is not
   done — either sediment more (if over cap) or investigate what shrank the archive (if that
   dropped, something was deleted instead of relocated — fix it before committing).
6. **Commit and report.** Commit the relocations/merges with messages that name what moved
   where. Report a one-line digest: before → after for each of the three metrics, plus a short
   list of what was relocated or merged and why. This report is itself worth keeping — it's the
   evidence that the flat-or-down claim in `disciplines/curate-dont-accrete.md` is actually true
   over time, not just asserted.

## Boundary

If a judgment call is unclear — is this entry actually obsolete, or just quiet? which category
does this straddle? — **leave it and report it** rather than guess. Curation errs toward keeping
content in place; the only aggressive move it's allowed to make is relocation, which is
reversible. A deletion is never the right call for this skill — if something genuinely needs to
be destroyed (a secret leaked into a file, content that's actively wrong and dangerous to keep
around), that's a decision for a human, not this pass.

## Why this exists

Without a bounded curator, a system that only ever runs `learn` (add, add, add) accumulates
until the always-loaded routing index blows its cap and stops being read in full — recall
degrades invisibly, which is worse than never having captured the lesson at all, because now
there's a false sense that it's covered. `curate` is the other half of the flywheel: it's what
makes "on-demand archive grows without limit, always-loaded core stays flat" an actual property
of the system instead of an aspiration.
