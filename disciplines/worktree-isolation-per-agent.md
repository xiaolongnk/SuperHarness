# Worktree isolation per agent

## Pattern

When two or more agents are doing parallel work in the same repository, each
agent operates in its **own git worktree**, not the shared primary checkout.
The agent that created the worktree owns removing it when the work is
finished or abandoned.

## Why

A shared checkout has exactly one HEAD, one index, and one working tree.
Two agents staging different files into one index race each other; whichever
commits second silently consumes the other's staged changes. Branch switches
collide. Build artifacts trample each other. Even read-only inspection breaks
when one agent rebases the branch another is reading from.

A worktree gives each agent its own working directory and HEAD on the same
object store, with cost on the order of a checkout. The branches and history
remain shared; only the checked-out state is isolated. The race goes away.

The companion failure mode is *sprawl*. Worktrees are cheap to create and easy
to forget. Left around, they pile up — dozens of stale trees, each a full
checkout, each making it harder to see what's live and what's abandoned. The
fix is a standing rule: creation pairs with cleanup in the same session.

## How to apply

1. **One worktree per agent per parallel task.** When the orchestrator
   dispatches concurrent work that will touch the same repo, it creates one
   worktree per agent, assigns it, and tells the agent its working directory
   is that path — not the primary checkout.
2. **Place them under a single per-tree container**, never as bare siblings
   of the primary checkout. Siblings make sprawl invisible because they look
   like top-level project directories.
3. **Remove via `git worktree remove`, never `rm -rf`.** `git worktree remove`
   without `--force` refuses any tree with uncommitted or untracked changes —
   it can never silently destroy work. `rm -rf` can. Removing a clean
   worktree is always safe: the branch and committed work stay in the repo
   and remain reachable.
4. **Creator owns cleanup.** A worktree that outlives its branch (merged or
   abandoned) is a leak. Cleanup is the last step of finishing the branch,
   not a someday task.
5. **Never force-remove what you don't own.** Locked worktrees (held by a
   live agent) and dirty worktrees (uncommitted work) belong to a running
   process or hold unsaved state. Surface them; don't `remove --force`.
6. **Periodic sweep is safe.** For each repo, `git worktree remove` every
   clean worktree (dirty and locked ones error out and are skipped), then
   `git worktree prune` for stale admin entries. Removed worktrees keep
   their branches; a sweep loses no committed work.

## Commit-scope discipline inside a worktree

Even with worktrees, agents touching the same branch or repo should
**scope-stage** — explicitly `git add <files-i-changed>` for the paths the
agent owns, never `git add -A` from a working tree that may contain another
process's edits. A `git commit` without an explicit add captures only the
index, which is fine for a single owner but mixes parallel writers if the
working tree is shared. Combined with worktrees, scope-staging is the second
half of the parallel-safety contract.

## When NOT to apply

A single agent on a single branch doesn't need a worktree — the primary
checkout is fine. The discipline kicks in when parallelism (multiple agents,
or one agent running long-lived work while the operator wants to use the
same repo) is in play.
