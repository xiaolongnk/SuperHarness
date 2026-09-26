---
name: learn
description: Captures a lesson from a mistake, correction, or discovery, traces it to a transferable principle, and routes it to the correct layer — memory, a discipline, or the knowledge archive.
domains: [knowledge, meta]
tier: both
---

# Learn skill

The capture half of the self-improvement loop (`disciplines/self-improvement-loop.md`). A
lesson that stays in conversation context dies at `/clear`; this skill is what turns it into
something the next session — or the next agent — actually inherits.

## When to use

Invoke at the end of a task, or any time one of three signals fires:

- **Friction** — a tool call had to be retried, the wrong file/table/approach was tried first,
  multiple attempts were needed before something worked, or an unexpected error required real
  investigation.
- **Feedback** — the user corrected an approach, said "the right way is X," or re-explained
  something that should already have been known. A correction that recurs (same topic, second
  time) is the strongest signal — it means the first capture missed or was never written.
- **Discovery** — a non-obvious tool/framework/infra behavior surfaced, a reusable pattern
  emerged, or a debugging journey ran long enough (multiple false starts, real time sunk) that
  losing the narrative would cost the next agent the same time back.

Skip when the task went smoothly, produced no correction, and taught nothing that isn't
already written down somewhere (git history, the code, the task board, an existing memory or
discipline). Memory and knowledge exist for what *isn't* recorded anywhere else — don't
duplicate the repo into them.

## Steps

1. **State the mistake or discovery plainly.** One or two sentences — what happened, what the
   wrong or surprising outcome was.
2. **Trace it to the root cause / underlying fact.** For a mistake: not "what fixed it" but
   "what principle was violated that let it happen" — keep asking why until you reach something
   transferable. For a discovery: what fact about the system, not just the symptom, would let
   someone skip the investigation next time.
3. **Distill the principle.** Write the general rule or fact the next agent should know, phrased
   so it applies beyond this exact file, task, or project. If you can't state it generally, you
   haven't reached the principle yet — keep tracing.
4. **Route it** using the decision tree below. Most lessons have exactly one home; a lesson that
   is both project-specific *and* generalizable gets written to both (see "Multi-target" below).
5. **Dedup-check before writing.** Search the target file/directory for the same topic
   (grep the key term). If an existing entry covers this, **update it in place** — sharpen the
   wording, don't append a near-duplicate. A library that only ever grows duplicates stops being
   navigable.
6. **Write the entry as a principle, not a fix.** Use the memory-file anatomy from
   `docs/memory-system.md` (frontmatter `name` / `description` / `type`) for memory entries, or
   the category template for a `knowledge/` entry. Include the **why** (the cost of not
   following it) and, where relevant, **how to apply** (the concrete trigger for next time).
7. **Link it back.** Reference the source (`[[other-memory-name]]`, a task-board item, a
   discipline file) so loading one surfaces its neighbors instead of leaving an island entry.
8. **Retire what it supersedes.** If this lesson replaces an older, now-wrong entry, update or
   delete that entry in the same pass — per `docs/memory-system.md`, a stale memory is worse
   than a missing one.

## Knowledge-routing decision tree

Ask these in order; stop at the first match:

```
1. Is it a correction to how you (the agent) should work — a behavioral rule that should
   apply on every future task, not just this project?
   → memory/ (type: feedback) — one fact, one file, frontmatter per docs/memory-system.md.
   → If the SAME correction has now recurred twice, it has earned promotion: also add it
     (or a pointer to it) as a discipline in disciplines/, so it's always-loaded, not just
     indexed. Two disciplines should not say the same thing — if one already exists, sharpen
     it instead of adding a second.

2. Is it specific to one project in the portfolio — a wrong field, a bad command, an API
   quirk, something another agent working that project would hit but a different project's
   agent never would?
   → the project's knowledge pack (`templates/knowledge-pack.md` schape) under its own
     "Key pitfalls" section.
   → Ask: does the underlying mechanism generalize past this one project? If yes, ALSO write
     the generalized version to `knowledge/` (multi-target — see below). Don't let a broadly
     useful fact hide inside one project's pack.

3. Is it cross-project but about the framework/tooling itself — a design decision, a
   business/domain fact, a debugging quirk of the shell/git/CI layer you're operating in?
   → memory/ (type: project for decisions/direction, type: reference for "where a thing
     lives"). Add the routing-index pointer per `docs/memory-system.md` Layer 1.

4. Is it a durable technical fact, pattern, or narrative any agent working this portfolio
   should be able to find — independent of which project or session produced it?
   → knowledge/tech-discoveries/<topic>.md   — non-obvious framework/infra behavior
   → knowledge/patterns/<name>.md            — a recurring design or workflow pattern
   → knowledge/insights/<topic>.md           — a process heuristic or meta-learning
   → knowledge/problem-solving/<name>.md     — a debugging journey with real twists
   → knowledge/incidents/<name>.md           — a production/user-facing incident writeup
   (See `docs/knowledge-system.md` for the exact shape of each category.)

5. Does it reveal that an existing discipline or skill was wrong, missing a case, or would
   have prevented this if it had fired?
   → Fix the discipline/skill directly (`disciplines/skill-design.md` governs skill edits).
     Per `disciplines/curate-dont-accrete.md`: sharpening an existing rule beats adding a new
     one that competes with it for attention.
```

**Cross-agent test** (for step 4): if a *different* agent working a *different* project in
this portfolio would make the same mistake without this fact, it belongs in `knowledge/` —
writing it only into one project's pack or one session's memory hides it from everyone else
who needs it.

**Multi-target rule**: don't compress a lesson that has both a narrow and a general dimension
into a single target. Example — a race condition found in one project's scheduler is a
project-pitfall (pack) AND a distributed-systems pattern (`knowledge/patterns/`). Write both;
losing the general half by only recording the narrow one is the more common failure than
over-writing.

## Entry quality bar

**Include**: non-obvious behavior a competent agent wouldn't guess from docs; anything that
cost real debugging time; a correction likely to recur; a pattern seen in 2+ places that
deserves a name.

**Exclude**: typos, one-off external outages, anything already in the code/README/task board,
anything trivially findable in official docs.

## Why this exists

The self-improvement loop (`disciplines/self-improvement-loop.md`) only compounds if the
*capture* step is disciplined — a lesson that isn't traced to a principle, or that's routed to
the wrong layer, either gets lost at the next `/clear` or bloats the always-loaded index instead
of the on-demand archive. This skill is the one place that discipline lives, so every capture —
regardless of which agent or project triggered it — lands in the same, predictable place.
