# acme-notes: sync conflicts silently dropped the newer edit

**Date**: 2026-05-12
**Projects**: acme-notes
**Tags**: sync, offline-first, conflict-resolution, last-write-wins

## Problem

Users reported that an edit made on their phone would sometimes vanish after the laptop
client reconnected and synced. No error, no crash — the note just reverted to the
laptop's older version.

## Investigation

First hypothesis: a race between the two clients' upload requests. Added request-level
logging on the sync endpoint — timestamps showed the phone's write consistently landed
*before* the laptop's, so a naive "last write wins by arrival order" should have kept the
phone's edit. That ruled out the obvious race.

Second hypothesis: clock skew. The phone's edit carried a client-generated `updated_at`
that was, in a few cases, *behind* the laptop's despite arriving first — the phone's clock
was ~40 seconds slow. The sync merge logic used `updated_at` (client clock) to decide the
winner, not arrival order or a server-assigned sequence.

## Root Cause

The merge resolver trusted the client-supplied timestamp as the ordering key. Any client
with clock drift (common on mobile, especially just after a timezone change or NTP
resync) could report an `updated_at` earlier than a genuinely older edit from another
device, causing the resolver to keep the wrong version.

## Solution

Replaced client-timestamp ordering with a server-assigned monotonic sequence number,
issued at the moment the server accepts the write — never trust a client clock for
ordering across devices. Kept `updated_at` for display purposes only.

## Takeaway

Never use a client-reported timestamp to order writes from *different* clients — clock
skew make it non-monotonic. Use a server-assigned sequence (or vector clock, if you need
true causality tracking) instead.
