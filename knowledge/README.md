# Knowledge — the on-demand lesson archive

> Layer relationship: `memory/` is Layer 1 (always-loaded index) and Layer 2 (clusters loaded
> on task match) — see [`docs/memory-system.md`](../docs/memory-system.md). `knowledge/` is
> **Layer 3**, one tier further out: the archive that memory *sediments into* when an entry
> stops earning its place in the always-loaded set. It costs zero context until something
> searches or links to it — that's the whole point. See
> [`docs/knowledge-system.md`](../docs/knowledge-system.md) for the full capture → route →
> sediment flow.

## Structure

```
knowledge/
├── README.md            ← you are here
├── problem-solving/      ← full debugging/investigation narratives (>30min, multi-approach)
├── insights/             ← heuristics, process wisdom, meta-learnings
├── patterns/             ← recurring best practices / anti-patterns, observed 2+ times
├── incidents/             ← post-mortems for production/user-facing breakage
└── tech-discoveries/      ← tool/framework quirks not in the obvious docs
```

Every subdirectory ships with a `.gitkeep` (so the empty structure survives a fresh clone)
and one worked example entry (so the category isn't just a name — an agent opening it for
the first time sees the shape it's supposed to fill).

## Categories

### `problem-solving/` — full narratives
A debugging or investigation session that took real effort or multiple dead ends. Captures
the **journey** (what was tried, what failed, what the clue was), not just the final diff —
the journey is what saves the next agent from repeating the same dead ends.

Use when: >30 minutes of investigation, or more than one hypothesis was tried before landing
on the root cause.

### `insights/` — heuristics and process wisdom
A general lesson about *how to work*, not tied to one bug. Often the "why" behind a rule
that now lives in `disciplines/` or a memory file — the insight is the reasoning trail that
justifies the rule.

Use when: a pattern of mistakes (not one instance) reveals something about the process
itself.

### `patterns/` — recurring practices
A concrete technique — or anti-pattern — that showed up more than once across unrelated
tasks or projects. Distinct from `insights/`: a pattern is a *reusable shape you apply*, an
insight is a *reasoning habit you adopt*.

Use when: you catch yourself reaching for the same solution (or the same mistake) a second
time.

### `incidents/` — post-mortems
A production or user-facing break: what happened, blast radius, root cause, the fix, and the
follow-up that prevents recurrence. Higher bar than `problem-solving/` — an incident implies
real impact, not just an annoying bug caught in dev.

### `tech-discoveries/` — tool and framework quirks
A non-obvious behavior of a language, library, framework, or platform — the kind of thing
that isn't in the official docs and costs real time to rediscover if it isn't written down.

## How an entry gets here

Two paths in:

1. **Fresh capture** — the `learn` skill (or a manual write) routes a new lesson straight
   into the matching category as soon as it crystallizes.
2. **Sedimentation** — an existing memory entry stops earning its place in the always-loaded
   index (superseded, narrow, or simply never fired again). Rather than deleting it, the
   `curate` skill moves its content here, drops the index line, and — only if it's plausible
   someone will want to pull it back on demand — leaves a one-line pointer.

Both paths land in the same place because both produce the same kind of artifact: detail
that's worth keeping but doesn't need to cost context on every turn.

## Quality bar

Not every note earns an entry. Write one here only if it would save a future agent more than
~15 minutes, or prevent a mistake that's expensive to make twice. A one-line fix with an
obvious cause belongs in a commit message, not here.

## Adding an entry

1. Pick the category above by asking "what *kind* of thing is this" — a full investigation,
   a quirk, a pattern, an incident, or general wisdom.
2. Copy [`../templates/knowledge-entry.md`](../templates/knowledge-entry.md) and fill in the
   section for that category.
3. Name the file `<topic-slug>.md` (add a date prefix `YYYY-MM-DD-` if the entry is
   time-bound, e.g. an incident or a discovery tied to a specific version).
4. Link related entries and memory files with `[[name]]` — same convention as `memory/`.

## Worked examples

Each subdirectory's example entry uses a generic `acme-*` scenario so the shape is clear
without leaking any real project's specifics:

- [`problem-solving/acme-notes-sync-conflict-resolution.md`](problem-solving/acme-notes-sync-conflict-resolution.md)
- [`insights/acme-derive-dont-retype-fiddly-config.md`](insights/acme-derive-dont-retype-fiddly-config.md)
- [`patterns/acme-dual-read-field-migration.md`](patterns/acme-dual-read-field-migration.md)
- [`incidents/acme-notes-sync-outage.md`](incidents/acme-notes-sync-outage.md)
- [`incidents/search-stale-after-import-2026-02-14.md`](incidents/search-stale-after-import-2026-02-14.md) — the full issue-resolution contract, end to end (see `docs/walkthrough-acme-notes.md`)
- [`tech-discoveries/acme-orm-connection-pool-quirk.md`](tech-discoveries/acme-orm-connection-pool-quirk.md)
