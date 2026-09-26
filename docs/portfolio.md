# Portfolio management — one team, many projects

> The problem this solves: a single agent working one repo at a time doesn't scale past a
> handful of projects — every new project means re-explaining context from scratch, and
> nothing routes a requirement to the right place automatically. The fix: separate the
> **management layer** (routing knowledge, disciplines, skills) from the **runtime
> projects** it steers, and give the control point one table that tells it where every requirement
> goes.

This is SuperHarness's core differentiator: not one task in one repo at a time, but a
model that keeps a whole **portfolio** of independent projects moving from a single control
point — the way a real engineering-management org runs, not the way a single coding session
does. (Note: this describes a *workflow model*, not a multi-agent execution engine — the
control point can be the same agent session working project-by-project in sequence, just as
well as multiple sessions in parallel if you bring your own orchestration.)

## 1. Management layer vs runtime projects

Split your monorepo into two kinds of thing:

- **The management layer** — routing knowledge and scope: disciplines
  (`disciplines/`), skills (`skills/`), the project registry (below), and each project's
  agent definition and task board. This layer changes rarely and is never itself a deploy
  target — it's the policy and knowledge that steers everything else.
- **Runtime projects** — the actual codebases the team ships: independent repos or
  subdirectories, each with its own stack, its own git history, its own deploy path. A
  runtime project knows nothing about the management layer; the management layer knows
  everything about routing work *into* each runtime project.

Keeping these separate is what makes the portfolio scale. If routing knowledge, task state,
and skills lived inside each runtime project, adding project #20 would mean re-solving the
same coordination problem 20 times. Centralizing it means project #20 costs one registry row
and one agent definition — everything else (the manager, the skills, the discipline set)
already applies.

**Repository layout.** This section describes the model; [`docs/repo-layout.md`](repo-layout.md)
is the concrete directory tree it maps to — where the management layer sits, where
`runtime/<tier>/code/<project>/` and `runtime/<tier>/data/` live, and the `.gitignore` snippet
that keeps runtime projects out of the management layer's git history entirely.
[`skills/onboard-project`](../skills/onboard-project/SKILL.md) scaffolds that layout for a new
project mechanically, from tier decision through registry row through agent definition and task
board.

## 2. Runtime tiers — personal/solo vs work/shared

**This is the core insight behind portfolio efficiency: not every project in the portfolio
should be handled the same way.** A portfolio mixes projects with fundamentally different
coordination costs, and imposing one workflow on all of them wastes effort in both
directions — heavyweight process on a project that doesn't need it, and missing guardrails
on a project that does. SuperHarness names exactly two runtime tiers and right-sizes the
handling to each:

| | **Personal / solo tier** | **Work / shared-team tier** |
|---|---|---|
| **Who maintains it** | One owner | Multiple maintainers |
| **Coordination cost** | Near zero — no one else's work to conflict with | Real — parallel changes, review, shared ownership |
| **Git policy** | Commit **direct to `main`**; push as an offsite backup | **Feature branch → PR** — never commit straight to `main` |
| **Review gate** | **None required** — the owner is the only reviewer that exists | **Required** — a second pass (human or reviewer agent) before merge |
| **Deploy path** | Whatever is simplest for one person to run — a script, a manual step | A defined deploy ceremony (CI, staged rollout, approvals) matching the team's risk tolerance |
| **Branch / worktree strategy** | A worktree per parallel agent is still useful for isolation, but branches are short-lived and merge straight back to `main` | Worktree-per-agent **and** branch-per-feature — parallel agents must never share a branch, and a branch survives until its PR merges |
| **Why this is right-sized** | Heavier process here is pure overhead — there's no one to review against, and PR ceremony just slows down a single maintainer for no safety benefit | Lighter process here is a real risk — skipping review or committing direct to `main` is exactly how a shared codebase breaks for someone else without warning |

The tier is a property of the **project**, not of the task or the agent working on it. A
coworker executing a brief for a personal-tier project commits straight to `main` and moves
on; the same coworker executing a brief for a work-tier project opens a branch, works there,
and stops at a PR — the tier is what tells it which of those two shapes applies, before it
touches git at all.

**The failure mode this prevents:** without an explicit tier, a manager either defaults every
project to the heavyweight work-tier flow (a solo side project drowns in unnecessary PR
ceremony) or defaults every project to the lightweight personal-tier flow (a shared team repo
gets direct-to-main commits that silently break someone else's in-flight work). Naming the
tier explicitly, per project, is what lets one manager apply the *correct* — not the
*uniform* — workflow across a mixed portfolio.

## 3. The project registry — a routing table

The registry is the single file a manager reads to answer "which project does this
requirement belong to, which tier does it run under, and can it be split across more than
one?" It's a table, not prose:

| Project | Tier | Responsibilities | Requirement keywords |
|---|---|---|---|
| `<project>` | `personal` \| `work` | one-line summary of what this project owns | the words a requirement uses when it belongs here |

- **Tier** carries the runtime-tier decision (§2) directly on every row — `personal` or
  `work` — so the manager never has to ask "does this project want a PR or a direct commit,"
  it reads the answer off this column before it delegates anything.
- **Responsibilities** is the one-line disambiguator: when a requirement could plausibly fit
  two projects, this is what a human or the manager reads to break the tie.
- **Requirement keywords** are the router's pattern-match surface — terms, technologies, or
  domain nouns that show up in real requirement text and point unambiguously at this project.
  A keyword list that's too broad (generic words like "bug" or "API") makes every requirement
  match everything; keep it specific to this project's actual vocabulary.

**Machine-readable, on purpose.** The live registry is `docs/portfolio-registry.md` (copied from
`templates/project-registry.md`). Its Projects table is delimited by `<!-- projects:start -->` /
`<!-- projects:end -->` markers, and the skills that read it (`route`, `portfolio-triage`,
`context-health`) parse ONLY that block — so the tier→policy table and prose below can share the
same pipe-table/backtick shape without ever being mistaken for a project row.

Copy [`templates/project-registry.md`](../templates/project-registry.md) to start your own.
The [`portfolio-triage`](../skills/portfolio-triage/SKILL.md) and
[`route`](../skills/route/SKILL.md) skills (see [`docs/skills.md`](skills.md)) both read this
table — it's the shared substrate the whole portfolio model runs on, and both read the Tier
column before they finish delegating (see `route/SKILL.md` step 3).

### Per-project overrides

A project's tier sets its *default* handling; overrides are still expected — e.g. a `work`-tier
repo that is, in practice, maintained by one person today and hasn't opted into the full
review gate yet. State the override on that project's row or in a short exceptions list below
the table; don't fork the whole tier model for one project. When a project's real maintainer
count changes (a personal project gains a second contributor, a work project loses its team
down to one), update its Tier value — the tier should reflect current reality, not history.

## 4. Per-project agent definitions + task boards

The registry tells the manager *which* project owns a requirement. Two more files tell it
*how* to work in that project once routed there:

- **Agent definition** (`agents/<project>.md`, see
  [`templates/agent-definition.md`](../templates/agent-definition.md)) — role, scope
  (may-do / must-not-do), where the knowledge pack and task board live, and the project's
  conventions. This is what a coworker loads before touching the project for the first time
  in a session.
- **Task board** (`docs/tasks/<project>.md`, see
  [`templates/task-board.md`](../templates/task-board.md)) — the durable per-project state
  (see [`disciplines/durable-task-state.md`](../disciplines/durable-task-state.md)). Every
  project in the portfolio gets its own board; a top-level index may link to all of them but
  never stores task state itself.

Together, registry + agent definition + task board are the three files that let a manager (or
a fresh coworker with no memory of the project) route work correctly, work inside the right
boundaries, and pick up exactly where the last session left off — for *any* project in the
portfolio, not just the one currently in context.

## 5. Worked walkthrough — a requirement arrives

1. **A requirement lands** on the manager: "Add CSV export to the reports page." Nothing in
   the text names a project explicitly.
2. **The manager reads the registry.** Scanning the keyword column, `reports page` and
   `export` match the `acme-web` row's requirement keywords, not `acme-api`'s. Single-project
   requirement → routes entirely to `acme-web`, tier `work`.
3. **A cross-project requirement** would instead split first: "Add CSV export to the reports
   page, backed by a new export endpoint" touches both `acme-web` (the page) and `acme-api`
   (the endpoint). The manager breaks it into one task per project *before* delegating —
   never one coworker guessing which repo a shared task belongs in.
4. **The manager loads `agents/acme-web.md`** to confirm scope (does this project's agent
   own report-page changes? yes), reads its tier (`work`), and delegates a self-contained
   brief to an idle coworker naming the exact repo/worktree, the scope boundary, the
   acceptance criteria, **and the tier's handling** — here, "branch + PR + review gate, do not
   commit to `main`." A `personal`-tier project's brief would instead say "commit direct to
   `main`, push when done, no PR."
5. **The coworker executes** inside its own worktree, following the tier's handling from the
   brief, verifies the change, and ACKs with artifacts (commit SHA or PR link, screenshot, test
   output).
6. **The manager records the result** on `docs/tasks/acme-web.md` — marks it shipped, notes
   the SHA — and, for the cross-project case, confirms the sibling task on `acme-api`'s board
   reached a compatible state before calling the combined requirement done.
7. **Parallel case:** if the CSV-export requirement had instead split into two genuinely
   independent tasks (frontend page + a completely separate backend job queue with no shared
   contract), the manager dispatches both in the same turn — one coworker per project,
   running concurrently, each verified and recorded independently.

This loop — registry routes, agent definition scopes, task board tracks, skills execute the
mechanics — is what lets one manager keep an entire portfolio moving instead of babysitting
one project at a time. See [`docs/skills.md`](skills.md) for how `portfolio-triage` automates
step 1 (scanning every board for what needs attention) and `route` automates steps 2-4 (the
registry lookup + delegation dispatch) as a repeatable, on-demand operation instead of manual
reasoning every time.
