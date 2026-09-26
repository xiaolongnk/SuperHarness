# runtime/ — the portfolio's actual codebases

This is where the projects a portfolio steers actually live, laid out per
[`docs/repo-layout.md`](../docs/repo-layout.md) §2 and tiered per
[`docs/portfolio.md`](../docs/portfolio.md) §2:

```
runtime/
├── personal/
│   ├── code/<project>/    one independent git repo per personal-tier project
│   └── data/               artifacts, exports, generated output
├── work/
│   ├── code/<project>/    one independent git repo per work-tier project
│   └── data/               artifacts, exports, generated output
└── worktree/                short-lived isolation worktrees, one per parallel agent
```

## Your projects live here but not in this repo's history

Each `runtime/<tier>/code/<name>/` is an **independent git repository** with its own remote and
history that knows nothing about this management layer. `.gitignore` excludes everything under
`code/` except the `.gitkeep` that holds the directory open, so nothing is ever `git add`ed here
by accident.

Register a project with `npx create-superharness add-project <name> <tier>` — it creates the
directory here together with the registry row, agent definition, task board, and memory row that
make the project routable — then clone or move the project's own repo into it.

## The example projects (`--with-examples`)

`acme-notes` (personal tier), `acme-web` and `acme-api` (work tier) are **fictional example
projects**, scaffolded only when you pass `--with-examples`, so a fresh harness has something real
to route work against on day one. Their small source trees are tracked on purpose — they are
illustrations, not a starter kit. `acme-notes` is also the subject of the end-to-end walkthrough
(`docs/walkthrough-acme-notes.md`) and of every worked example under `knowledge/`. When you're done looking at them, delete their directories and
their rows in `docs/portfolio-registry.md` / `memory/MEMORY.md`, plus `agents/<name>.md` and
`docs/tasks/<name>.md`; `npx create-superharness check` will tell you if you missed one.

## `data/` and `worktree/`

`runtime/<tier>/data/` holds generated artifacts (exports, fixtures, build output) — never
source code, never tracked. `runtime/worktree/` holds transient per-agent isolation
worktrees per `disciplines/worktree-isolation-per-agent.md` — nothing durable lives there.
Both are gitignored.
