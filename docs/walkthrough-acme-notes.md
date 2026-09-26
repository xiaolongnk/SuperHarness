# Walkthrough: acme-notes, end to end

> A **fictional** project, wired up end to end, to show SuperHarness as a working whole
> rather than a list of templates. It is one of the three example projects that
> `npx create-superharness init --with-examples` scaffolds (see `runtime/README.md`). Nothing here is real — `acme-notes` is an invented
> cross-platform note-taking app (a small React web client + a tiny Node API over SQLite).
> Every command, host, and SHA below is made up for illustration.

The docs explain each artifact in isolation. This walkthrough shows them **together**: one
project, every artifact present and cross-referencing the others, the way it would look in a
real setup after a few weeks of work.

## What to read, and what it demonstrates

| File | Artifact | What it shows |
|------|----------|---------------|
| [`agents/acme-notes.md`](../agents/acme-notes.md) | **Agent definition** | Who works here and how — role, may-do / must-NOT-do scope, pointers to the knowledge pack + board, conventions, definition of done. The first thing loaded when work routes to this project. |
| [`docs/knowledge/acme-notes.md`](knowledge/acme-notes.md) | **Knowledge pack** | How the project actually works — architecture diagram, key directories, build/test/run/deploy commands, conventions, and the gotchas that aren't obvious from the code. |
| [`docs/tasks/acme-notes.md`](tasks/acme-notes.md) | **Task board** | The durable in-flight state — Now / Next / Parked / Recently shipped — that survives a session reset. Note the Parked item carries a SHA, a `file:line`, the exact next step, and the blocker. |
| [`knowledge/incidents/search-stale-after-import-2026-02-14.md`](../knowledge/incidents/search-stale-after-import-2026-02-14.md) | **Incident contract** | The issue-resolution discipline in full: problem → ranked hypotheses → evidence → root cause → fix-with-prediction → acceptance test → attempts table → retrospective. |
| [`memory/MEMORY.md`](../memory/MEMORY.md) | **Routing index (Layer 1)** | The always-loaded routing index: one row per project (acme-notes among them) pointing at its cluster and board. Pointers only — never content. |
| [`memory/feedback-rebuild-index-after-bulk-import.md`](../memory/feedback-rebuild-index-after-bulk-import.md) | **Memory file (Layer 2)** | The lesson from the incident, captured as a transferable **principle** (not a one-off fix), with frontmatter and a `[[link]]` back to the index. |

## How they connect

```
memory/MEMORY.md (always loaded)
        │  "this task is acme-notes" → load its context
        ▼
agents/acme-notes.md ──► points to ──► docs/knowledge/acme-notes.md
        │                                       │
        │                                       └─► gotcha: rebuild index after bulk import
        ▼                                                     ▲
docs/tasks/acme-notes.md  ◄── records what shipped            │
        │                                                     │
        │  a bug surfaces → open an incident, run the contract │
        ▼                                                     │
knowledge/incidents/search-stale-after-import-2026-02-14.md ──┘
        │  retrospective → capture the lesson
        ▼
memory/feedback-rebuild-index-after-bulk-import.md  (linked back from MEMORY.md)
```

The loop closes: a knowledge-pack gotcha and a memory rule both trace back to the same
incident, and the incident's retrospective is what created the rule. That's the method
working — a mistake becomes a durable rule that prevents the next one.

## File map

Where each artifact lives in a harness (the same layout `init --with-examples` produces):

```
<hub>/
├── docs/walkthrough-acme-notes.md            ← you are here
├── agents/acme-notes.md                      ← agent definition
├── docs/knowledge/acme-notes.md              ← knowledge pack
├── docs/tasks/acme-notes.md                  ← task board
├── knowledge/incidents/
│   └── search-stale-after-import-2026-02-14.md   ← incident contract
├── memory/
│   ├── MEMORY.md                             ← routing index (Layer 1) — one row per project
│   ├── clusters/acme-notes.md                ← per-project cluster (Layer 2)
│   └── feedback-rebuild-index-after-bulk-import.md  ← one-fact memory file (Layer 2)
└── runtime/personal/code/acme-notes/         ← the (stubbed) code the incident refers to
```
