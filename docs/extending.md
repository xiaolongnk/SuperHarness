# Extending SuperHarness

SuperHarness is intentionally small — everything it ships is markdown and
JSON, no runnable engine. Most extension work is adding a markdown contract:
a new project, a new skill, or a new discipline. This guide covers the
extension seams a new adopter normally needs.

## Add a Discipline

**What it is:** a standing operating rule that every agent should carry into
every task. Disciplines are not on-demand skills and not project knowledge.
They are always-on patterns such as worktree isolation, verification shape, or
commit hygiene.

**Where it lives:** `disciplines/<name>.md`, indexed by
`disciplines/README.md`. The expected file shape is documented in
`disciplines/README.md`: Pattern, Why, How to apply, and When NOT to apply.
The top-level `README.md` shows the current loading convention:
`cat disciplines/*.md > /tmp/operating-standards.md`, then pass that bundle as
the system-prompt fragment, persona file, or payload your agent CLI accepts.

**Minimal steps:**

1. Create `disciplines/<slug>.md`.
2. Use the same four-section shape as the existing discipline files.
3. Add one row to the index table in `disciplines/README.md`.
4. Make sure your agent bootstrap still includes `cat disciplines/*.md` before
   the first task prompt.

**Tiny example:**

```markdown
# Keep review and implementation separate

## Pattern

The implementer of a change does not give the final SHIP verdict.

## Why

Fresh context catches assumptions the implementer already shares with the bug.

## How to apply

Route non-trivial changes to a reviewer role before merge.

## When NOT to apply

Skip this for typos and one-line documentation fixes.
```

Then add it to `disciplines/README.md`:

```markdown
| [separate-review-from-implementation.md](separate-review-from-implementation.md) | The implementer does not give the final SHIP verdict. |
```

*Boundary: role personas for a multi-agent execution engine (manager,
coworker, reviewer, or similar pane-bound identities) are not a seam this
repo defines — SuperHarness doesn't ship or assume such an engine. If you
build your own orchestration layer, defining its role prompts is part of
that layer, not something to extend here.*

## Add a Skill

**What it is:** a skill is an encoded, on-demand workflow. Unlike a discipline,
it is not loaded into every task. It is a reusable procedure an agent invokes
when the current task needs that capability.

**Where it lives:** `skills/<name>/SKILL.md` by convention. The repo ships
example skills in `skills/` (code-review, learn, plan, release, verify) you can
copy and adapt. Keep each skill self-contained so it can be read only when invoked.

**Minimal steps:**

1. Create `skills/<name>/SKILL.md`.
2. Put the trigger condition at the top: when the agent should use the skill.
3. Write the workflow as ordered steps, including required inputs, outputs,
   verification, and failure/blocker behavior.
4. Wire your agent launcher or bootstrap to expose the skill directory to the
   agent CLI you use. The framework does not impose one invocation mechanism;
   use the CLI's native slash-command, plugin, or prompt-injection mechanism.

**Tiny example:**

```markdown
# render-check

Use when a task changes a user-visible markdown or HTML artifact and asks for
visual verification.

## Steps

1. Render the artifact with the repo's documented command.
2. Open or capture the rendered output.
3. Check headings, links, and overflow manually.
4. Report the render command and the observed result.

## Output

`render-check: PASS <command>` or `render-check: FAIL <issue>`.
```

An adopter can then invoke it through their agent CLI, for example `/render-check
docs/extending.md`, or by dispatching a brief that explicitly says "Use the
render-check skill."

*Boundary: adapting SuperHarness's methodology to a new agent CLI just means
pointing that CLI at the same `disciplines/*.md` + skills + memory schema —
there's no launch mechanism or submit-key matrix to configure here, because
this repo doesn't ship a process launcher. If you separately run multiple
agent processes via your own orchestration tooling, teaching it about a new
CLI is a change in that tooling, not in SuperHarness.*
