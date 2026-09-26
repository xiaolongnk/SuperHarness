---
name: release
description: Cuts a release — build, test, tag, and write the release note, in that order — assuming a clean working tree on the release branch.
domains: [release, ops]
tier: both
---

# Release skill

## When to use

Invoke when shipping a new build/version of a project (`/release`). Skip for work that isn't a
user-facing release — use `/verify` for a plain check that a change works without cutting a build.

## Steps

1. **Confirm the working tree is clean and on the release branch.** Abort if there are uncommitted
   changes or you're on the wrong branch — never tag a fuzzy state.
2. **Build the release configuration.** Stop on any build error; do not proceed to tag a broken
   build.
3. **Run the full test suite.** All green is required. **Quote the summary line** in your report —
   a release on an unverified suite is the failure mode this step exists to prevent. If anything
   fails, stop and fix before continuing.
4. **Tag the release.** Bump the version from the latest tag following the project's scheme
   (e.g. `vX.Y.Z`). Use the project's tag helper if it has one so the bump is deterministic.
5. **Write the release note — in the same run, before reporting done.** Two parts: a per-build
   "What to Test" attached to the upload/release, and one line added to the project's releases
   changelog (`docs/releases/<project>.md`). A build with no note means testers don't know what
   changed and history can't be reconstructed later.
6. **Verify the released artifact.** Confirm the tag points at the built commit and the artifact
   that ships actually contains the change — not just the local tree.
7. **Report:** version tagged, the quoted test summary, and the release-note text. Update the task
   board — move the shipped items to *Recently shipped*.
