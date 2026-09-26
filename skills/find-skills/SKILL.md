---
name: find-skills
description: Lists every skill in the library against its declared domains, and searches skill bodies by keyword when the task's active domain didn't surface the skill you expected.
domains: [knowledge, meta]
tier: both
---

# Find-skills skill

The discovery mechanism for the layered skill architecture (`docs/skills.md`). Domain-based
routing loads exactly the skills that match a task's active domain — which is efficient, but
means a skill that's a genuine fit can still go unseen if its `domains:` tag doesn't happen to
match how the current task got tagged. This skill is the manual override: search the whole
library directly instead of waiting for the router.

Arguments: `$ARGUMENTS` (optional. no args = list every skill grouped by domain. a keyword =
search skill bodies for that keyword. `--domain <name>` = list only skills tagged with that
domain.)

## When to use

- You suspect a skill exists for what you're about to do, but nothing got routed in for the
  active domain — the task may have been tagged narrower than the skill's actual scope.
- You're deciding whether to write a new skill and need to confirm nothing already covers it
  (`disciplines/skill-design.md` step: "an existing skill already covers this — extend it").
- You want a full inventory — e.g. before a `context-health` pass, or when onboarding a new
  contributor who needs to know what's available.

Skip when the router already surfaced the right skill for the current task — searching the full
library at that point is redundant.

## Steps

**No arguments — full inventory grouped by domain:**

1. Read `skills/README.md` for the human-curated grouping (discipline skills, portfolio-
   management skills, etc.) — this is the intentional taxonomy, not just an alphabetical dump.
2. Cross-check against the live directory: every `skills/<name>/` should appear in the README;
   flag any that don't (this doubles as a light `context-health` check — see 3c there).
3. For each skill, read its `domains:` and `tier:` frontmatter and present:
   ```
   <skill-name>  [domains: a, b]  [tier: personal|work|both]
   <one-line description>
   ```

**A keyword — search skill bodies:**

1. Grep every `SKILL.md` under `skills/` for the keyword, not just the frontmatter description
   — the router only ever sees the description, so a skill can be a real match on its body
   content (a `## Steps` section, a subcommand) without the keyword appearing in the one-liner.
2. Report each match with the skill name, the matching line(s) for context, and its declared
   `domains:` — so you can see *why* it didn't get routed (wrong domain tag) versus *whether* it
   should have been written differently.
3. If a real match consistently doesn't get routed for tasks that should trigger it, that's a
   `domains:` precision problem, not a discovery problem — fix the frontmatter (an
   `curate`/`context-health` follow-up), don't keep working around it by searching manually
   every time.

**`--domain <name>` — list one domain's skills:**

1. Grep every `SKILL.md`'s `domains:` line for the given domain and list matches with their
   one-line description. Useful for auditing whether a domain is over- or under-served.

## Why this exists

On-demand loading (`docs/skills.md` §"On-demand loading by active domain") is the whole point of
the skill system's efficiency — but it has exactly one failure mode: a skill that's a real fit
for a task never gets loaded because the domain match missed. Without an explicit way to search
past that gate, the failure is invisible — an agent just doesn't do the thing the skill would
have told it to, and nothing signals that a skill existed. `find-skills` is the escape hatch
that makes the gap discoverable instead of silent, and it's also the check that keeps
`skills/README.md` from drifting away from what's actually on disk.
