# Disciplines

The always-on operating disciplines that govern how an AI coding agent
does work. These are NOT skills (on-demand procedures) or domain knowledge
(project-specific facts). They are *standing rules* — patterns that fire on every
task and that, when followed, prevent whole classes of failure mode.

Each file follows the same shape:

- **Pattern** — the rule in one or two sentences.
- **Why** — the failure mode it prevents.
- **How to apply** — concrete shape the rule takes during real work.
- **When NOT to apply** — the narrow exceptions, so the rule doesn't ossify.

## Index

| File | One-line |
|---|---|
| [verify-by-interaction-not-proxy.md](verify-by-interaction-not-proxy.md) | A change isn't "done" until the observed symptom is gone in the actual surface, not just a proxy assertion. |
| [sim-stub-not-target.md](sim-stub-not-target.md) | Simulators / stubs / mocks are not the target. Final verification runs on the real surface. |
| [worktree-isolation-per-agent.md](worktree-isolation-per-agent.md) | Parallel agents on the same repo work in isolated worktrees; the creator owns cleanup. |
| [issue-resolution-contract.md](issue-resolution-contract.md) | Non-trivial bugs follow problem → hypothesis → evidence → fix → prediction → retro, written down. |
| [evidence-before-claim.md](evidence-before-claim.md) | Lightweight everyday tier: get one piece of hard evidence before naming a cause — a generic error code or a clean outer-layer check isn't a root cause. |
| [model-routing-and-escalation.md](model-routing-and-escalation.md) | Pick the model tier by task complexity; escalate to a stronger tier after two failed attempts. |
| [durable-task-state.md](durable-task-state.md) | Task state lives in a versioned file, not in the agent's conversation context. |
| [minimize-blocking-act-on-defaults.md](minimize-blocking-act-on-defaults.md) | Default to acting on a reasonable assumption; reserve blocking prompts for genuine forks. |
| [consolidate-recent-inputs.md](consolidate-recent-inputs.md) | Synthesize the last several user messages into one intent before replying. |
| [honest-verification-status.md](honest-verification-status.md) | Report what was actually verified, with evidence. Don't claim "done" on the strength of a build or a passing unrelated test. |
| [commit-hygiene.md](commit-hygiene.md) | A commit contains exactly what was staged — verify the staged set and the committed artifact match intent. |
| [description-and-doc-quality.md](description-and-doc-quality.md) | Descriptions state what a thing IS and DOES — present tense, factual, no speculative examples or coupling to non-users. |
| [skill-design.md](skill-design.md) | Every skill declares `domains:` + `tier:`, has one responsibility, and passes the clean-&-powerful checklist before it's indexed. |
| [self-improvement-loop.md](self-improvement-loop.md) | Work → failure → reason → capture → curate → layer → clean — the loop that fills the on-demand library from real failures while the always-loaded core stays bounded. |
| [curate-dont-accrete.md](curate-dont-accrete.md) | On every correction, find the principle first: sharpen existing / fix-in-place / sediment stale / add-with-retire — adding net-new is the last resort. |

## How these are loaded

Disciplines are designed to be loaded into every agent session, not consulted
on demand. In a scaffolded harness, `scripts/harness-prime.sh` runs as a
SessionStart hook (`.claude/settings.json`) and injects `PHILOSOPHY.md`, this
index, and `memory/MEMORY.md` before the first tool call; a discipline's body
is then read when its index row matches the situation. With another agent CLI,
wire the same three files into whatever prompt-injection mechanism it offers.
An agent that has not read these is operating outside the contract.
