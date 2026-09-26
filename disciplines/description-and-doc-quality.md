# Description and doc quality

## Pattern

Descriptions — docstrings, tool / agent schema `description` fields,
registry entries, config-level comments, brief summaries — state what the
thing **IS** and **DOES**. Present tense, factual, free of speculative
examples and runtime-visible coupling to non-users. Rationale lives in
`#` comments alongside the code, not in the description string.

## Why

Description strings are read by downstream consumers — humans, tool
registries, model context, generated catalogs. They are runtime-visible
in a way that source comments are not. Two failure modes recur:

### Stale couplings

A description that names callers, non-users, or sibling components
silently rots. A line like *"Leaf agents (foo, bar) should use this
instead"* inside another agent's description creates a coupling that no
test enforces: when `foo` is renamed or removed, the description still
mentions it, but now incorrectly. The reader can't tell from the
description alone whether the coupling is current.

### Speculative examples

`e.g. <thing that does not exist>` is worse than no example. It implies
the reader can find that thing in the repo. They can't; they waste time
looking; they lose trust in the rest of the doc.

### Marketing instead of describing

"Use this when your agent needs dispatch capability!" is a usage hint,
not a description. The reader who's deciding whether this is the right
component for their problem needs to know *what it is*, not *when to
reach for it*.

## The rules

### 1. Present tense, factual

State what the thing IS and DOES, not what to do with it.

- Bad: *"Use this when your agent needs to talk to the database."*
- Good: *"Connects to the database; exposes `query(sql)` and
  `execute(sql)`."*

### 2. Speculative examples are banned

`e.g.` only appears when the example named **exists in the repo right
now**. If you can't point to a real current example, drop the `e.g.`
entirely.

- Bad: *"e.g. an intermediate orchestration layer"* (where no such
  layer exists).
- Good: *"e.g. `orchestrator/`"* (where `orchestrator/` actually
  exists).

### 3. Don't enumerate non-users inside a thing's own description

A description should not list who **shouldn't** use it. That creates
coupling that goes stale silently.

- Bad: *"Leaf agents (foo, bar) should use lite-mode instead"*, inside
  `full-mode`'s description.
- Good: *"For agents that must never dispatch, use lite-mode instead."*
  (Same direction, no named coupling.)

### 4. Rationale goes in `#` comments, not in description strings

Architectural reasoning ("removes the tool structurally rather than
relying on a prompt-level guard alone") belongs in the block comment
above the code. The description string stays factual.

- Bad: `description = "... removes the tool structurally rather than
  relying on a prompt-level guard alone."`
- Good:
  ```
  # Structural removal is stronger than a prompt-level guard —
  # description stays factual.
  description = "Removes the dispatch tool from the schema."
  ```

### 5. Don't repeat adjacent comments verbatim

If a `#` block directly above the code explains the rationale, the
description string should not echo it. One source of truth: WHY in
comments, WHAT in the description string.

## Quick self-check before writing any description

- Can I replace every *"your agent"* / *"use this when"* with
  *"contains"* / *"provides"* / *"for X agents"*?
- Does every `e.g.` point at something that exists in the repo right
  now?
- Is there architectural reasoning that should move to a `#` comment?
- Am I listing entities that **don't** use this? Move that to the
  caller's description, or to a comment.

## Doc-quality companion rules

The same spirit applies to longer documentation:

- **Lead with what the thing is.** A reader who knows nothing about the
  system should be able to answer "what is this?" from the first
  paragraph.
- **Examples must run.** A code example in a doc is a contract: the
  reader will paste it and try it. If it doesn't run, the doc is wrong.
- **One source of truth.** When the same fact appears in two docs, one
  will drift out of date. Link, don't duplicate.
- **Date or version load-bearing claims.** "Currently supports X" is a
  promise about a moving target. Add the date or the version.

## When NOT to apply

Trivial helper functions whose body explains itself don't need any
description at all. The rule is about descriptions that *exist* — once
you've written one, it should follow these rules.
