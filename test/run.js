'use strict';

// End-to-end: scaffold → add-project → check passes → break each invariant → check fails.
// The second half is the point (PHILOSOPHY.md #1c): a gate that cannot go red is decoration.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'superharness-'));

// Test the PUBLISHED artifact, not the checkout: pack the tarball and install it into a
// throwaway prefix. A file missing from package.json "files" only shows up this way.
const pkgRoot = path.resolve(__dirname, '..');
execFileSync('npm', ['pack', '--pack-destination', tmp, '--silent'], { cwd: pkgRoot, stdio: 'ignore' });
const tgz = fs.readdirSync(tmp).find((f) => f.endsWith('.tgz'));
execFileSync('npm', ['i', '-g', '--prefix', path.join(tmp, 'prefix'), path.join(tmp, tgz), '--silent'], { stdio: 'ignore' });
const BIN = path.join(tmp, 'prefix/bin/superharness');

function run(args, { cwd = tmp, expectFail = false, env = {} } = {}) {
  try {
    const out = execFileSync('node', [BIN, ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });
    assert(!expectFail, `expected failure for: ${args.join(' ')}\n${out}`);
    return out;
  } catch (e) {
    if (!expectFail || e.code === 'ERR_ASSERTION') throw e;
    return (e.stdout || '') + (e.stderr || '');
  }
}

let n = 0;
function test(name, fn) { fn(); n++; console.log(`  ok  ${name}`); }

test('init scaffolds a harness', () => {
  run(['init', 'hub', '--no-git']);
  for (const f of ['PHILOSOPHY.md', 'CLAUDE.md', 'disciplines/README.md', 'skills/route/SKILL.md',
    'docs/portfolio-registry.md', 'memory/MEMORY.md', 'scripts/harness-prime.sh', '.claude/settings.json', 'harness.json',
    'knowledge/incidents/acme-notes-sync-outage.md']) {
    assert(fs.existsSync(path.join(tmp, 'hub', f)), `missing ${f}`);
  }
  assert(fs.existsSync(path.join(tmp, 'hub/.claude/skills/route/SKILL.md')), 'skills not mounted at .claude/skills');
  const reg = fs.readFileSync(path.join(tmp, 'hub/docs/portfolio-registry.md'), 'utf8');
  assert(!reg.includes('acme-web'), 'example rows should be stripped without --with-examples');
});

const hub = path.join(tmp, 'hub');

test('init --with-examples ships the example projects from the tarball', () => {
  run(['init', 'ex', '--with-examples', '--no-git']);
  for (const f of ['agents/acme-web.md', 'docs/tasks/acme-api.md', 'runtime/work/code/acme-api/main.go',
    'docs/walkthrough-acme-notes.md', 'docs/knowledge/acme-notes.md', 'agents/acme-notes.md',
    'memory/feedback-rebuild-index-after-bulk-import.md', 'knowledge/incidents/search-stale-after-import-2026-02-14.md']) {
    assert(fs.existsSync(path.join(tmp, 'ex', f)), `missing ${f}`);
  }
  assert(run(['check'], { cwd: path.join(tmp, 'ex') }).includes('3 project(s)'), 'examples should register 3 projects');
});

// Git identity is supplied explicitly: CI runners and fresh machines have none configured,
// and init must not invent one — it skips the commit and says so (second half of this test).
const GIT_ID = {
  GIT_AUTHOR_NAME: 'superharness-test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
  GIT_COMMITTER_NAME: 'superharness-test', GIT_COMMITTER_EMAIL: 'test@example.invalid',
};
// useConfigOnly stops git guessing an identity from the machine's hostname, so this is
// deterministic on any box.
const NO_GIT_ID = {
  GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'user.useConfigOnly', GIT_CONFIG_VALUE_0: 'true',
};

test('init makes an initial commit when git is available', () => {
  run(['init', 'g'], { env: GIT_ID });
  const log = execFileSync('git', ['log', '--oneline'], { cwd: path.join(tmp, 'g'), encoding: 'utf8' });
  assert(log.includes('superharness init'), 'no initial commit');
  assert.strictEqual(execFileSync('git', ['status', '--short'], { cwd: path.join(tmp, 'g'), encoding: 'utf8' }), '', 'dirty tree after init');
});

test('init without a git identity still scaffolds, and says the commit was skipped', () => {
  const out = run(['init', 'g2'], { env: NO_GIT_ID });
  assert(fs.existsSync(path.join(tmp, 'g2/.git')), 'repo not initialised');
  assert(out.includes('initial commit (configure git user.name/user.email'), out);
  const commits = execFileSync('git', ['rev-list', '--all', '--count'], { cwd: path.join(tmp, 'g2'), encoding: 'utf8' }).trim();
  assert.strictEqual(commits, '0', 'a commit was made without an identity');
});

test('init is idempotent on an adopted repo', () => {
  fs.writeFileSync(path.join(hub, 'CLAUDE.md'), '# mine\n');
  run(['init', '--no-git'], { cwd: hub });
  assert.strictEqual(fs.readFileSync(path.join(hub, 'CLAUDE.md'), 'utf8'), '# mine\n', 'init overwrote an existing file');
});

test('check passes on a fresh scaffold', () => {
  assert(run(['check'], { cwd: hub }).includes('OK'));
});

test('add-project creates the four files together', () => {
  run(['add-project', 'notes', 'personal', 'cli'], { cwd: hub });
  for (const f of ['agents/notes.md', 'docs/tasks/notes.md', 'runtime/personal/code/notes']) {
    assert(fs.existsSync(path.join(hub, f)), `missing ${f}`);
  }
  assert(fs.readFileSync(path.join(hub, 'docs/portfolio-registry.md'), 'utf8').includes('| `notes` | personal |'));
  assert(fs.readFileSync(path.join(hub, 'memory/MEMORY.md'), 'utf8').includes('| `notes` |'), 'memory index row missing');
  assert(fs.existsSync(path.join(hub, 'memory/clusters/notes.md')), 'memory cluster missing');
  assert(run(['check'], { cwd: hub }).includes('1 project(s), no drift'));
});

test('add-project refuses a bad tier and a duplicate', () => {
  assert(run(['add-project', 'x', 'team'], { cwd: hub, expectFail: true }).includes('tier must be'));
  assert(run(['add-project', 'notes', 'work'], { cwd: hub, expectFail: true }).includes('already registered'));
});

test('check goes red when a board disappears, green when restored', () => {
  const board = path.join(hub, 'docs/tasks/notes.md');
  const saved = fs.readFileSync(board);
  fs.unlinkSync(board);
  assert(run(['check'], { cwd: hub, expectFail: true }).includes('has no docs/tasks/notes.md'));
  fs.writeFileSync(board, saved);
  assert(run(['check'], { cwd: hub }).includes('OK'));
});

test('check goes red when the memory index and registry disagree', () => {
  const mem = path.join(hub, 'memory/MEMORY.md');
  const saved = fs.readFileSync(mem);
  fs.writeFileSync(mem, saved.toString().replace('| `notes` |', '| `ghost` |'));
  const out = run(['check'], { cwd: hub, expectFail: true });
  assert(out.includes('"ghost" is not in the registry') && out.includes('"notes" has no routing row'), out);
  fs.writeFileSync(mem, saved);
});

test('check goes red on a broken markdown link and an unindexed knowledge entry', () => {
  const stray = path.join(hub, 'docs/stray.md');
  fs.writeFileSync(stray, 'see [the plan](nowhere/plan.md) and [ok](portfolio.md)\n');
  const entry = path.join(hub, 'knowledge/insights/unindexed.md');
  fs.writeFileSync(entry, '# lost\n');
  const out = run(['check'], { cwd: hub, expectFail: true });
  assert(out.includes('docs/stray.md: broken link → nowhere/plan.md'), out);
  assert(!out.includes('portfolio.md'), 'valid link reported as broken');
  assert(out.includes('does not link knowledge/insights/unindexed.md'), out);
  fs.unlinkSync(stray); fs.unlinkSync(entry);
  assert(run(['check'], { cwd: hub }).includes('OK'));
});

test('check goes red on an orphan agent definition', () => {
  const orphan = path.join(hub, 'agents/ghost.md');
  fs.writeFileSync(orphan, '# ghost\n');
  assert(run(['check'], { cwd: hub, expectFail: true }).includes('agents/ghost.md has no registry row'));
  fs.unlinkSync(orphan);
});

test('check goes red when the always-loaded tax grows, and --update-baseline accepts it', () => {
  fs.appendFileSync(path.join(hub, 'PHILOSOPHY.md'), '\n' + 'x'.repeat(500) + '\n');
  assert(run(['check'], { cwd: hub, expectFail: true }).includes('tax grew 5'));
  assert(run(['check', '--update-baseline'], { cwd: hub }).includes('OK'));
});

test('prime prints the always-loaded core', () => {
  const out = run(['prime'], { cwd: hub });
  assert(out.includes('# Disciplines'), 'prime output missing disciplines index');
  assert(/primitive/i.test(out), 'prime output missing PHILOSOPHY');
  assert(out.includes('memory index'), 'prime output missing memory routing index');
});

test('the package itself passes check', () => {
  assert(run(['check'], { cwd: path.resolve(__dirname, '..') }).includes('OK'));
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${n} tests passed`);
