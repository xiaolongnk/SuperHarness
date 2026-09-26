# acme-notes (EXAMPLE)

> **This is a fictional example project**, shipped with the framework so a fresh harness has a
> real personal-tier project to route work against — see [`runtime/README.md`](../../../README.md)
> for why it exists and how to replace it with your own projects, and
> [`docs/walkthrough-acme-notes.md`](../../../../docs/walkthrough-acme-notes.md) for the
> end-to-end walkthrough built around it.

A small note-taking app: a React web client (`web/`, not included here) over a thin Node API
(`api/`) that keeps notes in SQLite and a derived full-text search index alongside. Only the two
services the walkthrough's incident turns on are stubbed here; everything else is described in
the knowledge pack, `docs/knowledge/acme-notes.md`.

```
api/services/search.js   rebuildIndex() — derives search.idx from notes.db
api/services/import.js   bulk import; the path that once skipped the rebuild (see the incident)
```
