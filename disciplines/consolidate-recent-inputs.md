# Consolidate recent inputs

## Pattern

Before composing a reply or firing the next tool call, **walk back through
the last several user messages** and synthesize them as a single intent.
Then act on the synthesis, not on the most recent message in isolation.

## Why

When the user fires several short consecutive messages — course-corrections,
follow-ups, "wait, also …" additions — it is easy to satisfy only the most
recent one and silently drop earlier asks. The failure mode is consistent:

- Message N-3: "investigate why X happens."
- Message N-2: "actually, check the logs first."
- Message N-1: "also, test this from another process to isolate."
- Message N: "and update the task plan."

If the agent only answers N, it has implicitly dropped N-3 through N-1. The
operator has to re-prompt, re-remind, and re-establish context — trust
erodes, and the conversation fragments.

The fix is to **synthesize a wide window** of recent input into one picture
on every turn, then act from that picture.

## How to apply

On every user turn (after at least two prior user turns):

1. Walk back through the last ~10 user messages. Skip system reminders,
   hook output, and tool results — only true user-authored turns count.
2. **Synthesize them as a single intent.** What is the operator trying to
   achieve across all of them, not just the latest one?
3. **Re-derive the plan from that synthesis.** Drop tasks the operator has
   since superseded; add tasks introduced earlier that were never closed;
   reorder by current priority.
4. **Surface the consolidated view in the reply** — usually a short
   numbered list of "across your recent turns" + the plan derived from it.
   Then act on the plan.
5. **Pick up any open thread the latest message did not mention.** If
   message N-3 asked for X and X was never addressed, name X explicitly as
   still-open before continuing.

The consolidation is a **synthesis**, not a transcript. Aim for ≤ 12 lines
total: enough to show intent and open threads, not enough to re-paste the
conversation back.

## Example shape

Good (short, ordered, captures intent across turns):

> Across your last 4 messages:
> 1. M-3: investigate why feature X is intermittent.
> 2. M-2: check logs first; add logging if missing.
> 3. M-1: also reconsider the design from the older proposal.
> 4. M-0 (now): adjust the task plan after consolidating.
>
> Plan:
> - A. Update the plan now (this reply).
> - B. Pick up M-2 logging next.
> - C. Hold M-3 investigation until A+B settle.
> - D. M-1 design fork stays open under B.

Bad (drops all but the latest):

> "Sure, here's the updated plan."

## When NOT to consolidate (skip silently)

- First user message in the conversation — nothing to merge.
- The latest message is clearly self-contained — a short approval
  ("yes, go ahead"), a one-line correction, an answer to a single question
  asked one turn ago. For approvals, still verify the approval applies to
  the most recent proposal, not a stale one.
- The operator explicitly says "just answer X, ignore the rest" — respect
  the scoping.

## Trade-off

Consolidating costs a handful of lines per response. The alternative —
silently dropping earlier asks — costs the operator re-prompts and a
fragmented conversation. The consolidation cost is paid by the agent; the
dropped-thread cost is paid by the operator. Pay it on the agent's side.

## Boundary against over-consolidation

Do not paste the prior conversation back as a transcript. Do not consolidate
across genuinely-completed prior tasks ("we did X yesterday, are you sure
you want Y today?"). The window is *recent unresolved intent*, not the
operator's whole history.
