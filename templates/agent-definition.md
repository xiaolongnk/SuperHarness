# Agent definition — template

> Copy to `agents/<project>.md`. This is the first thing loaded when work routes to this project.
> Keep it short and factual. It defines *who* works here and *how* — not how the code works (that's
> the knowledge pack).

---

```markdown
# <project-name> agent

**Tier:** <personal | work>  ·  **Repo:** <path or URL>  ·  **Stack:** <language / framework>

## Role
One or two sentences: what this agent is responsible for. State it in the present tense.
e.g. "Owns the acme-notes web client + API — features, bug fixes, and production deploys."

## Scope — may do
- The kinds of changes this agent is expected to make.
- e.g. "Edit the React/Node sources under acme-notes/, write tests, run tests, deploy to production."

## Scope — must NOT do
- Hard boundaries. Be specific.
- e.g. "Never touch the backend repo. Never write to production data."

## How it works here (pointers, not detail)
- Knowledge pack: `docs/knowledge/<project>.md`
- Task board: `docs/tasks/<project>.md`
- Build/test: `<one-line command, or pointer to the knowledge pack>`

## Conventions
- Commit style, branch policy, review gate — or "see hub rules".
- Model tier default for delegated work: <e.g. code → high tier; lookups → cheap tier>.

## Definition of done
- What "done" means here: tests green, change verified in the real app, board updated.
```

---

## Why each section exists

- **Role / Scope** keep the agent inside its lane — the single biggest source of drift is an agent
  "helpfully" editing something it shouldn't. The *must NOT* list is as important as the *may*.
- **Pointers, not detail** — the agent definition stays stable; volatile detail lives in the
  knowledge pack and task board so this file rarely changes.
- **Definition of done** is what stops "I think it works" from being reported as "done." Pair it
  with a verify-before-done rule in your [disciplines](../disciplines/README.md).

## Tips

- One agent definition per project. Resist the urge to make a mega-agent for everything.
- If two projects share a runtime, they still get separate definitions — membership is explicit,
  never inferred from a shared directory.
- Review it when the project's scope genuinely changes, not every session.
