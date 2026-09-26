# When an edit keeps dropping a literal, derive from a known-good source instead of retyping

**Date**: 2026-05-20
**Domain**: config/text editing, any language

## Insight

After a fiddly literal (a regex, a long constant, a config value with exact whitespace)
fails to apply correctly twice in a row via manual retyping, stop retyping a third time.
Instead, derive the new value with a minimal, mechanical transformation of the existing
known-good text — a substitution, a diff-based patch — and assert the result matches the
expected shape before writing it.

## Evidence

On acme-notes, a YAML block with a multi-line literal (an embedded certificate-like blob)
kept losing a trailing character on manual edits — twice, both times a slightly different
corruption. The blob was long enough that eyeballing the diff didn't catch it either time.
Switching to "load the existing value, apply one `sed`-style substitution, assert the
byte length is unchanged" caught the problem immediately (the assertion failed on the
first attempt, revealing the substitution pattern itself was slightly off) and produced a
correct result once fixed.

## Application

- Two failed manual edits of the same fiddly literal is the signal to stop, not to try
  harder by hand a third time.
- Prefer deriving from the existing value (substitution, patch) over retyping from
  scratch — a targeted change is verifiable; a full retype of a long literal is not.
- Add an assertion on an invariant the literal must satisfy (length, a checksum, a known
  substring) so a bad derivation fails loudly instead of silently corrupting the write.
