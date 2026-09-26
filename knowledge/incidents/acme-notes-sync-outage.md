# Incident: acme-notes sync API returned 500s for ~40 minutes

**Date**: 2026-06-02
**Severity**: high — sync fully unavailable; local edits queued but did not error visibly
**Status**: resolved

## Impact

For ~40 minutes, every sync request from every client returned HTTP 500. Clients queued
writes locally and retried with backoff, so no data was lost, but users saw a persistent
"not synced" indicator and could not see edits made on other devices.

## Timeline

- 14:02 — deploy of a routine dependency bump to the sync service.
- 14:05 — error rate on `/sync` climbs from ~0% to 100%.
- 14:11 — on-call paged by the error-rate alert.
- 14:22 — rollback of the deploy initiated.
- 14:41 — error rate back to baseline; incident closed.

## Root Cause

The dependency bump upgraded the JSON schema validation library. Its new major version
tightened validation to reject an optional field the sync payload sometimes omitted
(`client_locale`), which the previous version treated as nullable-and-optional by default.
Every request missing that field — the majority of traffic — was rejected before reaching
business logic.

## Resolution

Rolled back the deploy. Follow-up PR pinned the field's schema explicit `nullable: true`
so the upgrade could re-land without the regression, and added a contract test that posts
a payload missing every optional field to catch schema-tightening regressions before
deploy.

## Follow-up / prevention

- Added a pre-deploy contract test suite that exercises "minimal valid payload" (only
  required fields present) against the sync schema.
- Dependency bumps to schema/validation libraries now require running that suite
  explicitly, not just the general unit test pass, since a passing unit suite did not
  catch this (the tests happened to always populate the optional field).
