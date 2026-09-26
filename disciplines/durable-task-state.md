# Durable task state

## Pattern

Task state — what is open, in-progress, parked, blocked, and done — lives in
a **versioned file in the repo**, not in the agent's conversation context. The
file is the single source of truth that survives session resets, context
compaction, and handoffs between agents.

In-conversation task tools (the chat-window "todo list" surface) are
**ephemeral scratchpads** for a single turn. They are wiped on session reset.
They are not a substitute for the durable file.

## Why

An agent's conversation context is finite and disposable. Every long task
eventually hits a reset — manual clear, compaction, a fresh session the next
day. When task state lives only in that context, all of the following happen:

- Parked work silently dies on reset. The next session has no memory of it.
- A second agent picking up the work has no shared view of what's open.
- The operator can't audit progress without reading the agent's transcript.
- "Did we finish that?" has no crisp answer.

A file in the repo solves all of this:

- It survives resets, compactions, and crashes.
- Multiple agents read and write the same file — coordination is trivial.
- The operator and reviewers can read it directly.
- Git history is the natural audit trail.

## How to apply

### One board per project

Each project has its own task file at a predictable path — e.g.
`docs/tasks/<project>.md` or `<project>/TASKS.md`. The file is the durable
home for that project's open / parked / blocked / shipped tasks. A
top-level index (`TASKS.md`) only **links** to these per-project files,
never stores tasks itself.

### Read before working

When an agent starts or resumes work on a project, the first action is to
open that project's board file. The header — what's open, what's in flight
— is the source of truth, not the agent's memory of the last session.

### Update as you go

When you park, block, ship, or discover a task, write it to the board in
the **same turn**, not "later." Parked or blocked items must capture enough
to resume cold: relevant commits and SHAs, file:line references, the exact
next step, what it's blocked on.

### Flush before ending

Before a session reset, before compaction, or when the operator signals
the session may end, persist all open and parked tasks to the board. The
in-conversation surface is not allowed to be the only record.

### The in-conversation surface is for one turn

The chat-window todo list is a within-session scratchpad — fine for
breaking down the current turn's steps. When the harness reminds the agent
to use it, treat the reminder as a cue to **also** update the durable
board, not as a substitute.

## Where boards live (ownership)

Pick the location based on who reads the board:

- If the board is **only ever read by your own orchestration**, store it
  in your orchestration layer's repo, not inside each individual project
  repo. This keeps shared / personal-project repos free of orchestration
  scratch and avoids cross-tree merge conflicts.
- If the board is **read by collaborators on the project**, store it in
  the project repo and gitignore it from any orchestration mirror.

Either way: **one canonical location per project**, and every reference
points there. Pointer drift is fixed on sight.

## Why this exists

A convention that lives only in a "task management" reference doc is read
on demand, so it is absent from working context. Meanwhile, the only task
reminder that fires every turn points at the ephemeral surface. Net
effect: parked work silently dies on reset.

This discipline moves the protocol from on-demand to always-on. The board
file is named, located, and read before any non-trivial action.

## When NOT to apply

For genuinely throwaway tasks ("answer this one-line question") the
durable board is overkill. The rule kicks in the moment the work is
non-trivial enough to span a turn break, or important enough that a future
agent should be able to pick it up cold.
