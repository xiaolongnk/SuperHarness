# The skill system — SuperHarness's efficiency engine

This is the headline power of the framework. Managing a
portfolio of projects (`docs/portfolio.md`) is only as efficient as the
repeatable operations it can invoke without re-deriving them from scratch
every time. Skills are those repeatable operations, packaged so an agent loads
exactly the ones relevant to the task in front of it — never the whole
library at once.

---

## The `SKILL.md` contract

Every skill is one directory, one file: `skills/<skill-name>/SKILL.md`. The
file has two parts.

**1. YAML frontmatter — the routing metadata:**

```yaml
---
name: <skill-name>          # must match the directory name exactly
description: <one-line, present-tense, factual — what it IS and DOES>
domains: [<domain1>, <domain2>]   # which active-task domains load this skill
tier: both                  # personal | work | both — narrow only if genuinely tier-specific
---
```

- **`name`** — the exact directory name. A mismatch breaks invocation; nothing
  auto-corrects it, so verify it after every rename.
- **`description`** — the single line the routing layer and a human skimming
  the index both read to decide relevance. It carries real weight: a vague or
  speculative description means the skill silently never gets selected, or
  gets selected for the wrong task.
- **`domains`** — the list of active-task domains that should pull this skill
  into context. This is what makes loading *on-demand* instead of *always-on*
  — see the next section.
- **`tier`** — narrows a skill to a subset of the portfolio if it genuinely
  doesn't apply everywhere (e.g. a tier that separates personal projects from
  client/work projects, or whatever tiering scheme an adopter's own portfolio
  uses). Default to `both`; only narrow when a skill would actively mislead
  outside its tier.

**2. Body — the procedure:** a `## When to use` section (the positive case
and the explicit skip case) and a `## Steps` section (an ordered, concrete
procedure — specific enough to execute without re-deciding mid-task what
"file," "check," or "done" means).

---

## On-demand loading by active domain

Loading every skill's full body into every agent's context defeats the point
of having many small skills — the context bill becomes the same as one giant
prompt, just reorganized. The alternative SuperHarness uses:

1. Each task in flight has one or more **active domains** (inferred from the
   task description, the project it targets, or an explicit tag).
2. A routing layer matches the active domain(s) against every skill's
   `domains:` list and loads only the matching skills' bodies into the
   agent's context for that task.
3. A skill with no `domains:` field is invisible to the router — it never
   activates, silently. This is the single most common authoring mistake (see
   `disciplines/skill-design.md`).

The payoff: an agent working a portfolio-routing task sees `portfolio-triage`
and `route`; an agent doing a release sees `release` and `verify`; neither
context is polluted by the other's procedures. The portfolio can grow to
dozens of skills without any single agent's context growing with it — the
routing index, not the full library, is what's always loaded (the same
two-layer shape as the memory system in `docs/memory-system.md`).

---

## What makes a skill CLEAN & POWERFUL

A skill earns its place in the library by clearing all of these, not some:

1. **Single, clear responsibility.** One skill does one job all the way
   through — `verify` confirms a change works; it does not also decide
   whether to ship. A skill that tries to cover two responsibilities becomes
   two half-finished procedures instead of one complete one.
2. **Composable, not monolithic.** A well-scoped skill is a building block
   another workflow can call in sequence — see "How skills compose" below.
   A skill that tries to be the entire workflow by itself can't be reused in
   a different composition.
3. **Evidence-grounded steps, not vibes.** Steps say "run the real command,
   quote the output" (`verify/SKILL.md`) rather than "confirm it works" —
   the procedure should make the honest-verification-status discipline the
   default path, not an extra step someone has to remember.
4. **Concrete arguments or subcommands where the task has real variants.** A
   skill that always does exactly one thing needs no arguments; a skill that
   covers a family of related operations (create / review / merge / check)
   should take a subcommand as its first argument rather than spawning four
   near-duplicate skills.
5. **One canonical home.** A skill's logic lives in exactly one file. If a
   procedure needs to exist in two places (e.g. a skill and a discipline both
   describing "how to write a good description"), one is the source and the
   other is a pointer to it — never two copies that can drift apart.

A skill that fails any of these is a candidate for splitting, merging, or
deletion — not for one more paragraph of clarifying prose.

---

## How skills compose into management workflows

The management skills in `skills/` are deliberately small and chain-able. A
typical portfolio operation is not one skill doing everything — it's several
skills, each independently useful, run in sequence:

```
portfolio-triage → route → demand-pipeline → (optional) open-pr
     │                │            │                  │
     scan every    send the      run it through    if you ship via
     project's     top item to   breakdown →       PR: ship it
     board, find   the right     design → build →  through the
     the top item  project       verify            PR hub
```

Each arrow is a handoff a human or a manager agent can inspect before the
next skill runs — the composition is legible, not a black box. A new
management operation is usually not a new mega-skill; it's a new *sequence*
of the existing small skills, or one new small skill that slots into an
existing sequence. See `skills/README.md` for the full index and
`disciplines/skill-design.md` for the authoring checklist before adding one.
