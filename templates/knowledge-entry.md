# Knowledge entry — template

> Copy the section matching your category into `knowledge/<category>/<topic-slug>.md`
> (prefix with `YYYY-MM-DD-` if the entry is time-bound, e.g. an incident or a
> version-specific discovery). See [`../knowledge/README.md`](../knowledge/README.md) for
> which category fits and the quality bar for adding an entry at all.

---

## `problem-solving/` — full narrative

```markdown
# <Problem Title>

**Date**: YYYY-MM-DD
**Projects**: <affected project(s), if any>
**Tags**: <keywords for future search>

## Problem
What was observed? What were the symptoms, verbatim if possible?

## Investigation
What was tried, in order? What hypotheses were ruled out, and by what evidence? Include
dead ends — they're what save the next agent from repeating them.

## Root Cause
The actual underlying cause, stated precisely.

## Solution
What fixed it. Include the key code/config/command change.

## Takeaway
One line: the transferable rule, not just "changed X to Y."
```

## `insights/` — heuristic or process wisdom

```markdown
# <Insight Title>

**Date**: YYYY-MM-DD
**Domain**: <area this applies to>

## Insight
The core insight, stated as a general rule.

## Evidence
What experience(s) led to this? Cite the concrete instance(s), not just the abstraction.

## Application
How to apply this in future work — concrete, not just "be more careful."
```

## `patterns/` — recurring practice or anti-pattern

```markdown
# <Pattern Name>

**Observed in**: <projects/situations where this showed up>
**Pattern type**: best-practice | anti-pattern | workaround

## Pattern
Description of the pattern itself.

## When to Apply
The conditions that make this pattern (or avoiding this anti-pattern) relevant.

## Example
A concrete example from real work — specific enough to recognize the shape again.
```

## `incidents/` — post-mortem

```markdown
# Incident: <one-line description>

**Date**: YYYY-MM-DD
**Severity**: blocker | high | medium | low
**Status**: open | resolved

## Impact
Who/what was affected, for how long, and how badly.

## Timeline
Key timestamps: when it started, was noticed, was mitigated, was resolved.

## Root Cause
The confirmed cause — not a guess. See `disciplines/evidence-before-claim.md` for the
evidence bar this section must clear before being written.

## Resolution
What was done to stop the bleeding and to fix the underlying cause.

## Follow-up / prevention
What changes (tests, alerts, process) prevent this class of incident from recurring.
```

## `tech-discoveries/` — tool/framework quirk

```markdown
# <Discovery Title>

**Date**: YYYY-MM-DD
**Tech**: <technology/library/platform name>
**Context**: <when this becomes relevant>

## Discovery
What was learned — the non-obvious behavior itself.

## Why It Matters
What would go wrong (or what time would be lost) without knowing this?

## Example
Concrete code/command/config example, ideally showing the wrong assumption vs the fix.
```

---

## Frontmatter-free by design

Unlike `memory/` entries, `knowledge/` entries don't carry routing frontmatter (`name`,
`description`, `type`) — they aren't matched by an automatic router, they're found by
search or by an explicit `[[link]]`. Keep the **Date** / **Tags** / **Projects** header
line(s) instead, since those are what a human or agent scans when browsing a category
directory looking for something relevant.
