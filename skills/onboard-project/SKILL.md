---
name: onboard-project
description: Register a new runtime project in the portfolio — pick its tier, scaffold its runtime directory, add a registry row, create its agent definition and task board from templates, and gate on completeness before it's considered live
domains: [portfolio]
tier: both
---

**The mechanical half of this skill is a CLI command:** `npx create-superharness add-project <name>
<tier> [<type>]` creates the runtime directory, registry row, agent definition, task board, and
memory row in one gated pass, and `npx create-superharness check` verifies they agree. Run it
first. What remains for this skill is the judgment half — steps 2, 7 and the placeholder
fill-in in step 8 — which no scaffold can do for you.

Turns "we're starting a new project" into a fully-registered portfolio member in one pass — the
single entry point so a new project never ends up with a runtime directory but no agent definition,
or a registry row that points at a task board that doesn't exist. Generalizes the "register a
service" pattern any growing team eventually needs, scoped to what a small management layer
actually requires: no deploy pipeline wiring, no infra provisioning — just the four files that let
the manager route work here correctly starting on day one.

Arguments: `onboard-project <name> <tier> [<type>]`
- `<name>` — kebab-case project name, e.g. `acme-notes`. Becomes the directory name and the key
  used everywhere else (registry row, `agents/<name>.md`, `docs/tasks/<name>.md`).
- `<tier>` — `personal` or `work`. See `docs/portfolio.md` §2 — this is not a formality, it decides
  the git/review/deploy handling every future brief for this project will carry.
- `<type>` — optional, free-text (e.g. `web`, `api`, `cli`, `worker`). Used only to seed the agent
  definition's Stack section with a sensible starting point; not validated against a fixed list —
  a portfolio's project types are open-ended, unlike its tiers.

If `<name>` or `<tier>` is missing, or `<tier>` is anything other than `personal`/`work`, stop and
ask — do not guess a tier. An onboarded project with the wrong tier silently misapplies the wrong
git/review workflow to every brief dispatched to it (`docs/portfolio.md` §2).

## Steps

1. **Check it isn't already registered.** Read `docs/portfolio-registry.md` (or wherever the
   project registry lives per `templates/project-registry.md`) for an existing row named `<name>`,
   and check for an existing `agents/<name>.md`. If either exists, stop and report — this skill
   creates, it doesn't re-onboard. Point at `route` or the existing agent definition instead.

2. **Pick the tier — confirm, don't infer.** `<tier>` was passed as an argument; restate it back
   ("onboarding `<name>` as `work`-tier — feature branch + PR + review gate") so a wrong tier is
   caught before four files get created around it, not after.

3. **Scaffold the runtime directory.** Per `docs/repo-layout.md` §2:
   ```
   runtime/<tier>/code/<name>/
   ```
   Create the directory. Do **not** `git init` inside it as part of this skill — a runtime project
   either already has its own independent repo to be cloned/moved in here, or the human sets up its
   initial git history themselves; onboarding the *portfolio* and initializing *the project's own
   repo* are separate concerns, and this skill only owns the former.

4. **Add a registry row — INSIDE the markers.** Insert one row into the live registry
   `docs/portfolio-registry.md`, immediately **before** its `<!-- projects:end -->` marker. A row
   appended after the marker is invisible to `route`/`portfolio-triage` — placing it inside the
   marked block is the whole point. Use this exact pipe format (backtick-wrap the name), one line:

   ```
   | `<name>` | <tier> | (placeholder — fill in) | <name>, <type> (placeholders) |
   ```

   Flag the responsibilities/keywords as placeholders to fill in — `route` depends on these being
   *specific*, and a freshly-onboarded project's real vocabulary isn't known yet on day one.

5. **Create the agent definition.** Copy `templates/agent-definition.md`'s template block to
   `agents/<name>.md`, filling in: Tier (`<tier>`), Repo path (`runtime/<tier>/code/<name>/`), Stack
   (from `<type>` if given, else a placeholder). Leave Role / Scope / Conventions / Definition of
   done as explicit placeholders for a human to fill — do not invent scope for a project that
   doesn't exist yet.

6. **Create the task board.** Copy `templates/task-board.md`'s template block to
   `docs/tasks/<name>.md`, with today's date in `Updated:` and every section present but empty
   (`Now`, `Next`, `Parked`, `Recently shipped`). An empty board with the right structure is
   correct; a missing board is not — `route` step 5 and every discipline in
   `disciplines/durable-task-state.md` assume this file exists the moment a project is registered.

7. **Optional: seed a knowledge pack.** If the project already has code to describe (an existing
   codebase being brought into the portfolio, not a from-scratch new project), copy
   `templates/knowledge-pack.md`'s block to `docs/knowledge/<name>.md` and fill in what's already
   knowable (stack, directories, build/test commands) from reading the actual repo — never guess
   conventions from the project's name or type alone. For a genuinely new project with no code yet,
   skip this step; there's nothing to document until something exists.

8. **Completion gate.** Before reporting onboarding done, verify all of:
   - [ ] `runtime/<tier>/code/<name>/` exists
   - [ ] a registry row for `<name>` exists with the correct tier
   - [ ] `agents/<name>.md` exists with Tier + Repo path filled in
   - [ ] `docs/tasks/<name>.md` exists with all four sections present
   - [ ] (if step 7 ran) `docs/knowledge/<name>.md` exists

   A project missing any of these is **not** onboarded — it's a partial state that will misroute
   the first requirement that names it. Report which checklist items are done and which are
   deliberately deferred (e.g. "Role/Scope left as placeholders — fill in before first dispatch").

## Why this exists

Four files (runtime directory, registry row, agent definition, task board) have to exist *together*
for a project to be safely routable — a registry row with no task board means `route` step 5 has
nowhere to record the delegation; an agent definition with no registry row means nothing ever routes
here in the first place. Doing this by hand, project after project, is exactly the kind of
repeatable operation `docs/skills.md` says belongs in a skill instead of re-derived reasoning every
time. This is `docs/portfolio.md` §4's "registry + agent definition + task board" triad, made
mechanical, plus the runtime-directory step `docs/repo-layout.md` defines and a completion gate that
catches the partial-onboarding failure mode before it costs a misrouted requirement.
