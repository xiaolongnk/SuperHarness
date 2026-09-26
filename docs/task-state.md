# Task State

This document is the framework's state schema. It specifies the **task
board** — the one file this repo defines — and the rules that keep it
coherent.

The companion discipline at `disciplines/durable-task-state.md` says *why*
state must live in a file; this doc says *what* that file looks like and
*who* writes to it.

---

## The task board

| Surface | Path (example) | Who writes | Who reads |
|---|---|---|---|
| **Task board** | `<BOARD_PATH>` (one per project) | the agent working the project | whoever picks up the project next |

The board lives outside conversation context. It survives `/clear`,
compaction, session restart, and host reboot.

The board is the **project's** view: what is open, in flight, blocked,
done. It's the single durable surface this doc specifies — see
`disciplines/durable-task-state.md` for why it must exist at all.

*Optional, out of scope for this repo: if you run multiple agent processes
in parallel via your own orchestration, you'll likely want an analogous
per-process status file (busy/idle, context usage, last heartbeat) so a
control point can route around a stale or overloaded process. SuperHarness
doesn't define that schema — it's a property of whatever execution engine
you bring, not of the task board itself.*

---

## Task board — schema

The board is a single markdown file per project. The format is intentionally
plain so a human can read it, and so a future agent of a different shape can
parse it. Keep it under a low line cap (e.g. 200 lines) — archive completed
tasks out to a separate file when the board grows.

Recommended sections:

```markdown
# <PROJECT> — task board

> Canonical board. Update before parking work or ending a session.

## In flight

- [ ] <task-id> @<owner> — <one-line description>
  - Repo/worktree: <path>
  - Brief: <link or inline pointer>
  - Started: <date>
  - Notes: <anything a fresh agent needs to resume cold>

## Open

- [ ] <task-id> — <one-line description>
  - Repo: <path>
  - Priority: high / normal / low
  - Blocked-by: <task-id> (if any)

## Blocked

- [ ] <task-id> — <one-line description>
  - Blocker: <what's blocking, what would unblock>
  - Waiting on: <who or what>

## Shipped (recent)

- [x] <task-id> — <one-line description> — <commit-sha> — <date>
```

### Per-task fields

| Field | Required | Notes |
|---|---|---|
| `task-id` | yes | Stable identifier. A short slug is fine. |
| Description | yes | One line. Detail goes in the brief, not the board. |
| Repo / worktree | yes for in-flight | Exactly one path. Cross-repo work is N tasks. |
| Owner | yes for in-flight | Who/what is currently executing it. |
| Brief pointer | yes for in-flight | Link to the brief or include it inline if short. |
| Start timestamp | yes for in-flight | When the task moved to in-flight. |
| Blocker note | yes for blocked | What is blocking + what would unblock. |
| Result pointer | yes for shipped | Commit SHA, PR link, artifact path. |

### Lifecycle

```
Open → In flight (an agent picks it up)
In flight → Open  (blocked, then re-queued)
In flight → Blocked (genuine external blocker — record blocker note)
In flight → Shipped (verified against the acceptance criteria)
Shipped → archived (when the recent-shipped list grows beyond ~10)
```

Each transition is a board edit. It is never out of sync with the current
state of the work.

---

## One writer at a time

- **One writer per file.** The board is short enough to rewrite in full
  per edit — don't append-without-truncating.
- **No locking discipline beyond single-writer.** If more than one agent
  process needs to write the same board concurrently (e.g. you're running
  several agent processes via your own orchestration), that's a property
  of your execution setup to solve — SuperHarness doesn't define a
  multi-writer protocol.

---

## What this framework explicitly does NOT do

- It does **not** define a database. The board file is deliberately the
  storage. It's auditable by the user, survives everything, and carries
  no operational dependency.
- It does **not** prescribe a query layer. The board is small enough to
  read end-to-end at routing time. If it grows beyond that, archive
  completed entries — don't add a query layer.
- It does **not** define a schema versioning rule, or a status/heartbeat
  schema for tracking multiple concurrent agent processes — both are
  owned by whatever execution setup you bring, not by this repo.

---

## Recovery from a partial state

If a session is interrupted mid-edit (a process killed, a host
rebooted), the rule is **trust the disk, repair on next access**:

- Re-read the board on startup. Any `in flight` row with no recent
  activity is a stranded task — re-queue or re-assign it.
- Any `done` row that is missing a result pointer is suspect — fill it
  in from git history, or re-run verification.

This is the durable-state property in practice: no in-memory information
this framework cannot reconstruct from the board file.
