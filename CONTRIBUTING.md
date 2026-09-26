# Contributing

Thanks for taking a look. First, a clear expectation:

**This repo is a methodology, a set of templates, and one small CLI that keeps them consistent.**
The CLI (`bin/`, `src/`, zero dependencies) scaffolds a harness repo and gates drift; the
markdown is the actual product. It's a playbook one developer wrote for running many projects
in parallel with AI coding agents, shared in case it's useful to you. Adopt the parts that help,
ignore the rest, fork it and make it yours. `npm test` must stay green — it scaffolds into a
temp dir and proves each `check` invariant can go red.

That said, improvements are very welcome. The method gets better when people who actually run it at
scale push back on it.

## What's worth contributing

- A clearer explanation of a concept that confused you.
- A template field that's missing, or one that's dead weight.
- A new lesson / rule pattern you've earned the hard way (with the *why* — that's the valuable part).
- Fixes to typos, broken links, or muddy wording.

## How to propose a change

1. **Small fixes** (typos, wording, broken links) → open a PR directly.
2. **Bigger ideas** (a new concept, a structural change) → open an issue first so we can talk it
   through before you spend time writing it.
3. Keep PRs focused — one idea per PR is much easier to review and merge.

## Style bar

The whole repo is written in one voice. Match it:

- **Terse, factual, present-tense.** State what a thing IS and DOES. Avoid "you might want to…" and
  speculative framing.
- **Every example uses `acme-notes`** — the one fictional project this repo ships. Don't introduce
  new example names; reuse `acme-notes` (and `acme-web` where a second project is needed) so
  examples stay consistent.
- **Templates follow the established shape:** a fenced copy-paste block, then "Why each section
  exists," then "Tips." Look at any file in `templates/` before adding one.
- **No real anything.** No real product, company, or client names; no real hosts, IPs, domains,
  credentials, or absolute filesystem paths. Describe config by its role and point to where it
  lives — never paste a value.

> ⚠️ **Automated scan.** Every push runs a secret/identifier scan. A PR that trips it on a leaked
> key, host, domain, or private path will be blocked until it's cleaned. Keep examples fictional and
> you'll never see it fire.

## Licensing

By contributing you agree your contributions are licensed under the same terms as the repo:

- **Docs and prose** → CC BY 4.0 (see [LICENSE-DOCS.md](LICENSE-DOCS.md)).
- **Code and templates** → MIT (see [LICENSE](LICENSE)).

That's it. Open an issue if anything's unclear — and thanks for helping make the method sharper.
