# Skills

An index of every drop-in skill in this repo, grouped by purpose. See
`docs/skills.md` for the skill system itself (the contract, on-demand loading,
what makes a skill clean and powerful) and `disciplines/skill-design.md` for
the authoring discipline. Each skill is a directory with one `SKILL.md`
carrying YAML frontmatter (`name`, `description`, `domains`, `tier`) plus a
body.

## Discipline skills

Drop-in single-discipline skills — each wraps one operating discipline as a
runnable slash command.

| Skill | Purpose |
|---|---|
| [plan](plan/SKILL.md) | Turn a request into a short written plan before any code is written. |
| [code-review](code-review/SKILL.md) | Review a change against its plan; report findings by severity. |
| [verify](verify/SKILL.md) | Confirm a change actually works by running it and quoting the output. |
| [release](release/SKILL.md) | Cut a release — build, test, tag, release note, in that order. |

## Self-improvement skills

The engine that makes the layered on-demand architecture actually get smarter over time,
instead of just staying static: `learn` captures, `curate` sediments, `context-health` audits,
`find-skills` is the discovery escape hatch. See `disciplines/self-improvement-loop.md` for how
they wire into one flywheel.

| Skill | Purpose |
|---|---|
| [learn](learn/SKILL.md) | Capture a lesson from a mistake, correction, or discovery; route it to the right layer via the knowledge-routing decision tree. |
| [curate](curate/SKILL.md) | The bounded self-maintenance pass — sediment always-loaded content to on-demand, merge duplicates, never delete; guarded by the flat-or-down metric. |
| [context-health](context-health/SKILL.md) | Audit every context layer (memory, disciplines, skills, knowledge, task state) for staleness, bloat, orphans, and drift, derived from live registries. |
| [find-skills](find-skills/SKILL.md) | List or search the full skill library by domain or keyword — the manual override when domain-routing didn't surface a real match. |
| [onboard-project](onboard-project/SKILL.md) | Register a new project in the portfolio — pick tier, scaffold its agent definition, task board, and knowledge pack from templates. |

## Portfolio management skills

The exemplar skills that show the power described in `docs/skills.md` §"How
skills compose" — a manager's day-to-day portfolio operations, each a single
clean responsibility that composes with the others.

| Skill | Purpose |
|---|---|
| [portfolio-triage](portfolio-triage/SKILL.md) | Scan every project's task board and surface the single top item per project. |
| [route](route/SKILL.md) | Route one inbound requirement to the right project via the registry, then delegate it. |
| [demand-pipeline](demand-pipeline/SKILL.md) | Run a requirement through a staged pipeline — breakdown, design, implement, verify — one context-isolated sub-agent per stage. |

## Optional / situational skills

Skills that are genuinely useful but not part of the core loop every adopter needs —
pull them in when your workflow calls for them.

| Skill | Purpose |
|---|---|
| [open-pr](open-pr/SKILL.md) | The PR hub — create, review, merge, and check a pull request from one entry point. For PR-based workflows; skip if you commit direct-to-main. |

## A typical composition

`portfolio-triage` finds the top item in each project → `route` sends the
highest-priority one to the right project → `demand-pipeline` runs it
through breakdown/design/implement/verify → and optionally `open-pr` ships it
as a PR. Each skill is independently useful, chained into one management
workflow. See `docs/skills.md` for why this composability is the point, not
an accident.
