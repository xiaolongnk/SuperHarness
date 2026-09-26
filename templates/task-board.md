# Task board — template

> Copy to `docs/tasks/<project>.md`. This is the durable, per-project task board — the single
> source of truth for what's in flight. It survives session resets and compaction; the
> in-conversation todo list does not. Read it first, update it as you go, flush it before you stop.

---

```markdown
# <project-name> — task board

**Updated:** <YYYY-MM-DD>

## Now / In progress
What is actively being worked on right now. Keep this short — ideally one item.
- [ ] <task> — <one line on current state / what's next>

## Next / Queued
Ordered by priority. The top item is what gets picked up when "Now" clears.
- [ ] <task>
- [ ] <task>

## Parked / Blocked
Items stopped mid-flight. Each MUST record enough to resume cold:
- [ ] <task>
  - **What:** what this is and why it matters.
  - **Next step:** the exact next action to take.
  - **Blocked on:** what's blocking it (a review, an answer, an upstream fix) — or "parked, not blocked".
  - **Where:** relevant commit SHA / `file:line` to resume from.

## Recently shipped
Newest first. Trim to the last ~10; older entries can be deleted or archived.
- [x] <task> — <YYYY-MM-DD> — <commit SHA or PR ref>
```

---

## Why each section exists

- **Now / Next / Parked / Shipped** maps to the four states work is actually in. Separating
  *parked* from *queued* matters: parked work has live context that decays — capture it richly so
  it survives a session reset.
- **Durable on purpose.** The model's in-conversation todo list is wiped on reset/compaction. This
  file is the memory that crosses sessions; if it isn't written here, it didn't happen.
- **Resume-cold parked items** are the whole point of the *Where* / *Next step* fields. Future-you
  (or another agent) should be able to pick up a parked task with zero conversation history.

## Tips

- **Update in the SAME turn you park or ship something** — not "later." Later never comes; the
  session resets and the state is gone.
- Write parked items as if a stranger will resume them. "Fix the bug" is useless; "retry in
  `api/services/share.js:74`, conflict path returns nil on empty merge, blocked on backend PR #12" is resumable.
- Keep "Now" to one item. If it's three, you're not doing one thing — you're dropping two.
- One board per project. Link to it from the routing index so work routes here automatically.
