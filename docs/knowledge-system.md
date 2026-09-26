# Knowledge system — the on-demand tier below memory

> This document describes `knowledge/`: what each category holds, how entries get there,
> and how it fits below [`docs/memory-system.md`](memory-system.md) in the layered
> architecture. If you haven't read that document yet, read it first — this one assumes
> its two-layer model (routing index + clusters) and extends it one tier further.

## Where this sits in the stack

`docs/memory-system.md` describes two layers inside `memory/`: a tiny always-loaded index
(Layer 1) and clusters loaded on task match (Layer 2). `knowledge/` is **Layer 3** — an
archive one level further from always-loaded, holding detail that:

- never needed to be in memory in the first place (a discovery captured directly, not tied
  to any specific always-loaded rule), or
- **used to be** a memory entry but stopped earning its place there.

```
Layer 1 — routing index         (memory/, always loaded, hard line cap)
Layer 2 — memory clusters        (memory/, loaded on domain/project match)
Layer 3 — knowledge/            (loaded on demand: search, or a [[link]] from memory)
```

The cost profile is the entire point: Layer 3 has **no cap**. `knowledge/` can grow to
thousands of entries and it costs exactly zero tokens on any turn that doesn't search or
link into it. That's the same principle that makes memory clusters cheap (docs/
memory-system.md's Layer 2) — applied one level further out, with an even looser bound
because nothing in `knowledge/` is ever loaded speculatively.

## The four flows

### 1. Capture

A lesson crystallizes during work — a bug finally understood, a quirk discovered, a
pattern noticed for the second time, an incident resolved. The `learn` skill (or a manual
write, same shape) is the entrypoint: state the lesson plainly, trace it to its root cause
or general shape, and write it using [`templates/knowledge-entry.md`](../templates/knowledge-entry.md).

### 2. Route

Not every lesson goes to `knowledge/` directly — some belong in the always-loaded memory
layer instead. The routing decision:

```
Is this "how you should work, and why" — a correction that should change EVERY future task?
  → memory/ (type: feedback), always-loaded index entry

Is this project-specific direction/context not derivable from the code?
  → memory/ (type: project), that project's cluster

Is this a full investigation, a pattern, an incident, a discovered quirk, or general
process wisdom — valuable but doesn't need to be loaded on every turn?
  → knowledge/<category>/, loaded on demand

Is this already recorded by the repo itself (git history, the code, the task board)?
  → nowhere new — don't duplicate what's already durable and queryable elsewhere
```

The categories inside `knowledge/` (see [`../knowledge/README.md`](../knowledge/README.md)
for full definitions):

| Category | Holds |
|---|---|
| `problem-solving/` | Full debugging/investigation narratives — the journey, not just the fix |
| `insights/` | Heuristics and process wisdom not tied to one bug |
| `patterns/` | Recurring best practices or anti-patterns, observed 2+ times |
| `incidents/` | Post-mortems for production/user-facing breakage |
| `tech-discoveries/` | Non-obvious tool/framework/language behaviors |

### 3. Sediment

This is the flow `docs/memory-system.md`'s "Sediment, don't delete" section describes from
the memory side; here is the other half. When a memory entry stops actively changing a
decision — superseded by a newer fact, narrow one-off trivia, or simply never fired again
— it does not get deleted. The `curate` skill:

1. Moves its content into the matching `knowledge/<category>/` file (usually
   `problem-solving/` or `tech-discoveries/`, since most demoted memories are narrative or
   quirk-shaped once the "must load every turn" urgency is gone).
2. Drops its line from the always-loaded routing index.
3. Leaves a one-line pointer behind in the index's neighborhood **only if** it's plausible
   something will need to pull the detail back on demand later — otherwise the demotion is
   silent, because a demoted memory has by definition stopped being something every task
   needs to know about.

Nothing valuable is destroyed. The always-loaded working set shrinks (or stays flat); the
on-demand archive grows. That asymmetry — bounded index, unbounded archive — is the entire
mechanism that lets the system keep learning without getting more expensive to run.

### 4. Load (how an entry gets read back)

`knowledge/` is pulled, never pushed. An agent reaches an entry one of two ways:

- **Explicit search** — grepping/searching `knowledge/<category>/` when facing a task that
  smells like something already solved (a recurring error message, a "haven't I hit this
  before" moment).
- **A `[[link]]`** from a memory file or another knowledge entry that points here for
  detail the always-loaded layer doesn't need to carry.

There is no third path, and that's intentional: if an entry needed to be loaded
automatically on every relevant task, it wouldn't belong in `knowledge/` — it would be a
memory cluster instead. `knowledge/` is specifically for detail that earns its keep only
on the (comparatively rare) occasions someone goes looking for it.

## Quality bar (same as `knowledge/README.md`, restated for emphasis)

Write an entry only if it would save a future agent more than ~15 minutes, or prevent a
mistake that's expensive to repeat. Everything else either belongs in a commit message (if
it's about *what* changed) or nowhere new (if it's already durable somewhere else).

## Relationship to disciplines and skills

- [`disciplines/self-improvement-loop.md`](../disciplines/self-improvement-loop.md) names
  this capture → route → sediment cycle as one stage (CAPTURE, then CURATE) of the larger
  flywheel that also covers reasoning and layering.
- [`disciplines/curate-dont-accrete.md`](../disciplines/curate-dont-accrete.md) is the
  decision procedure the `curate` skill follows when deciding whether a lesson sharpens an
  existing entry, fixes one in place, sediments into `knowledge/`, or genuinely needs a new
  always-loaded rule.
- `skills/learn` is the capture-time entrypoint; `skills/curate` is the periodic
  maintenance pass that performs the sediment flow.
