# Memory system — small context, high recall

> The problem this solves: dump everything into context and it's expensive and noisy; dump
> nothing and the agent is clueless. The fix is two layers — a tiny always-loaded index
> that points to rich detail loaded only when relevant.

> This is one concrete application of [`PHILOSOPHY.md`](../PHILOSOPHY.md)'s primitive #4
> (subtract before you add) — see "Sediment, don't delete" below for how that primitive
> governs the memory layer specifically.

## Two layers

```
LAYER 1 — routing index (always loaded, hard line cap)
   one line per memory: title · pointer · one-line hook
        │
        │  match the current task to a cluster
        ▼
LAYER 2 — clusters (loaded on demand)
   domain clusters:   infra · db · git · ...
   per-project:       acme-notes · other-project · ...
```

### Layer 1 — the routing index

A single always-loaded file with a **hard line cap** (e.g. ~200 lines). It holds *one line
per memory*: a title, a pointer to the detail file, and a one-line hook describing when the
memory is relevant.

It is an **index, never content.** The moment you start writing the actual fact into the
index instead of a pointer, the cap blows and the always-loaded cost balloons. The index's
only job is to let an agent decide *what to load next*.

### Layer 2 — clusters (on demand)

The detail lives in **clusters** — separate files loaded only when the current task matches.
Two kinds:

- **Domain clusters** — cross-project knowledge grouped by area: `infra`, `db`, `git`,
  `engineering`, and so on. Loaded when a task touches that domain.
- **Per-project clusters** — everything specific to one project, loaded when you switch to
  working on it.

The recall flow is always the same:

```
match the task to a cluster  →  load that cluster  →  act
```

You pay the token cost of rich detail only on the tasks that need it. Everything else stays
out of context.

## Memory file anatomy

One fact per file. Small files are easy to load selectively, easy to retire, and easy to
match. Each starts with frontmatter:

```markdown
---
name: verify-before-claiming-done       # kebab-case, unique, stable
description: Run the build/tests and read the output before saying a change works.
                                         # written for relevance matching — this is what
                                         # the router reads to decide whether to load it
type: feedback                           # one of: user | feedback | project | reference
---

Body: the actual fact, stated factually and in the present tense. One idea.
Link related memories inline with [[other-memory-name]].
```

The `description` is load-bearing: it's what an agent (or your routing layer) reads to
decide relevance. Write it as *what the memory is about and when it applies*, not as a
teaser.

### The four memory types

| Type | Captures | Example |
|------|----------|---------|
| **user** | Who the user is — preferences, working style, constraints that aren't about any one project. | "Prefers terse, present-tense docs; works mostly from a phone." |
| **feedback** | *How you should work, and why* — a correction turned into a durable rule. | "Verify a fix on the real app before claiming done — build-green ≠ works." |
| **project** | Ongoing goals/constraints **not derivable from the code** — direction, decisions, known blockers. | "acme-notes deploys to its web host; offline-first is a hard product requirement." |
| **reference** | Pointers to external resources — where a thing lives, how to reach it. | "acme-notes API schema → `docs/knowledge/acme-notes.md#api`." |

Link related memories with `[[name]]` so loading one surfaces its neighbors — a small
knowledge graph that grows without bloating the index.

## Discipline

- **Honor the cap.** When the index hits its line limit, *compress or merge before adding*.
  An index that overflows its cap silently stops being always-loaded — the worst failure
  mode, because recall degrades invisibly.
- **Delete stale on sight.** A wrong memory is worse than a missing one. Retire entries the
  moment they're superseded.
- **Don't store what the repo already records.** Git history, the code itself, and the task
  board are their own source of truth. Memory is for what *isn't* written down anywhere —
  decisions, gotchas, the *why*. Duplicating the code into memory just creates drift.
- **Capture lessons as principles, not one-off fixes.** "Changed line 12" is useless next
  time. "Validate input against an explicit allowlist, not a denylist" transfers. Trace the
  mistake to the principle it violated, store the principle.
- **Convert relative dates to absolute.** "Last week" rots. Write `2026-06-06`. A memory
  read six months later must still be unambiguous.

### Sediment, don't delete

"Delete stale on sight" (above) says *what* to do with a wrong or superseded memory. This
section says *how*, and gives you a number to check the whole system against — this is
[`PHILOSOPHY.md`](../PHILOSOPHY.md)'s primitive #4 (subtract before you add) applied
concretely to the memory layer.

**The two-tier flow.** A memory earns its place in the always-loaded index only by actively
changing a decision. The moment it stops doing that — superseded, narrow one-off trivia, or
simply never fired — it doesn't get deleted outright. It gets **demoted**: move its content
into the on-demand archive at [`knowledge/`](../knowledge/README.md) — this repo's concrete
Layer-2 sediment target, one category directory per kind of captured lesson (see
`docs/knowledge-system.md`) — drop its line from the always-loaded index, and leave a
one-line pointer behind only if it's plausible something will need to pull it back on demand
later. Nothing valuable is destroyed — it's moved from "loaded every turn" to "loaded when
relevant," which is exactly the Layer-1/Layer-2 split this whole document is about, applied
one level up. `knowledge/` is itself fed by the [self-improvement loop](../disciplines/self-improvement-loop.md)'s
CAPTURE step — memory sediment and freshly-captured lessons land in the same place.

**Where memory may be created.** An index with no creation constraint sprawls — every
correction turns into a new file, the index blows its cap, and the *next* agent stops
reading it because it's too long to be useful. So: earn entry. A new memory file is justified
only when the lesson is durable, cross-session, and genuinely not already covered by an
existing entry (check before adding — most "lessons" are a one-turn detail that belongs
nowhere, or a `knowledge/`-tier note, not a new always-loaded memory). An entry not
referenced by the routing index is dead weight — it still gets loaded from disk by whatever
scans the memory directory, so either index it or move it to the on-demand archive; there is
no valid third state.

**The falsifiable metric.** "Keep the working set small" is easy to say and easy to drift
away from one plausible-sounding addition at a time. Make it checkable instead: **the
always-loaded index's line count — and the always-on rule set's total size — must trend
flat or down over time**, even as the on-demand archive grows without limit. Capture a
baseline (line count, file count, byte size) the day you adopt this, and re-measure it
periodically. If the working set keeps climbing turn over turn, this discipline is failing
in practice, and *that* — not "write one more rule" — is the thing to fix next. A system that
only ever adds memory is not learning; it's accumulating, and accumulation is what buries
the entries that actually matter under everything else.

## Why this beats the two obvious approaches

| Approach | Cost | Recall | Verdict |
|----------|------|--------|---------|
| Dump everything into context | high — every token, every turn | high but noisy | expensive, the signal drowns |
| Dump nothing | zero | none — agent is clueless | cheap, useless |
| **Two-layer (index + clusters)** | **low — only the tiny index is always on** | **high — clusters loaded exactly when relevant** | **cheap *and* sharp** |

The index is cheap and always present; the clusters are rich but lazy. You get the recall
of "everything loaded" at close to the cost of "nothing loaded."

## Example: acme-notes

A line in the always-loaded routing index (Layer 1):

```
- [verify-before-claiming-done] feedback — run build/tests + read output before saying it works → [[acme-notes-deploy]]
```

The detail file it points to (Layer 2 — loaded only when the task is about shipping):

```markdown
---
name: verify-before-claiming-done
description: Before reporting a fix as done, run the build and tests and read the
  actual output; for app changes, confirm the behavior in the running app.
type: feedback
---

"Build is green" is not "the bug is fixed." A passing build proves it compiles, not
that the behavior changed. For acme-notes, verify the actual edit-sync flow in the
running app before marking the board item done.

Related: [[acme-notes-deploy]] for how to cut a build to test against.
```

The `[[acme-notes-deploy]]` link means an agent that loads this also knows where to find
the deploy steps — without either fact living in the always-loaded index.

See the index template → [../templates/memory-index.md](../templates/memory-index.md).
