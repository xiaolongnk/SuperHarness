'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const u = require('./util');

const PRIME_SH = `#!/bin/sh
# SessionStart hook: inject the always-loaded core into every agent session.
# Everything else (skills, memory clusters, knowledge, task boards) loads on demand.
# Keep this list SHORT — its byte size is the "always-loaded tax" that \`superharness check\` guards.
cd "$(dirname "$0")/.." || exit 1
cat PHILOSOPHY.md
echo
cat disciplines/README.md
echo
cat memory/MEMORY.md
`;

const SETTINGS = {
  hooks: {
    SessionStart: [
      { hooks: [{ type: 'command', command: 'sh scripts/harness-prime.sh' }] },
    ],
  },
};

const GITIGNORE = `# Runtime projects are independent git repos — never part of this history.
# Only the layout (READMEs + .gitkeep) is tracked.
runtime/*/code/*
!runtime/*/code/.gitkeep
runtime/*/data/*
!runtime/*/data/.gitkeep
runtime/worktree/*
!runtime/worktree/README.md

# Local / editor / OS cruft
tmp/
*.log
.env
.env.*
.DS_Store
.vscode/
.idea/
node_modules/
`;

function claudeMd(name) {
  return `# ${name} — harness

Management layer for a portfolio of runtime projects. Scaffolded by
[SuperHarness](https://github.com/xiaolongnk/SuperHarness); the model is
\`docs/portfolio.md\`, the architecture is \`docs/architecture.md\`.

## Every session

1. \`PHILOSOPHY.md\` + \`disciplines/README.md\` + \`memory/MEMORY.md\` are injected by the SessionStart
   hook — the always-loaded core. Everything below loads only when a task matches it.
2. A task that names a project → read \`docs/tasks/<project>.md\` FIRST, then \`agents/<project>.md\`.
3. A task that names no project → \`docs/portfolio-registry.md\` decides which project owns it
   (\`skills/route\`).
4. Before the session ends, flush open items back to the task board — conversation context
   does not survive; the board does (\`disciplines/durable-task-state.md\`).

## Layout

| Layer | Always-loaded | On demand |
|---|---|---|
| Reasoning | \`PHILOSOPHY.md\` | — |
| Disciplines | \`disciplines/README.md\` | \`disciplines/*.md\` |
| Skills | each skill's \`description:\` (the agent CLI reads them from \`.claude/skills/\`) | \`skills/<name>/SKILL.md\` bodies |
| Memory | \`memory/MEMORY.md\` (routing index) | \`memory/clusters/*.md\`, one-fact memory files |
| Knowledge | — | \`knowledge/<category>/*.md\`, indexed by \`knowledge/README.md\` |
| Projects | \`docs/portfolio-registry.md\` | \`agents/<p>.md\`, \`docs/tasks/<p>.md\`, \`runtime/<tier>/code/<p>/\` |

## Maintenance

- \`npx create-superharness add-project <name> <personal|work>\` — register a project (never by hand).
- \`npx create-superharness check\` — always-loaded tax must trend flat or down; registry/agents/boards must agree.
- A correction or a lesson → \`skills/learn\`; a bloated core → \`skills/curate\`.
`;
}

// The memory routing index — generated, not copied from templates/memory-index.md, because
// the template's example rows point at files a fresh hub doesn't have. add-project appends
// a row per project; check verifies the rows against the registry.
function memoryMd(name) {
  return `# ${name} — memory index

> Two layers: this always-loaded routing index + per-domain clusters loaded on demand.
> Hard cap: ~200 lines. Every line is a POINTER with a one-line hook — never multi-line content.
> \`superharness check\` counts this file toward the always-loaded tax.

## Project directory

<!-- projects:start -->
| Project | Current focus | Cluster | Task board |
|---|---|---|---|
<!-- projects:end -->

**Routing rule:** incoming task → match a project above → load its cluster + board, then work.
Unknown task (no clear owner) → \`docs/portfolio-registry.md\` via \`skills/route\`.

## Critical always-on rules
The reasoning primitives are in \`PHILOSOPHY.md\` and the standing rules in \`disciplines/\` — both
already injected every session. Add a line here ONLY for a project-specific rule that must fire
before the first tool call; everything else belongs in a cluster or \`knowledge/\`.

## Clusters — load on demand
One line each: what's inside, so an agent knows when to load it.
`;
}

function parseArgs(args) {
  const opts = { dir: '.', examples: false, git: true };
  for (const a of args) {
    if (a === '--with-examples') opts.examples = true;
    else if (a === '--no-git') opts.git = false;
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else opts.dir = a;
  }
  return opts;
}

module.exports = async function init(args) {
  const opts = parseArgs(args);
  const root = path.resolve(opts.dir);
  const name = path.basename(root);
  fs.mkdirSync(root, { recursive: true });

  const created = [];
  const skipped = [];
  const put = (rel, content) => (u.writeIfMissing(path.join(root, rel), content) ? created : skipped).push(rel);
  const copyDir = (rel, filter) => {
    const n = u.copyTree(path.join(u.PKG_ROOT, rel), path.join(root, rel), { filter });
    created.push(`${rel}/ (${n} files)`);
  };

  // 1. The framework itself — plain files, copied verbatim so the adopter owns and can edit them.
  put('PHILOSOPHY.md', u.read(path.join(u.PKG_ROOT, 'PHILOSOPHY.md')));
  copyDir('disciplines');
  copyDir('skills');
  copyDir('templates');
  copyDir('docs', (p, e) => e.isFile() && p.endsWith('.md') && !p.endsWith('portfolio-registry.md') && !p.endsWith('walkthrough-acme-notes.md'));
  copyDir('knowledge'); // incl. one worked example per category — knowledge/README.md links them
  put('runtime/README.md', u.read(path.join(u.PKG_ROOT, 'runtime/README.md')));
  put('runtime/worktree/README.md', u.read(path.join(u.PKG_ROOT, 'runtime/worktree/README.md')));

  // 2. Portfolio state — empty by default; the adopter's projects go in via add-project.
  let registry = u.templateBlock('project-registry.md');
  if (!opts.examples) {
    registry = registry
      .replace(/(<!-- projects:start -->\n\| Project[^\n]*\n\|[-| ]*\n)[\s\S]*?(<!-- projects:end -->)/, '$1$2')
      // the template's "delete the example rows" note has nothing to point at once they're gone
      .replace(/>\n> \*\*On adoption:\*\*[\s\S]*?\n(?=\n)/, '> Add rows with `npx create-superharness add-project <name> <tier>` — never by hand.\n');
  }
  put(u.REGISTRY, registry);
  put('memory/MEMORY.md', memoryMd(name));
  for (const d of ['agents', 'docs/tasks', 'docs/knowledge', 'memory/clusters',
    'runtime/personal/code', 'runtime/personal/data', 'runtime/work/code', 'runtime/work/data']) {
    put(`${d}/.gitkeep`, '');
  }
  if (opts.examples) {
    for (const rel of ['agents', 'docs/tasks', 'docs/knowledge', 'runtime/personal/code', 'runtime/work/code']) copyDir(rel);
    put('docs/walkthrough-acme-notes.md', u.read(path.join(u.PKG_ROOT, 'docs/walkthrough-acme-notes.md')));
    copyDir('memory', (p, e) => e.isDirectory() || e.name !== 'MEMORY.md'); // one-fact files + example clusters
    for (const r of u.parseRegistry(root).rows) created.push(...u.addMemoryRow(root, r.name));
  }

  // 3. Wiring — the hook that makes "always-loaded" literally true, and the skills mount point.
  put('CLAUDE.md', claudeMd(name));
  put('scripts/harness-prime.sh', PRIME_SH);
  fs.chmodSync(path.join(root, 'scripts/harness-prime.sh'), 0o755);
  put('.claude/settings.json', JSON.stringify(SETTINGS, null, 2) + '\n');
  const skillsLink = path.join(root, '.claude/skills');
  if (!u.exists(skillsLink)) {
    try {
      fs.symlinkSync('../skills', skillsLink, 'dir');
      created.push('.claude/skills -> ../skills');
    } catch {
      u.copyTree(path.join(u.PKG_ROOT, 'skills'), skillsLink);
      created.push('.claude/skills/ (copied; symlink unsupported)');
    }
  } else skipped.push('.claude/skills');
  put('.gitignore', GITIGNORE);
  put(u.MANIFEST, JSON.stringify({ name, superharness: require('../package.json').version, created: u.today() }, null, 2) + '\n');

  // 4. Git — a harness repo is a versioned thing; task boards and memory only work if committed.
  if (opts.git && !u.exists(path.join(root, '.git'))) {
    try {
      execSync('git init -q', { cwd: root, stdio: 'ignore' });
      created.push('.git/');
    } catch {
      skipped.push('.git/ (git not available)');
    }
  }

  // 5. Record the starting tax so `check` has a baseline to hold flat-or-down against.
  const check = require('./check');
  const tax = check.measureTax(root);
  const manifest = u.readManifest(root);
  manifest.taxBaseline = tax.total;
  u.writeManifest(root, manifest);

  // 6. First commit — an unversioned harness has no durable task state. Skipped silently when
  //    git identity isn't configured or the repo already has history.
  if (opts.git && created.includes('.git/')) {
    try {
      execSync('git add -A && git commit -q -m "superharness init"', { cwd: root, stdio: 'ignore' });
      created.push('initial commit');
    } catch {
      skipped.push('initial commit (configure git user.name/user.email, then commit)');
    }
  }

  u.log(`Harness "${name}" ready at ${root}\n`);
  u.log('Created:');
  for (const c of created) u.log(`  + ${c}`);
  if (skipped.length) {
    u.log('Kept (already existed):');
    for (const s of skipped) u.log(`  = ${s}`);
  }
  u.log(`\nAlways-loaded tax: ${tax.total} bytes (baseline recorded in ${u.MANIFEST})`);
  u.log(`
Next:
  cd ${opts.dir === '.' ? '.' : opts.dir}
  npx create-superharness add-project <name> <personal|work>   # register your first runtime project
  npx create-superharness check                                  # drift + tax gate (add to CI / pre-commit)
  claude                                              # PHILOSOPHY + disciplines load on SessionStart
`);
};
