---
name: open-pr
description: PR hub — create, review, and merge pull requests with a Goal+Verification body contract, so a reviewer can judge the problem and the risk before reading a single line of diff
domains: [portfolio, git]
tier: both
---

A pull request is a lot of things skipped, usually: a stated goal, a way to check that goal without
re-reading the whole diff, an honest note on risk. This skill is the fixed shape that keeps those
present on every PR, whatever host you're on.

Arguments: `$ARGUMENTS` — first word selects the sub-command.

| Sub-command | Purpose |
|---|---|
| `create [context]` *(default)* | Open a PR on the current branch |
| `review <N\|URL>` | Verify a PR against its own Goal + Verification blocks; SHIP / BLOCK / NEEDS-HUMAN |
| `merge <N\|URL>` | Merge after re-confirming the review-gate checkboxes |
| `check` | Inbox pass — every open PR you own, grouped by what's blocking it |

## Host-agnostic setup

This skill assumes a git-hosting CLI is on `PATH` and authenticated — `gh` (GitHub), `glab`
(GitLab), or your host's equivalent. Resolve once per invocation:

```sh
if command -v gh >/dev/null 2>&1; then HOST_CLI=gh
elif command -v glab >/dev/null 2>&1; then HOST_CLI=glab
else echo "open-pr: no git-hosting CLI found (need gh or glab on PATH)" >&2; exit 1
fi
```

Everything below is written against `gh`'s command shape; substitute the equivalent `glab` (or
direct REST) call if you're on a different host. Never hand-roll the diff/PR-metadata fetch when the
CLI already exposes it — that's the thing most likely to silently drift from the real API.

## `create` — Open a pull request

1. **Preflight — one branch, one PR.** Before opening a new PR, check whether the current branch
   already has an open one:
   ```sh
   gh pr view --json number,url 2>/dev/null && echo "PR already exists for this branch — push instead of opening a new one" && exit 1
   ```
2. **Gather the diff against the real base**, not a stale local branch:
   ```sh
   git fetch origin "$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)" --quiet
   git diff origin/<base>...HEAD --stat
   ```
3. **Write the body with the mandatory sections** (do not omit any):

   ```markdown
   ## Problem
   <What's observably wrong or missing TODAY, and who/what it affects. Plain language — no
   function names or file paths yet. A reviewer should feel why this matters before any solution.>

   ## Goal
   <One objectively-checkable sentence: a test that now passes, a specific behavior, a file that
   now exists. NOT "improves code quality" or "fixes the bug" — those aren't checkable.>

   ## Verification
   1. **<check name>**:
      ```
      <exact command>
      # Expected: <exact condition>
      ```
   2. ...

   ## What changed
   <2-4 bullets: the mechanism — function/file names, what changed and why. Keep this OUT of
   Problem/Goal above; those two sections must stay readable without touching the diff.>

   ## Risk
   <docs-only | cleanup | bugfix-narrow | bugfix-wide | feature | infra>

   ## Review gate
   - [ ] Goal-Diff alignment — every changed file justified by the Goal
   - [ ] Verification green — every Verification check passes
   - [ ] Reviewed by a second agent or human
   ```

   **The reader test:** someone who has never opened this code should be able to restate, from
   `Problem` + `Goal` alone, what was wrong and how you'll know it's fixed — without reading the
   diff. If the Goal reads like a title ("refactor the dispatch path"), rewrite it as a checkable
   outcome.

4. **Open it and report the URL:**
   ```sh
   gh pr create --title "<type>: <description>" --body-file <tmpfile> --base <base>
   ```
   Title follows the project's conventional-commit prefix (`feat|fix|refactor|docs|test|chore`).

## `review` — Verify a PR against its own contract

**Does**: checks the PR delivers what its own `## Goal` + `## Verification` promise, and that the
diff is fully explained by the `## Goal`. **Does not**: replace human judgment on architecture,
taste, or security — this is a mechanical gate, not a substitute reviewer.

1. **Fetch the PR** and check out its head ref into an isolated worktree (never review in your main
   working tree — see `disciplines/worktree-isolation-per-agent.md`):
   ```sh
   gh pr checkout <N> --branch "pr-review/<N>"
   ```
2. **Hard gate:** if `## Goal` or `## Verification` is missing, or the Goal isn't a checkable
   statement (no verb implying a testable outcome), stop and report that — do not invent your own
   checks to paper over a missing contract.
3. **Run every Verification check** and record PASS/FAIL/UNKNOWN against its stated `# Expected:`.
   A check you can't run (missing fixture, needs prod access) is UNKNOWN, not a silent skip.
4. **Goal-Diff alignment**: `git diff origin/<base>...HEAD --name-only` — for each changed file, is
   it justified by the Goal? A file that's neither justified by the Goal nor an obvious support file
   (test, doc for the change) is OUT-OF-SCOPE.
5. **Baseline sanity**: grep the diff for secrets (`api[_-]?key|secret|password|token|-----BEGIN`),
   debug artifacts (`console.log`, `print(`, `TODO`, `pdb.set_trace`), and confirm the title uses a
   conventional-commit prefix.
6. **Verdict** (first true wins):
   - Any Verification FAIL, or any OUT-OF-SCOPE file → **BLOCK**.
   - Any UNKNOWN check, or a secret/debug-artifact hit needing a human call → **NEEDS-HUMAN**.
   - Everything checked and clean → **SHIP**.
7. **Post the report as a PR comment** (`gh pr comment <N> --body-file <report>`), and on SHIP, tick
   the review-gate checkboxes in the PR body.
8. **Clean up the review worktree** whether the review passed or not — `git worktree remove` +
   delete the local `pr-review/<N>` branch.

## `merge` — Merge after the gate

1. **Re-confirm every `## Review gate` checkbox is ticked** in the current PR body — do not trust a
   memory of a prior review; re-fetch the body.
2. **Confirm mergeable + CI green**:
   ```sh
   gh pr view <N> --json mergeable,statusCheckRollup
   ```
3. If both hold, merge (`gh pr merge <N> --squash` or the project's preferred merge strategy) and
   close any issue the PR's `Closes #<N>` line references (most hosts do this automatically on
   merge — verify rather than assume).
4. If either check fails, stop and report which gate is unmet — never merge past a red check because
   "it's probably fine."

## `check` — Inbox pass

List every open PR you own (`gh pr list --author @me --json number,title,url,statusCheckRollup`),
and for each: is it waiting on you (new review comment, failing check) or waiting on someone else
(pending review, pending CI)? Report only the ones waiting on you, grouped by what's needed
(fix-CI / respond-to-comment / needs-a-review-request).
