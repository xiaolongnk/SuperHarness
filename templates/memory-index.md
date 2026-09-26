# Memory index — template

> `npx create-superharness init` generates this file (with an empty project table) at
> `memory/MEMORY.md`, and `add-project` appends a row per project — the rows between the
> `projects` markers are machine-read by `check`. Links are relative to `memory/`. Copy to your always-loaded memory root (one file). This is the routing index: the tiny,
> always-loaded layer that points to everything else. It is *all pointers, no content* — that's
> what keeps it cheap enough to load every session. Hard line cap: ~200 lines.

---

```markdown
# <hub-name> — memory index

> Two layers: this always-loaded routing index + per-domain clusters loaded on demand.
> Hard cap: ~200 lines. Every line is a POINTER with a one-line hook — never multi-line content.
> `superharness check` counts this file toward the always-loaded tax.

## Project directory

<!-- projects:start -->
| Project | Current focus | Cluster | Task board |
|---|---|---|---|
| `acme-notes` | <one-line current focus> | [cluster](clusters/acme-notes.md) | [board](../docs/tasks/acme-notes.md) |
| `acme-web` | <one-line current focus> | [cluster](clusters/acme-web.md) | [board](../docs/tasks/acme-web.md) |
<!-- projects:end -->

**Routing rule:** incoming task → match a project above → read its task board FIRST (what's in
flight), then its cluster (what was learned), then work.
Unknown task (no clear owner) → `docs/portfolio-registry.md` via `skills/route`.

## Critical always-on rules
The reasoning primitives are in `PHILOSOPHY.md` and the standing rules in `disciplines/` — both
already injected every session. Add a line here ONLY for a project-specific rule that must fire
before the first tool call; everything else belongs in a cluster or `knowledge/`.
- **[<rule title>](../disciplines/<file>.md)** — <one-line hook: when it fires>.

## Clusters — load on demand
One line each: what's inside, so an agent knows when to load it.
- [acme-notes cluster](clusters/acme-notes.md) — sync quirks, build state, deploy steps.
- [database cluster](clusters/database.md) — schema rules, migration discipline.
- [git & PR cluster](clusters/git.md) — branch policy, PR format, review gates.
```

---

## Why each section exists

- **Project directory** is the router: one glance maps any incoming task to the right context. The
  pointers (cluster + board) are how an agent loads only what it needs.
- **Critical always-on rules** are the constitution in miniature — one line each, linking detail.
  They're here, not buried, so they actually fire every session.
- **Clusters on demand** keep the index small: the rich content lives in cluster files loaded only
  when a matching task arrives. Always-loaded stays cheap; recall stays high.

## Tips

- **Enforce the line cap.** When you hit ~200 lines, compress or merge *before* adding — don't let
  it grow. A bloated index defeats its own purpose (it's loaded every session).
- **Pointers only, never content.** If a line wants to explain something, it belongs in the cluster
  or rule file it links to. One line, one hook, one link.
- **Delete stale lines on sight.** A dead pointer is worse than a missing one — it sends agents to
  a file that no longer matches reality.
- Keep the directory's cluster/board links in sync when a project moves or is renamed.
