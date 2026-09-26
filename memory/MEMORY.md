# SuperHarness — memory index

> Two layers: this always-loaded routing index + per-domain clusters loaded on demand.
> Hard cap: ~200 lines. Every line is a POINTER with a one-line hook — never multi-line content.
> `superharness check` counts this file toward the always-loaded tax.
> (This repo's rows are the three fictional example projects; `init` generates an empty table.)

## Project directory

<!-- projects:start -->
| Project | Current focus | Cluster | Task board |
|---|---|---|---|
| `acme-notes` | share-a-note revoke path + search hardening | [cluster](clusters/acme-notes.md) | [board](../docs/tasks/acme-notes.md) |
| `acme-web` | (fill in) | [cluster](clusters/acme-web.md) | [board](../docs/tasks/acme-web.md) |
| `acme-api` | (fill in) | [cluster](clusters/acme-api.md) | [board](../docs/tasks/acme-api.md) |
<!-- projects:end -->

**Routing rule:** incoming task → match a project above → read its task board FIRST (what's in
flight), then its cluster (what was learned), then work.
Unknown task (no clear owner) → `docs/portfolio-registry.md` via `skills/route`.

## Critical always-on rules
The reasoning primitives are in `PHILOSOPHY.md` and the standing rules in `disciplines/` — both
already injected every session. Add a line here ONLY for a project-specific rule that must fire
before the first tool call; everything else belongs in a cluster or `knowledge/`.
- **[rebuild-index-after-bulk-import](feedback-rebuild-index-after-bulk-import.md)** — a derived artifact (acme-notes `search.idx`) is refreshed inside the same transaction as EVERY write path, imports included.

## Clusters — load on demand
One line each: what's inside, so an agent knows when to load it.
- [acme-notes cluster](clusters/acme-notes.md) — index/search invariant, import path, share-token state.
