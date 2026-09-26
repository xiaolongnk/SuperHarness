# Why SuperHarness is different

Manage a portfolio of projects from one control point, not just the one
task in front of you. Skills are the force-multiplier that makes running
that portfolio efficient.

Most of the multi-agent-CLI space is still solving last year's problem:
split a tmux window, launch a CLI per pane, give the human a nicer way to
look at four panes at once. That's genuinely useful, and it's the easy 80%.
The harder, more valuable problem is what happens the day after — when you
don't have one task and four panes, you have a *portfolio*: a dozen
half-finished projects, each with its own state, its own conventions, its own
half-remembered gotchas, and a finite number of agent-hours to spend across
all of them. SuperHarness is built for that day.

*(Note on comparison class: the framing below is about system-prompt tip-lists
and single-task session-manager tooling — not about agent-application
frameworks like CrewAI/LangGraph or autonomous coding systems like OpenHands,
which solve a different problem and have real engineering behind them, and
not about multi-agent orchestration engines generally — SuperHarness doesn't
ship one. The claim here is narrow: most guidance for AI coding agents is
written for one task in one repo — it doesn't have a model for running more
than one project at once.)*

## 1. Portfolio management, not one task at a time

The unit of work isn't "the task in front of me" — it's "the portfolio," and
a project is the smallest addressable piece of it. Every project gets a slot
in a **registry** (a routing table: project → responsibilities → keywords),
its own **agent definition** (what this project is, what an agent may and
may not touch here), and its own **task board** that survives `/clear` and
compaction. You don't reconstruct context from a chat history every time you
switch projects — you look up the project, load exactly its slice, and act.

This is the actual scaling axis. Being very good at one task doesn't help you
when you're the bottleneck across twelve projects; a control point that can
triage all twelve project boards in one pass, route the top item in each to
the right project, and keep them from stepping on each other does.
`docs/portfolio.md` is the model; `skills/portfolio-triage` and `skills/route`
are the concrete skills that make it real, not aspirational.

## 2. Skills are the engine, not a side folder

None of the above works if "route this correctly" and "triage every board"
are things a manager has to re-figure-out from scratch on every invocation.
Encoding a repeatable management operation as a clean, well-scoped **skill**
— with a real contract (what it takes, what it does, when it should and
shouldn't load) — is what turns "an agent that's occasionally impressive" into
"a system that reliably does the boring, valuable thing every time."

`docs/skills.md` is the contract: frontmatter that declares a skill's
`domains` and `tier` so it loads only when relevant (lean context — nothing
pulled in speculatively), a clear boundary between what belongs in a skill
versus a standing discipline, and `disciplines/skill-design.md` for the
authoring checklist. `skills/demand-pipeline` (a staged sub-agent pipeline:
breakdown → design → implement → verify) and `skills/open-pr` (an optional PR
hub for projects that ship via pull request) are exemplars of what a
*powerful* skill looks like versus a thin one-liner wrapper. A framework that ships five
generic drop-in skills is a starter kit; a framework whose skills compose
into full management workflows is an operating system.

## 3. Two-layer memory (small context, high recall)

Most teams either stuff everything into the agent's context window
(expensive, slow) or rely on grep-at-query-time (brittle). SuperHarness uses a
two-layer index:

- **Routing index** — a compact always-loaded file (~150 lines) that names
  which cluster holds what. Always in context. Zero lookup latency.
- **Rich clusters** — full detail loaded on demand when the topic is live.
  Never loaded speculatively; the routing index decides relevance first.

Result: an agent that wakes up cold knows *where* to look without knowing
*everything* — the same pattern a senior engineer uses after a long weekend,
and the same pattern that lets the portfolio model above scale past a
handful of projects without ballooning every agent's context.

The sharper, more falsifiable claim underneath this is the **bounded,
self-healing property**: the routing index and rule set are supposed to trend
**flat or down** in size over time, even as the system learns more — new
lessons get folded into or replace existing entries (curate, don't accrete)
rather than piling on. A memory system that gets smarter without getting
heavier is a rarer and more testable claim than "tiered retrieval," and it's
the thing to hold SuperHarness adopters accountable to: if your index keeps
growing every week across your portfolio, the discipline isn't being
followed. See `docs/memory-system.md` for the schema and wiring instructions.

## 4. Issue-resolution contract (evidence before the fix)

The single most expensive failure mode in agent-assisted development is a
plausible-but-wrong fix that passes tests and ships broken — and it gets more
expensive, not less, when it's happening across a dozen projects at once
instead of one. SuperHarness encodes a hard gate: **no fix dispatch until a
written hypothesis, an evidence requirement, and an outcome prediction
exist** (`disciplines/issue-resolution-contract.md`).

See `docs/walkthrough-acme-notes.md` for a worked walkthrough: ranked hypotheses +
evidence correctly find the root cause, but the *first fix attempt* still
ships incomplete — it passes the happy-path and edge-case tests, then fails
the contract's mandatory negative test before it ever reaches main. Catching
an incomplete fix, not just a wrong diagnosis, is the more common real
payoff.

---

Read `PHILOSOPHY.md` for the four reasoning primitives everything above is
downstream of, `docs/portfolio.md` and `docs/skills.md` for the two pillars
that actually differentiate SuperHarness, and `disciplines/` for the full set of
12 operating rules.
