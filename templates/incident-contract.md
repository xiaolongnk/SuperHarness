# Incident contract — template

> Copy to `docs/incidents/<slug>-<date>.md` for any non-trivial issue: a bug, regression, or
> "X doesn't work" where the fix isn't obvious. It forces *evidence before fix* and leaves a
> durable, auditable trail. Skip it for one-line typos where the cause is self-evident in a minute.

---

```markdown
# <one-line problem statement>

**Opened:** <YYYY-MM-DD HH:MM>  ·  **Reporter:** <who hit this>
**Severity:** blocker | high | medium | low  ·  **Status:** open | investigating | proposed-fix | shipped | verified | failed | abandoned

## 1. Problem (what's observed)
- Symptom — what the reporter actually sees, verbatim if possible.
- Environment — versions, device, account, recent changes.
- Reproducible? Steps if yes; "intermittent / once per session / …" if not.

## 2. Initial hypothesis (ranked)
What we think the cause is, most-likely first. Be honest about uncertainty.
1. <hypothesis A> — most likely because <reason>.
2. <hypothesis B> — possible if <condition>.

## 3. Evidence required to confirm / refute each
For each hypothesis: what observation would prove it, and what would rule it out?
- A → look at <log / query / state>; present = confirm, absent = refute.
- B → check <X>; value <V> = confirm, else refute.

## 4. Evidence gathered
Update as you go. Logs, query results, repro output — with timestamps.
- [<time>] checked <X> → found <Y> → this <confirms | refutes | is inconclusive for> hypothesis A.

## 5. Root cause
Fill in ONLY after evidence supports it. State the cause and cite the evidence that proves it.
Jumping here on a guess violates the contract.

## 6. Proposed fix
- The change — specific code / config / process.
- **Prediction:** after this fix, observable outcome <X> will happen on scenario <Y>.
- Why it addresses the root cause, not just the symptom.

## 7. Acceptance test
- **Happy path:** the normal scenario that must pass.
- **Edge case that reproduces the ORIGINAL failure:** must pass after the fix (this is what proves
  we fixed the real thing, not a lookalike).
- **Negative test:** what should still NOT work — proof we didn't over-fix.

## 8. Attempts (chronological)
| # | When | Change made | Predicted outcome | Actual outcome | Hypothesis still valid? |
|---|------|-------------|-------------------|----------------|-------------------------|
| 1 | <time> | <change> | <prediction> | <what happened> | yes / no / partial |

## 9. Resolution
- Final state: resolved | partially-resolved | abandoned.
- Shipped where: commit / PR / deploy ref.
- Acceptance test passed: yes / no, with evidence.

## 10. Retrospective
- **What we got right** — calls that held up under evidence.
- **What we got wrong** — hypotheses that were wrong; fixes that hit symptoms not causes.
- **The gap** — between what we believed going in and what was actually true.
- **Transferable takeaway** — the one durable lesson; promote it to a rule if broadly useful.
```

---

## Why each section exists

- **Hypothesis → required evidence → gathered evidence → root cause** is the spine. It physically
  separates "what we guess" from "what we've proven," so a guess can't masquerade as a diagnosis.
- **Prediction in the fix, attempts table** turn debugging into a falsifiable loop: you say what
  will happen *before* you change anything, then record what actually did.
- **Acceptance test with the original-failure edge case** is what stops a lookalike fix from passing.
- **Retrospective** is where the incident pays for itself — it converts the scar into a rule.

## Tips

- **No fix until §1–§7 are filled in.** If you can't write down what your fix should produce, you
  don't understand the bug yet.
- **Each attempt records its prediction BEFORE the change** — predicting after the fact is cheating
  and kills the learning loop.
- **Two failed predictions in a row → revisit the hypothesis (back to §2), don't keep patching.**
  Same failed prediction class twice means the theory is wrong, not the patch.
- Keep an `INDEX.md` of open + recently-closed incidents so patterns across them stay visible.
