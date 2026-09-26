# Architecture — the layered on-demand model

> The single organizing principle behind every mechanism in this repo:
> **context is impermanent and expensive, so keep the always-loaded core small,
> push everything else into an on-demand library that loads by domain/task
> match, and run a learning loop that feeds that library from failures while
> keeping the always-loaded core bounded.**

[`docs/memory-system.md`](memory-system.md) already documents this pattern for
one layer — memory. This document generalizes it: the same index/library split
governs rules, skills, memory, knowledge, and task boards alike, because they
are all instances of one structural idea, not five unrelated designs.

## The one idea

Every layer in this repo answers the same question the same way: **is this
piece of content read on every turn, or only when a task matches it?**

```
ALWAYS-LOADED CORE                    ON-DEMAND LIBRARY
(small, bounded, read every turn)     (unbounded, read only on match)
────────────────────────────────      ──────────────────────────────
PHILOSOPHY.md (4 primitives)          disciplines/*.md (loaded selectively
disciplines/README.md index             by situation, not all-at-once in
                                         practice — see below)
memory routing index (Layer 1)        memory clusters (Layer 2)
skills/README.md index                skills/<name>/SKILL.md bodies
task board headers                    task board detail / history
knowledge/README.md index             knowledge/<category>/*.md entries
```

The left column is what an agent pays for on every single task, regardless of
what that task is. The right column costs **zero context until something
matches it** — a domain tag, a project name, a task type, a keyword in the
description. This is not five separate optimizations; it is one rule applied
five times.

## Why "trim" means relocate, never shrink

A library that grows is healthy. A hundred skills, a thousand knowledge
entries, a memory cluster per project — none of that costs anything on a task
that doesn't touch them. The failure mode this repo optimizes against is not
"the library is too big." It's **the always-loaded core creeping upward** —
one more "IMPORTANT" paragraph in a README, one more fact inlined into an
index instead of pointed to, one more discipline file whose full body gets
pasted into every agent's prompt instead of loaded on match.

So when something in the always-loaded core needs to shrink, the fix is never
deletion of information — it's **relocation**: move the content from the
core to a library entry, and leave behind only the pointer (a title, a
one-line hook, a `domains:` tag) that lets the router find it again. See
[`docs/memory-system.md#sediment-dont-delete`](memory-system.md#sediment-dont-delete)
for this move worked through in full for the memory layer specifically —
the same move applies to every other layer in the table above.

## The always-loaded tax is the only optimization target

Everything else in this repo — how many skills exist, how many knowledge
entries accumulate, how many per-project memory clusters pile up — is free to
grow without limit. There is exactly one number worth watching:

**the always-loaded tax** — the total bytes an agent's context pays on *every*
task, before any routing or domain match happens. That is PHILOSOPHY.md, the
disciplines index, the memory routing index, the skills index, and whatever
else is wired to load unconditionally.

This reframes what "efficient" means for this framework. It is not "few
skills" or "short knowledge base" — a rich, deep library is the entire point,
it's what lets an agent stop re-deriving solved problems from scratch. It is
"the tax stays flat while the library grows." A framework that only ever adds
to the always-loaded core is not scaling; it is accumulating a second copy of
the library inside the part everyone pays for on every task.

## Why this scales to many projects

The concrete test: **what does adding project #30, skill #110, or knowledge
entry #700 cost an agent working on project #1?**

Under the layered model, the answer is zero. Project #30 gets its own memory
cluster and task board, entered in the routing index as one line. Skill #110
gets its own `SKILL.md` with a `domains:` tag, entered in `skills/README.md`
as one row. Knowledge entry #700 lives under `knowledge/<category>/`, entered
in that category's index as one line. None of that content loads into an
agent's context unless the current task's domain, project, or keyword matches
it. The portfolio can grow indefinitely and the per-task context bill does
not move.

Compare the alternative: a framework that concatenates everything relevant
into one big prompt as the portfolio grows. That model's cost is
`O(portfolio size)` per task. The layered model's cost is `O(1)` per task —
bounded by the always-loaded core, independent of how much has accumulated in
the on-demand library. This is the entire argument for treating the tax, not
the library size, as the metric to defend. See
[`docs/portfolio.md`](portfolio.md) for how this plays out across a real
multi-project portfolio.

## Applying the model to every layer

| Layer | Always-loaded core | On-demand library | Match key |
|---|---|---|---|
| Reasoning | `PHILOSOPHY.md` (4 primitives) | — (primitives are deliberately the one layer with no library; see PHILOSOPHY.md) | always |
| Discipline | `disciplines/README.md` index | `disciplines/*.md` bodies | situation named in the index row |
| Memory | routing index (Layer 1, hard line cap) | memory clusters (Layer 2) | project / domain |
| Skills | each skill's `description:` frontmatter (the agent CLI loads these) | `skills/<name>/SKILL.md` bodies | active task `domains:` tag / the description matching |
| Knowledge | — (`knowledge/README.md` is read when `learn`/`curate` run) | `knowledge/<category>/*.md` entries | category + keyword match |
| Task state | task board header (current status) | task board history / detail sections | the project currently in flight |

Every row is the same shape: a small, cheap pointer layer that is always
present, and a rich detail layer that is only ever paid for when it's
relevant. An agent onboarding to this repo only needs to learn this shape
once — it then recognizes it in every subsystem instead of learning five
unrelated conventions.

## Where the library gets filled from

A layered architecture is only as good as what populates its on-demand tier.
A library that never grows past its seed examples is decoration, not
infrastructure. [`disciplines/self-improvement-loop.md`](../disciplines/self-improvement-loop.md)
is the mechanism that keeps the library growing from real failures while
holding the always-loaded core to the flat-or-down discipline described
above — read it next.
