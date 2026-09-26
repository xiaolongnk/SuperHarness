# Knowledge pack — template

> Copy to `docs/knowledge/<project>.md`. This is the "how this project actually works" memory —
> the FIRST thing read when work routes here, so an agent doesn't re-learn the project every session.
> It documents the *code and operations*; *who works here* lives in the agent definition.

---

```markdown
# <project-name> — knowledge pack

**Last verified:** <YYYY-MM-DD>  ·  **Stack:** <language / framework>  ·  **Tier:** <personal | work>

## Summary
One short paragraph: what this project is, who uses it, what it does.
e.g. "acme-notes is a small note-taking web app (React client + Node API) for sync. Users write
notes offline; the backend reconciles them across devices."

## Architecture
One short paragraph on how the pieces fit, then a tiny box diagram.

```
┌────────────┐      HTTPS      ┌──────────────┐      ┌────────────┐
│ React web  │ ──────────────► │  sync API    │ ───► │  database  │
│ (offline)  │ ◄────────────── │ (Node)       │      │            │
└────────────┘                 └──────────────┘      └────────────┘
```

## Key directories / modules
- `<path>/` — what lives here.
- `<path>/` — what lives here.
- e.g. `app/Sync/` — offline queue + conflict resolution; the trickiest code in the repo.

## Build / test / run
- Build: `<command>`
- Test: `<command>`  (scope it — e.g. `<test runner> path/to/suite`, never the whole tree if it's slow)
- Run locally: `<command>`

## Deploy
- Steps, in order. e.g. "1. `<build cmd>`  2. `<push cmd>`  3. verify `<health check>`."
- Where it deploys to (environment name, not a host).

## Conventions
- Commit / branch / review policy specific to this repo.
- Naming, formatting, or structure rules a contributor must follow.

## Gotchas / sharp edges
- The non-obvious things that bite. e.g. "Tests spin up a real local queue — run scoped, not the
  full suite, or it hangs." / "Config is read once at module load; test env overrides are ignored."

## External dependencies & where their config lives
- `<service / library>` → config at `<file>` (placeholder values only — NEVER paste secrets here).
- e.g. "Push notifications → key referenced in `config/push.example.json`; real key in the secret store."
```

---

## Why each section exists

- **Summary + Architecture** orient a cold-start agent in seconds — the difference between "I see"
  and 20 minutes of spelunking.
- **Gotchas** are the highest-value section: they encode the time someone already lost so nobody
  loses it again. Add to this list every time something surprises you.
- **External deps & config** answers "where do I look?" without ever leaking a credential — only
  the *location* of config, never its contents.

## Tips

- **Keep it current.** A stale knowledge pack is worse than none — it sends agents down dead ends.
  Update `Last verified` when you touch it.
- It's the first thing read when work routes here, so put the load-bearing facts near the top.
- One pack per project. If two projects share a runtime, each still gets its own pack.
- Never paste secrets, real hosts, or absolute machine paths — describe config by its role and
  point to where it's stored.
