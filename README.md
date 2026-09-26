# SuperHarness

[English](README.md) | [简体中文](README.zh-CN.md)

![status: pre-release](https://img.shields.io/badge/status-pre--release-orange) ![license: MIT](https://img.shields.io/badge/license-MIT-blue) ![node: >=18](https://img.shields.io/badge/node-%3E%3D18-green)

**A harness for running many projects with AI coding agents — from one repo.**

One control point routes each requirement to the right project, keeps a durable task
board per project, loads only the context a task needs, and learns from its own
mistakes without the always-loaded prompt growing. Plain markdown, one zero-dependency
CLI, no daemon.

```sh
npm create superharness my-hub      # scaffold the harness repo
cd my-hub
npx create-superharness add-project notes personal   # register your first project
claude                              # PHILOSOPHY + disciplines load on every session
```

---

## The problem it solves

A single agent session on a single repo works. It stops working at project #4:

- **Context resets.** Every new session re-derives which project owns what, what was
  in flight, and what was already tried.
- **Prompt bloat.** The reflex fix is to paste more into CLAUDE.md. The prompt grows
  with every lesson until nothing in it fires reliably.
- **Nothing learns.** A mistake corrected on Tuesday is repeated on Thursday.

SuperHarness is the structure that fixes all three at once, extracted from a harness
that has run a real 40-project portfolio daily for months.

## What `init` gives you

```
my-hub/
├── CLAUDE.md                 # 30 lines — how a session finds everything else
├── PHILOSOPHY.md             # 4 reasoning primitives (always loaded)
├── disciplines/              # 15 standing rules — index always loaded, bodies on demand
├── skills/                   # 13 skills: route, portfolio-triage, demand-pipeline, learn, curate…
├── docs/
│   ├── portfolio-registry.md # THE routing table: project → tier → responsibilities → keywords
│   ├── tasks/<project>.md    # durable per-project task board (survives /clear + compaction)
│   └── *.md                  # the model: portfolio, architecture, memory, skills, delegation…
├── agents/<project>.md       # per-project agent definition: role, scope, done-criteria
├── memory/MEMORY.md          # capped routing index → clusters/ loaded on match
├── knowledge/                # the uncapped lesson archive (incidents, patterns, insights…)
├── runtime/<tier>/code/<p>/  # your actual repos live here, outside this history
├── scripts/harness-prime.sh  # SessionStart hook: injects the always-loaded core
├── .claude/                  # settings.json (hook) + skills/ → ../skills
└── harness.json              # always-loaded-tax baseline
```

Everything is yours to edit — the CLI copies files, it doesn't wrap them.

## The CLI

| Command | What it does |
|---|---|
| `create-superharness [init] [dir] [--with-examples] [--no-git]` | Scaffold a harness (idempotent — safe on an existing repo; never overwrites). |
| `superharness add-project <name> <personal\|work> [type]` | Register a project: runtime dir + registry row + agent definition + task board, together. A project missing any one of these misroutes the next requirement, so they're never created by hand. |
| `superharness check [--update-baseline]` | Two gates, exit 1 on either: the **always-loaded tax** grew past its baseline, or registry / agents / boards / runtime dirs / skill frontmatter disagree. Put it in CI or a pre-commit hook. |
| `superharness prime` | Print the always-loaded core (what the SessionStart hook injects). |

## The model in three ideas

**1. Portfolio, not task.** `docs/portfolio-registry.md` is a routing table. A requirement
comes in → `skills/route` matches it to a project → that project's `agents/<p>.md` says
how work is done there, `docs/tasks/<p>.md` says what's in flight. The **tier**
(`personal` = commit to main, `work` = branch + PR + review) is a property of the project,
never a per-task judgment call. → [`docs/portfolio.md`](docs/portfolio.md)

**2. One number to defend: the always-loaded tax.** Every layer — disciplines, skills,
memory, knowledge, task state — is split into a small index that loads every session and a
library that loads only on match. The library may grow without limit; the index must trend
flat or down. `superharness check` measures it. Adding project #30 costs a session on
project #1 nothing. → [`docs/architecture.md`](docs/architecture.md)

**3. A loop that fills the library from failures.** Correction → `skills/learn` routes the
lesson to the right layer → `skills/curate` sediments what stopped earning its always-loaded
place into `knowledge/` → `check` proves the core didn't grow. Fix the cause, subtract before
you add. → [`disciplines/self-improvement-loop.md`](disciplines/self-improvement-loop.md)

The four primitives everything else derives from are in [`PHILOSOPHY.md`](PHILOSOPHY.md);
the long-form argument is [`ESSAY.md`](ESSAY.md).

## Adopting without the CLI

It's all markdown. Copy `PHILOSOPHY.md` and `disciplines/` into your agent's system prompt,
`templates/` for the registry / board / agent-definition shapes, and wire
`docs/memory-system.md` by hand. Works with Claude Code, Codex, Cursor, Gemini CLI — anything
that reads a system prompt and follows markdown.

`--with-examples` scaffolds three fictional projects (`acme-notes`, `acme-web`, `acme-api`)
with their agent definitions, boards, knowledge pack and memory, plus
`docs/walkthrough-acme-notes.md`: one project end to end, including a worked incident —
hypothesis → evidence → a first fix that passes tests and still fails the contract's negative
test → the real fix.

## Scope

SuperHarness is the *management layer*: registry, disciplines, skills, memory, task state,
and the CLI that keeps them consistent. It does not spawn or supervise agent processes — run
one session or twenty, the structure is the same. Multi-agent orchestration is
bring-your-own.

## Development

```sh
npm test      # scaffolds into a temp dir, breaks each invariant, proves `check` goes red
```

Clean-room invariant: no real project names, hosts, credentials, or private knowledge —
enforced by `.gitleaks.toml` in CI. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

Code, CLI, templates — **MIT** (`LICENSE`). Docs and disciplines — **CC BY 4.0** (`LICENSE-DOCS.md`).
