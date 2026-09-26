# Repository layout — where everything lives

> The problem this solves: the management layer (§`docs/portfolio.md`) and the runtime projects it
> steers must never blur into one tree. If a runtime project's code lived inside the same git
> history as the management layer's routing knowledge, every commit to a project would also be a commit to the
> framework — and the framework couldn't be shared, versioned, or reset independently of any one
> project. This doc is the concrete directory tree that keeps that split real, not just conceptual.

## The tree

```
<hub>/                                 ← the management layer's own git repo (npx create-superharness init)
├── CLAUDE.md                       read by the agent CLI every session — points at everything below
├── PHILOSOPHY.md                   always-loaded: the 4 reasoning primitives
├── disciplines/                    always-loaded INDEX (README.md); rule bodies on demand
├── skills/                         on-demand skill library; mounted at .claude/skills → ../skills
├── memory/
│   ├── MEMORY.md                   always-loaded routing index (rows machine-read by `check`)
│   └── clusters/<project|domain>.md   on-demand detail
├── knowledge/                      on-demand lesson archive (see docs/knowledge-system.md)
├── docs/                           the methodology (portfolio.md, skills.md, ...)
│   ├── portfolio-registry.md       the LIVE project registry — routing table (rows machine-read)
│   └── tasks/<project>.md          per-project durable task boards
├── agents/<project>.md             per-project agent definitions
├── templates/                      copy-paste starting points
├── scripts/harness-prime.sh        SessionStart hook: injects PHILOSOPHY + disciplines index + MEMORY.md
├── .claude/settings.json           wires the hook; .claude/skills → ../skills
├── harness.json                    always-loaded-tax baseline (`check` holds it flat-or-down)
│
├── runtime/                        ← YOUR projects live here, OUT of this history (see §2 below)
│   ├── personal/
│   │   ├── code/<project>/         one INDEPENDENT git repo per personal-tier project (gitignored)
│   │   └── data/                   gitignored — artifacts, exports, generated output
│   ├── work/
│   │   ├── code/<project>/         one INDEPENDENT git repo per work-tier project (gitignored)
│   │   └── data/                   gitignored
│   └── worktree/                   gitignored — isolation worktrees, one per parallel agent
│
└── docs/walkthrough-acme-notes.md  only with --with-examples: the three example projects (acme-notes,
                                      acme-web, acme-api) in runtime/, agents/, docs/tasks/, docs/knowledge/,
                                      memory/ and the registry, and this end-to-end walkthrough of one
```

## 1. Management layer — everything at the repo root

Every top-level directory except `runtime/` is the management layer: it is small, changes rarely,
and is never itself a deploy target. It is the *policy and knowledge that steers everything else* —
see `docs/portfolio.md` §1 for why keeping this separate from runtime code is what lets the
portfolio scale past a handful of projects.

Two entries deserve a callout because they're where a *specific* project's identity lives inside an
otherwise generic management tree:

- **`agents/<project>.md`** — one file per project, created from `templates/agent-definition.md`.
  This is what an agent loads before touching a project for the first time in a session.
- **`docs/tasks/<project>.md`** — one file per project, created from `templates/task-board.md`. The
  durable state that survives session resets (`disciplines/durable-task-state.md`).

Both live in the management layer even though they describe a runtime project, for the same reason
the registry does: a manager routing across 20 projects needs to read "who owns this, what's its
state" from one place, without checking out 20 separate repos first.

## 2. Runtime projects — independent, tiered, and gitignored (except the shipped examples)

`runtime/` holds the actual codebases the team ships. Three facts define this directory:

1. **Every project under `runtime/<tier>/code/<project>/` is its own independent git repository**
   with its own history, its own remote, its own deploy path. It knows nothing about the management
   layer — no shared `.git`, no submodule, no symlink back into `SuperHarness/`.
2. **The framework SHIPS 3 small example projects here, tracked, to show the structure** —
   `acme-notes` (personal), `acme-web` and `acme-api` (work) — so a fresh clone is
   immediately runnable against `route` / `portfolio-triage` instead of an empty registry. See
   `runtime/README.md`. **Your own runtime projects are NOT meant to join this repo's history**
   the way the examples do: `.gitignore` only excludes the transient/generated pieces
   (`runtime/**/data/*`, `runtime/worktree/*`) — it does **not** blanket-ignore `runtime/`
   itself, because the example code needs to be tracked. Your own project directories stay out
   of this history simply by being independent git repositories on disk (their own `.git`,
   never `git add`ed into this repo) — the same mechanism that keeps any nested repo separate
   from its parent, not a `.gitignore` rule. Delete the examples when you add your own projects
   if you don't want them cluttering `runtime/` (see `runtime/README.md`).
3. **`<tier>` is exactly one of `personal` or `work`**, matching `docs/portfolio.md` §2. The tier is
   decided once per project and read off the registry — it is never inferred from the directory a
   project happens to sit in, but the directory layout mirrors the registry's Tier column so the
   two can never silently drift (a project physically living under `runtime/work/` but registered
   as `personal` — or vice versa — is a sign the registry is stale, not that the layout is wrong).

### Where a project goes

| This project is... | Goes under | Git policy that follows |
|---|---|---|
| Maintained by one owner, no one else's work to conflict with | `runtime/personal/code/<name>/` | commit direct to `main`, push as backup — `docs/portfolio.md` §2 |
| Maintained by multiple people, real coordination cost | `runtime/work/code/<name>/` | feature branch → PR → review gate — `docs/portfolio.md` §2 |

If a project's real maintainer count changes, move it — update both the registry row (Tier column)
and its physical location under `runtime/<tier>/code/` in the same pass, so the two never disagree.

### `runtime/<tier>/data/` — artifacts, not code

Generated output, exports, large fixtures, anything that isn't source-controlled code for that
tier's projects. Kept separate from `code/` so a project's own repo stays lean and its own
`.gitignore` doesn't have to special-case management-layer-generated artifacts.

### `runtime/worktree/` — isolation, not a home

Per `disciplines/worktree-isolation-per-agent.md`: when two or more agents work in the same runtime
project concurrently, each gets its own git worktree here instead of sharing a working directory.
These are **short-lived** — created for the task, removed (or merged back and removed) when it
ships. Nothing durable lives here; a worktree that's still around after its task shipped is stale
and should be cleaned up.

## 3. Mapping to `docs/portfolio.md` §2

This layout is the physical expression of the tier table in `docs/portfolio.md` §2 — read that
section for *why* the two tiers exist and get different handling; this doc only fixes *where* each
tier's projects live on disk. The registry (`docs/portfolio-registry.md`, from
`templates/project-registry.md`) is the source of truth for which tier a project is in; this
directory layout must always agree with it.

## 4. `.gitignore` — what's actually excluded

The management layer's `.gitignore` does **not** blanket-ignore `runtime/` — the framework ships
3 tracked example projects there (§2 above), so a rule that ignored the whole directory would
silently drop them. What it excludes is only the transient/generated pieces:

```gitignore
runtime/**/data/*
!runtime/**/data/.gitkeep
runtime/worktree/*
!runtime/worktree/README.md
```

`data/` and `worktree/` hold generated artifacts and short-lived isolation state respectively —
never source code — so those are excluded outright (with a `.gitkeep`/`README.md` negation so the
empty directories themselves stay present in a fresh clone). The `code/` subdirectories are not
matched by any ignore rule at all: the example projects under them are tracked on purpose, and
your own projects stay out of this repo's history the same way any independent nested git
repository does — by never being `git add`ed here — not by an ignore pattern. If a runtime
project needs to publish something the management layer *should* track (e.g. a generated
knowledge pack), copy the specific file into `docs/knowledge/<project>.md` or similar inside the
management layer — never carve a tracking exception into `runtime/<tier>/data/`.

## 5. Onboarding a new project

Scaffolding this layout for a new project — pick tier, create `runtime/<tier>/code/<name>/`, add
the registry row, create the agent definition and task board — is exactly what
[`skills/onboard-project`](../skills/onboard-project/SKILL.md) automates. Read this doc first to
understand *why* the tree looks like this; use that skill to actually create one.
