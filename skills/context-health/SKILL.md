---
name: context-health
description: Audits every context layer — memory, disciplines, skills, knowledge, and task state — for staleness, bloat, orphaned entries, contradictions, and index drift, deriving every check from the live registries instead of a hardcoded snapshot.
domains: [knowledge, meta]
tier: both
---

# Context-health skill

The audit half of the self-improvement loop (`disciplines/self-improvement-loop.md`). `curate`
sediments what's already known to be stale; `context-health` is what *finds* the drift in the
first place — orphaned files, broken index links, caps quietly blown, disciplines that
contradict each other. Run it after a heavy multi-session stretch, when context feels noisy, or
monthly as a baseline.

Arguments: `$ARGUMENTS` (optional. no args = audit only, report findings. `--fix` = also apply
the safe automations listed at the bottom).

## Maintenance principle — derive checks from live registries, not hardcoded lists

Every check below reads its target list from a **live source** — `docs/portfolio.md` (the
project registry), the actual contents of `skills/`, `disciplines/`, `knowledge/` on disk — not
from a snapshot written into this file. A skill that hardcodes "the five projects are X, Y, Z…"
goes stale itself the first time a project is added or retired, silently auditing the wrong
thing. If you ever catch this skill checking something that no longer matches the live
registry, that's a bug in the skill, not in the portfolio — fix the check, not the registry.

## Layer 1 — Memory audit

Memory lives per `docs/memory-system.md`: a Layer-1 routing index + Layer-2 clusters.

**1a. Routing index budget.** Read the index file's stated line cap (see
`docs/memory-system.md`). Count actual lines and flag any entry whose body text (not a
pointer) exceeds ~2 sentences or ~200 characters — that's content that should have been
relocated behind a pointer, per the index-is-pointers-not-content rule.

**1b. Orphaned memory files.** A file under the memory directory that no index entry and no
cluster references is unreachable — it's dead weight loaded from disk with no way for an agent
to ever be routed to it. For every file, confirm at least one reference exists somewhere in the
index or another cluster; list anything with zero references.

**1c. Broken links.** Every `[[name]]` or path reference inside the index or a cluster should
resolve to a file that actually exists. List any that don't.

**1d. Staleness.** Files not modified in a long window (e.g. 14+ days) are candidates for
review — not automatically wrong, but worth a "is this still true" pass, especially anything
describing infra, config, or environment state that changes over time.

**1e. Contradictions.** Two memory entries covering overlapping topics that give different
guidance. Read pairs with related names/topics and check whether the newer one supersedes the
older — if so, the older should say so or be retired via `curate`.

## Layer 2 — Disciplines audit

Disciplines are the always-on layer (`disciplines/README.md`), loaded into every session.

**2a. Index consistency.** Every file in `disciplines/` (excluding `README.md`) should have a
corresponding row in `disciplines/README.md`'s index table, and vice versa — a discipline not
indexed is invisible to whatever surfaces the set into an agent's prompt; an indexed file that
no longer exists is a broken pointer.

**2b. Shape conformance.** Per `disciplines/README.md`, every discipline follows Pattern / Why
/ How to apply / When NOT to apply. Flag any file missing a section — an unbounded discipline
(no "when not to apply") tends to over-fire and get worked around rather than followed.

**2c. Overlap / redundancy.** Two disciplines saying materially the same thing compete for
attention instead of reinforcing each other. Skim titles and one-line summaries for near-
duplicates; where found, one should be sharpened and the other retired or merged into it (this
is a `curate` action, not a `context-health --fix` one — flag it here, act on it there).

**2d. Referenced-file existence.** Disciplines cite scripts, templates, and other docs by path.
Extract path-looking references and confirm each resolves; a moved/renamed target makes the
discipline silently misleading every session it's loaded.

## Layer 3 — Skills audit

**3a. Frontmatter completeness.** Every `skills/<name>/SKILL.md` must declare `name`,
`description`, `domains`, and `tier` (`disciplines/skill-design.md`). A skill missing
`domains:` is never selected by the router — it silently never activates. List every skill
missing any of the four fields.

**3b. Name/directory match.** `name:` in the frontmatter must equal the directory name exactly.
A mismatch breaks direct invocation by name.

**3c. `skills/README.md` drift.** Diff the set of directories under `skills/` against the set
of skills actually indexed in `skills/README.md` — report skills present on disk but unindexed,
and index entries pointing at directories that no longer exist.

**3d. Clean-and-powerful spot check.** For any skill touched since the last audit, re-run the
five-point checklist in `disciplines/skill-design.md` (single responsibility, composable,
evidence-grounded steps, subcommand for variants, one canonical home). This is a judgment check,
not a script — flag candidates, don't auto-fail them.

## Layer 4 — Knowledge audit

Knowledge lives at `knowledge/` (see `docs/knowledge-system.md`), and per-project detail lives
in each project's knowledge pack.

**4a. Category coverage.** For each category directory under `knowledge/` (problem-solving,
insights, patterns, incidents, tech-discoveries, and any others this portfolio has added):
count real entries (excluding `README.md`/`.gitkeep`). A category sitting at zero for a long
time either means nothing of that type has happened yet (fine) or lessons are being mis-routed
into the wrong category or skipped entirely (worth checking against recent `learn` activity).

**4b. `knowledge/README.md` index drift.** Every real entry file should be linked from the
index; list any that aren't.

**4c. Undated entries.** Files that don't carry a date (in the filename or frontmatter) can't be
assessed for staleness later — flag them for a date to be added.

**4d. Project knowledge-pack staleness.** Per `docs/portfolio.md`, every registered project has
a knowledge pack (`templates/knowledge-pack.md` schema). Flag any pack whose last edit predates
recent activity on that project (commits, task-board updates) — a stale pack actively misleads
the next agent working there.

## Layer 5 — Task-state audit

Per `docs/task-state.md`: a task board per project.

**5a. Registry projects without a board.** Every project row in the registry's `projects` block
(between the `<!-- projects:start -->` / `<!-- projects:end -->` markers in `docs/portfolio-registry.md`)
should have a task board at its registered path. Parse only that block — not the tier→policy table.
List any registered project missing one.

**5b. Stale boards.** A board with open (not-done) items whose file hasn't changed in a long
window (e.g. 30+ days) is either done-but-unrecorded or genuinely parked. Flag for review — a
parked item should still capture enough (state, next step, what it's blocked on) to resume cold;
if it doesn't, that's the fix, not closing it.

**5c. Orphaned agent definitions / plans.** Any per-project agent definition or standalone plan
doc that no board or registry entry references is a candidate for either linking in or
archiving — decide per file, don't bulk-delete.

## Layer 6 — Incidents audit (if this portfolio uses `templates/incident-contract.md`)

**6a. Index drift.** If an incidents index exists, confirm every incident file is listed and
every listed entry has a file.

**6b. Missing retrospective.** Per the incident contract, a closed incident should end with a
retrospective section. Flag any incident marked resolved/closed without one — the lesson was
never extracted, which means it likely never reached `learn` either.

## Health report format

```
## Context Health Report — <date>

### Memory       [status]
- Routing index: N lines (cap: N) — over-cap entries: N
- Orphaned files: N (list)
- Broken links: N (list)
- Stale (>14d): N (list)
- Contradictions flagged: N pairs

### Disciplines  [status]
- Unindexed on disk: N | indexed-but-missing: N
- Missing a required section: N (list)
- Overlap candidates: N pairs (list)
- Broken referenced paths: N (list)

### Skills       [status]
- Missing domains/tier: N (list)
- Name/dir mismatches: N (list)
- README.md drift: N unindexed, N dangling

### Knowledge    [status]
- Empty categories: N (list)
- Index drift: N unlinked entries
- Undated entries: N
- Stale project packs: N (list)

### Task state   [status]
- Registered projects without a board: N (list)
- Stale boards (open, untouched >30d): N (list name + age)
- Orphaned agent defs / plans: N (list)

### Incidents    [status] (if applicable)
- Index drift: N
- Missing retrospective: N (list)

### Priority actions
1. [highest impact / easiest fix first]
2. ...
```

Status per layer: green (nothing flagged or only minor staleness), yellow (several items need a
look), red (a cap is blown or a broken reference is actively misleading an agent right now —
fix red items first, always).

## `--fix` scope

Safe, purely additive or dedup automations only:

- Add a missing index/README entry for a file that exists but isn't listed.
- Remove a broken link/pointer whose target file is confirmed gone (the content isn't deleted —
  it just never existed at that path; removing a dangling pointer is not the same as deleting
  content).
- Add a `> stale — last verified <date>` header to files flagged in 1d / 4a.

Everything else — resolving contradictions, merging disciplines, relocating always-loaded
content, deciding a board item is actually done, adding missing `domains:`/`tier:` (an
activation-scope call) — requires a human or an explicit `curate` pass. `context-health` finds
problems; it does not decide how to resolve the ones that need judgment.

## Why this exists

`learn` and `curate` both assume the always-loaded/on-demand split is intact — but drift
accumulates in a system that runs for a long time: a skill loses its `domains:` field in a
refactor, an index entry outlives the file it points to, two disciplines quietly start saying
different things. None of that shows up as a task failure until an agent hits the exact gap —
by which point the cost has already been paid. `context-health` is the periodic check that
finds the gap before the next agent falls into it.
