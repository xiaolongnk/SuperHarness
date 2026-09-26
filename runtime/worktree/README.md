# runtime/worktree/ — transient per-agent isolation

Per [`disciplines/worktree-isolation-per-agent.md`](../../disciplines/worktree-isolation-per-agent.md):
when two or more agents work in the same runtime project concurrently, each gets its own git
worktree here instead of sharing a working directory.

These are **short-lived** — created for a task, removed (or merged back and removed) when it
ships. Nothing durable lives here. A worktree that's still around after its task shipped is
stale and should be cleaned up.

This directory's contents (everything except this README) are gitignored — a worktree is
disk state for one in-flight task, not something the management layer's history should ever
contain.
