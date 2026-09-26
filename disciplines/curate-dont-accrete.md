# Curate, don't accrete

## Pattern

Every piece of feedback — a correction, a bug, a "no, not like that" — gets
run through the same four-step loop, and the last step is a **decision with
a default**, not a reflex:

1. **Fix the immediate thing.** Solve what's in front of you.
2. **Name the principle that was violated — with evidence, not assumption.**
   Not "what new rule would catch this," but: which existing discipline,
   skill, or memory *should* have fired, and why didn't it — was it buried
   under too much other always-loaded content, not actually consulted,
   worded in a way that didn't match the situation, or genuinely absent?
   Verify the answer against the real state of the repo before naming it. A
   plausible story from memory is a hypothesis, not a diagnosis — this is
   `evidence-before-claim.md` applied to the meta-question of *why the system
   didn't already catch this*.
3. **Act, in this priority order — adding net-new is the last resort:**
   - **(a) Already covered → the gap was activation, not knowledge.** An
     existing discipline, skill, or memory already says this. Don't add
     anything. Sharpen the existing entry, shorten it, or cut the noise
     around it so it can actually be found and applied next time. Adding a
     new entry when one already existed is the cover-up move —
     `PHILOSOPHY.md` primitive #3 names this directly: it looks like
     progress but doesn't change the underlying behavior. This is the
     *default* outcome — most feedback lands here, because most systems that
     failed to prevent a mistake already had *something* relevant; the
     something just wasn't sharp enough or was drowned out.
   - **(b) Existing entry was misleading → fix it in place.** The content
     was there but said the wrong thing, or said it ambiguously enough that
     it got applied incorrectly. Correct it where it lives; don't leave the
     wrong version standing next to a new right one.
   - **(c) Principle genuinely absent → add ONE entry, and retire or merge
     at least one existing entry so the always-loaded set doesn't grow.**
     This is the only case where net-new content is justified, and even
     here the working-set size is a constraint, not a side effect — pair
     every addition with a subtraction somewhere in the same layer.
4. **Route to the correct layer**, per `docs/architecture.md`'s table:
   durable cross-cutting reasoning → a discipline; a repeatable procedure →
   a skill; project-specific fact → that project's memory cluster; a fact
   that has stopped changing any decision → sediment it into `knowledge/`
   (see `docs/memory-system.md#sediment-dont-delete` for what "sediment"
   means concretely).
5. **State which principle fired and which action was taken** (sharpen /
   fix-in-place / sediment / add-with-retire) when reporting the fix, so the
   loop is visibly closed without silently inflating the system.

## Why

The natural reflex after a mistake is "add a rule so it doesn't happen
again." Followed every time, that reflex is how a framework accumulates
dozens of always-loaded rules, each individually reasonable, that collectively
bury the two or three that actually matter — the exact failure mode
`PHILOSOPHY.md` primitive #4 names. A correction that gets fixed by adding
undifferentiated content on top makes every *other* entry in that same
always-loaded layer slightly weaker, because there is now more of it to read,
skim, and eventually stop reading closely. Curation is the discipline that
catches this reflex before it fires, by making "add" earn its place instead
of being the default action.

## How to apply

- Before writing a new discipline, skill, or memory entry, search for an
  existing one that already covers the situation. If a related entry exists
  but the correction still slipped through, that is evidence for (a) or (b)
  above, not for adding a third entry alongside the two that already exist.
- When (c) genuinely applies, the retirement is not optional bookkeeping —
  it's the mechanism that keeps the metric below from drifting upward. Pick
  the entry in the same layer that's stalest, narrowest, or most
  superseded, and fold it into the new one or sediment it to `knowledge/`.
- Prefer sharpening over lengthening. A discipline that grows every time it
  almost-but-not-quite caught something becomes long instead of sharp, and a
  long discipline gets skimmed instead of read. If a fix requires adding
  words, look for words to cut in the same file first.

## When NOT to apply

- The correction is a one-turn, non-durable detail (a typo, a
  misunderstanding local to this conversation) — see
  `self-improvement-loop.md`'s "When NOT to apply" for the boundary on what
  counts as a lesson worth running through this procedure at all.
- The situation is genuinely novel and no existing entry in any layer is
  even adjacent to it — case (c) applies directly, without spending time
  searching for a (a)/(b) match that doesn't exist. Don't manufacture a
  fix-in-place out of an unrelated entry just to avoid adding something new.

## The falsifiable metric

This discipline is checkable, not aspirational: **the always-loaded working
set — the disciplines index, the memory routing index, the skills index, and
their total byte size — must trend flat or down over time**, even as the
on-demand library (`disciplines/*.md` bodies, memory clusters,
`skills/*/SKILL.md`, `knowledge/**`) grows without limit. Capture a baseline
(file count, line count, byte size of the always-loaded layer) the first time
this discipline is adopted, and re-check it periodically — `context-health`
is the tool for that recheck. If the working set keeps climbing turn over
turn despite this discipline being "followed," the discipline is failing in
practice, and *that* — not another rule about curating — is the next thing
to fix.

## Relationship to other disciplines

This file is the decision procedure that runs inside the CURATE step of
`self-improvement-loop.md`. It is itself a concrete application of
`PHILOSOPHY.md` primitives #3 (fix the cause, not the appearance) and #4
(subtract before you add) to the specific case of incoming feedback.
