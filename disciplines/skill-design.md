# Skill design (the authoring discipline)

## Pattern

Every skill declares `domains:` + `tier:` in its frontmatter, has exactly one
responsibility, and passes the "clean & powerful" bar in `docs/skills.md`
before it's added to `skills/README.md`. A skill without these is dead weight
— either invisible to the router or a duplicate of something already there.

## Why

A skill library grows the same way any other collection of files grows:
someone needs a procedure once, writes it down, and moves on. Left
unchecked, that produces a library where half the skills never activate
(missing `domains:`), a third overlap with something else under a different
name, and finding the right one costs more than just doing the task by hand.
This discipline is the gate that keeps the library an actual force-multiplier
instead of a second undifferentiated pile of instructions.

## MANDATORY: every skill declares `domains:` + `tier:`

This is non-negotiable, not a style preference:

- A skill without `domains:` is **never selected** by the on-demand loading
  layer — it silently never activates. There is no error; it just never
  fires. This is the single most common authoring mistake.
- A skill without `tier:` defaults ambiguously — always set it explicitly,
  even if the value is the permissive default (`both`).

### Frontmatter template

```yaml
---
name: <skill-name>            # must match the directory name exactly
description: <one-line factual trigger — present tense, what it does>
domains: [<domain1>, <domain2>]   # every active-task domain that should load this
tier: both                    # personal | work | both (or your portfolio's own tiering)
---
```

## Step-by-step: adding a new skill

1. Create the directory: `skills/<skill-name>/`.
2. Copy the frontmatter template above into `SKILL.md`.
3. Set `name:` to the directory name exactly — verify with a diff, don't eyeball it.
4. Write `description:` against the description-quality bar (below) — this is
   the line that decides whether the skill gets loaded for the right task.
5. Choose `domains:` — every active-task domain where this skill should be
   available. Too narrow and the skill never fires when it should; too broad
   and it pollutes contexts that don't need it. Err narrow, widen based on
   observed misses.
6. Set `tier:` — start with `both`, narrow only when the skill is genuinely
   irrelevant outside one tier of the portfolio.
7. Write the body: `## When to use` (the positive case AND the explicit skip
   case — a skill that never says when *not* to invoke it gets invoked when
   it shouldn't) and `## Steps` (an ordered, concrete procedure).
8. Run the "clean & powerful" check (below) before adding it to
   `skills/README.md`. Do not add an entry to the index for a skill that
   fails the check — fix the skill first.
9. Verify the frontmatter is present and well-formed:
   ```bash
   grep -E "^domains:|^tier:" skills/<skill-name>/SKILL.md
   ```
   Both lines must print.

## The "clean & powerful" validation checklist

Before a skill is added to the index, it must pass all five:

- [ ] **Single responsibility.** Can you state what it does in one sentence
      without an "and"? If not, split it.
- [ ] **Composable.** Could another workflow call this skill as one step in a
      sequence, or does it assume it's the whole workflow? If the latter,
      narrow its scope.
- [ ] **Evidence-grounded steps.** Do the steps say "run X, quote the output"
      rather than "confirm it works"? Vague verification steps reproduce the
      failure mode the honest-verification-status discipline exists to
      prevent.
- [ ] **Arguments/subcommands where variants exist.** If the same skill would
      otherwise need to be copy-pasted four times for four variants, it
      should take a subcommand instead.
- [ ] **One canonical home.** Does this duplicate logic that already lives in
      a discipline, another skill, or a doc? If so, point to the original
      instead of re-writing it.

## Description quality quick-check

A skill's `description:` field follows the same bar as any other
documentation string in this framework:

- Present tense, factual — state what it IS and DOES, not "use this when
  your agent needs X."
- No speculative `e.g.` — only name a concrete example that actually exists.
- No architectural rationale inside the description string — that belongs in
  the body's `## Why` or a comment, not the routing-visible one-liner.
- No enumeration of who should NOT use this skill — that's the non-user's
  own skill description to handle, not this one's job.

## When NOT to add a new skill

- The procedure is a single mechanical step already obvious from the task
  (a one-line config change) — writing a skill for it costs more than doing
  it directly.
- An existing skill already covers this with a subcommand or a small
  parameter change — extend that skill instead of forking a near-duplicate.
- The procedure only makes sense inside one specific project's context —
  that belongs in the project's own agent definition or task board, not the
  shared skill library.

## After writing

- Add the skill to `skills/README.md` under the group it belongs to.
- Re-run the frontmatter grep check above.
- If this skill supersedes an older one, retire the old one in the same
  change — a stale duplicate skill is worse than a missing one; it competes
  for the router's attention and confuses which one is canonical.
