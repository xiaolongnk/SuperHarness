# Commit hygiene

## Pattern

A commit contains **exactly what was staged** — no more, no less. The set
of files in the commit, the diff in those files, and the commit message
all describe one logical unit of work. Verify the staged set and the
committed artifact against intent before declaring a commit done.

## Why

Two failure modes are common and consistently expensive.

### Silent edit drops

Some git operations stage automatically: `git rm`, `git mv`, `git add`.
Editor and script edits (a `sed -i`, a Write/Edit tool, an editor save)
do **not** stage automatically. A mixed batch — e.g. a `git rm` deletion
plus a `sed` edit on another file — followed by a `git commit` without
`-a` captures only the auto-staged set. The script edits silently vanish
from the commit even though they're sitting in the working tree.

The downstream effect is brutal: the agent reports "the fix is in commit
ABC," a reviewer reads the commit, sees the deletion but no edit, and
either rejects (round-trip cost) or worse, merges (the bug stays).

### Commit-vs-working-tree confusion

After a commit, the working tree often still shows untracked or
unstaged changes. Verifying "the fix is in" by reading the *working
tree* rather than the *committed artifact* reports success on a state
that won't reach the reviewer. This is the same family of bug as silent
drops, viewed from the other end.

## How to apply

### Before commit

- Run `git status --porcelain` and read it. Confirm the lines you intend
  to commit are all `M ` (staged) or `A ` (staged add), not unstaged
  ` M`. Unstaged modifications to files you mean to commit are the
  silent-drop signal.
- For a mixed batch (deletions + edits), use `git add -A` or `git commit
  -a` to capture both, **or** explicitly stage each path. Pick one and be
  intentional.
- Run `git diff --cached --stat` and confirm the staged set matches your
  intended scope. A surprise file in the staged set is as much a bug as a
  missing one.

### Stage by name, not by sweep

When multiple agents or processes might be touching the same working
tree, prefer `git add <specific paths>` over `git add -A` from the
working tree root. `git add -A` cannot tell your edits apart from
another process's; explicit staging is the second half of parallel-safe
commits (see also `worktree-isolation-per-agent.md`).

### After commit — verify the artifact, not the working tree

Before claiming "the fix is in commit X," verify against the
**committed object**, not the working tree:

- `git show <sha>:<file>` to read the file as it is in the commit.
- `git diff <base>...HEAD` to see the full diff that will go to a
  reviewer.

If the operator is going to merge or release from `<sha>`, the question
"is the fix in `<sha>`?" is answered by reading `<sha>`, not the
checkout.

### One logical unit per commit

A commit is a thinking unit, not a save unit. Bundle changes that
genuinely belong together; split changes that don't. A reviewer reading
the commit message and the diff should be able to answer "what changed
and why?" in one read.

### Commit message format

Keep the format simple and consistent:

```
<type>: <short description in imperative mood>

<optional body — wrap at 72 cols — explain WHY, not WHAT (the diff
shows what)>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`,
`ci`. Pick one. The first line stays under ~70 chars; details go in
the body.

### Do not amend published commits

`git commit --amend`, `git rebase`, and `git push --force` are
appropriate before a commit has been seen by others. Once a commit is
pushed and another agent (or human) may have pulled it, prefer a new
commit over a force-push. Force-pushing a shared branch destroys other
people's work without warning.

### Pre-commit hook failures are commit failures

A pre-commit hook that fails means the commit did **not** happen.
Re-running `git commit --amend` after a hook failure modifies the
*previous* commit. Instead: fix the issue, re-stage, and create a
**new** commit.

## When NOT to apply (the trivial cases)

A single-file edit in a single-process checkout doesn't need
ceremonial staging verification — `git add path && git commit` is
fine. The rule kicks in when the commit involves multiple files, a
mixed batch (delete + edit), or a working tree that other processes
may be touching. There, the verification is cheap and the silent-drop
cost is high.
