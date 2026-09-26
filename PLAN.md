# SuperHarness — build plan (framework only)

## Goal

SuperHarness is the reference implementation of the source system's way of
working: a framework for managing a **portfolio** of projects in a monorepo
— a project registry, a clean composable **skill system**, layered operating
disciplines, and a two-layer memory system with a self-improvement loop. Not
bash coordination. Not one task at a time. The power is: one control point
keeps many runtime projects moving, and skills are the force-multiplier that
makes it efficient. It is a methodology + skill/discipline/memory framework
— not a multi-agent orchestration engine; it does not spawn, route between,
or supervise multiple agent processes. Success means:

1. **Portfolio power** — steer *many* runtime projects from one control
   point (route → delegate → verify across projects), the way the source
   system runs a real multi-project portfolio. See `docs/portfolio.md`.
2. **Skills are the engine** — clean, powerful, on-demand skills encode
   repeatable management operations; authoring good skills is a first-class
   discipline, not a side folder. See `docs/skills.md`.
3. **Faithful** — the repo encodes the whole harness as one coherent system:
   two-layer memory, the reasoning spine, evidence-before-fix, durable task
   state, model-routing — not a grab-bag of downstream procedures.
4. **Extensible** — a contributor can add a project, a skill, or a discipline
   through documented seams (`docs/extending.md`) — no engine to fork.

Every change in this repo earns its place by advancing one of these four.

## What SuperHarness IS
A reusable **portfolio-management + skill-system FRAMEWORK**: a project
registry and per-project structure for running many projects at once
(pillar 1), a skill system that encodes the management operations that make
that efficient (pillar 2), plus the disciplines + memory system + methodology
underneath. It does NOT ship a multi-agent execution engine or role
contracts (manager/coworker/reviewer) — those are bring-your-own if you
choose to run more than one agent process. Someone unfamiliar with the
source system can adopt it.

## What SuperHarness is NOT (hard invariant — enforced by an adversarial leak-scan)
- NO personal content. NO work/business content. NO **knowledge** (no project learnings,
  domain knowledge, agent-knowledge directories, memory content, incident write-ups).
- NO real project names, products, clients, people.
- NO infra: no hosts, IPs, domains, cloud accounts, credentials or their locations,
  registration / filing numbers, internal URLs, ports.
- NO source-system-specific absolute paths. Use generic placeholders (`<repo>`,
  `~/.config/...`, `$PROJECT`). It's a FRAMEWORK, not a snapshot of one system.
- If a rule/script only makes sense with private context, GENERALIZE it to the
  underlying pattern or omit it. When in doubt, omit.

## Status

**Consolidation: DONE.** An earlier internal draft has been consolidated into this repo. This is now the single source for the framework. Reshape tracks A / B1 / B2 (portfolio doc, skill contract, exemplar skills) have all landed.

**CLI: DONE (v0.1.0).** `npx create-superharness init | add-project | check | prime` — the repo is
also an npm package (zero deps, Node ≥ 18). `init` scaffolds a harness repo and wires the
SessionStart hook that makes "always-loaded" literally true; `check` turns the flat-or-down
tax metric and the registry ⇄ agents ⇄ boards invariant into an exit code. `npm test` proves
each gate can go red. Not yet published to npm — see "Remaining before owner go".

**Repo: Private / draft — awaiting owner go for public release.** No publish
step has occurred. Owner reviews all content and signs off before the repo is
shared or announced.

## Content completion (post-reshape)

| Area | Status |
|---|---|
| `docs/portfolio.md` + `templates/project-registry.md` (pillar 1 — portfolio management) | In progress (reshape track A) |
| `docs/skills.md` + `disciplines/skill-design.md` (pillar 2 — skill-design contract) | In progress (reshape track B1) |
| `skills/portfolio-triage`, `route`, `demand-pipeline` (exemplar management skills) + `open-pr` (optional PR-workflow skill) | In progress (reshape track B2) |
| `disciplines/` (12 files + README, incl. `evidence-before-claim.md`) | Complete |
| `PHILOSOPHY.md` (4 reasoning primitives) | Complete |
| Crew execution engine — out of scope for this repo; bring your own | Complete |
| Role contracts (manager, coworker, reviewer) — out of scope for this repo; bring your own | Complete |
| `docs/` (workflow, delegation, model-routing, task-state, memory-system, extending) | Complete |
| `templates/` (task board, incident doc, brief, persona header) | Complete |
| `skills/` (original 5 drop-in discipline skill files) | Complete |
| `docs/walkthrough-acme-notes.md` + the `acme-notes` example project (worked end-to-end example) | Complete |
| `LICENSE` (MIT) + `LICENSE-DOCS.md` (CC BY 4.0) | Complete |
| `CONTRIBUTING.md` | Complete |
| `README.md` / `ESSAY.md` (portfolio + skills front door) | Complete (this track) |

**"Complete" here means the planned file structure is fully populated for
that area** — it does **not** mean "a complete extraction of the source
system's operating philosophy." As of this reshape, the portfolio-management
model and the skill system (pillars 1 and 2 — the actual differentiators per
the Goal above) are still landing in parallel tracks; this file's own
front-door content (Goal, README, ESSAY.md) is written ahead of them and
references `docs/portfolio.md`, `docs/skills.md`, and the four exemplar
skills by name — those files exist on sibling branches at the time of this
commit and are expected to merge before the repo goes public. Treat the
table as a structural checklist, not a fidelity claim.

## Remaining before owner go

- [x] Reshape tracks A (`docs/portfolio.md`) + B1/B2 (`docs/skills.md` +
      exemplar skills) merged
- [x] CLI + npm packaging (`package.json`, `bin/`, `src/`, `test/`)
- [ ] `npm publish` as `create-superharness` (`superharness` is taken on npm by an unrelated project) so `npm create superharness` works
- [ ] Owner reads full repo for any residual private/work/knowledge leak
- [ ] Owner approves publish target (GitHub, GitLab, or a self-hosted host)
- [ ] Owner confirms license choices (MIT + CC BY 4.0 already encoded)
- [ ] Public repo created and content pushed
- [ ] Announcement copy drafted (HN / community channels)
