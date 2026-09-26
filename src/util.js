'use strict';

const fs = require('fs');
const path = require('path');

// The package root — where PHILOSOPHY.md, disciplines/, skills/, templates/ ship from.
const PKG_ROOT = path.resolve(__dirname, '..');

const REGISTRY = 'docs/portfolio-registry.md';
const MANIFEST = 'harness.json';
const TIERS = ['personal', 'work'];

function fail(msg) {
  process.stderr.write(`superharness: ${msg}\n`);
  process.exit(1);
}

function log(msg) {
  process.stdout.write(msg + '\n');
}

function exists(p) {
  return fs.existsSync(p);
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

// Write only if the target doesn't exist — `init` must be safe to re-run on an adopted repo.
function writeIfMissing(p, content) {
  if (exists(p)) return false;
  write(p, content);
  return true;
}

function copyTree(src, dst, { filter } = {}) {
  let n = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (filter && !filter(s, entry)) continue;
    if (entry.isDirectory()) {
      n += copyTree(s, d, { filter });
    } else if (!exists(d)) {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
      n++;
    }
  }
  return n;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Extract the ```markdown fenced block from a template file — templates/*.md wrap the
// copy-paste starting point in a fence and surround it with rationale.
function templateBlock(name) {
  const text = read(path.join(PKG_ROOT, 'templates', name));
  const m = text.match(/```markdown\n([\s\S]*?)\n```/);
  if (!m) throw new Error(`templates/${name} has no \`\`\`markdown block`);
  return m[1] + '\n';
}

// Find the harness root: nearest ancestor holding harness.json (or the registry).
function findRoot(start = process.cwd()) {
  let dir = start;
  for (;;) {
    if (exists(path.join(dir, MANIFEST)) || exists(path.join(dir, REGISTRY))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function requireRoot() {
  const root = findRoot();
  if (!root) fail(`not inside a harness repo (no ${MANIFEST} or ${REGISTRY} found). Run \`npm create superharness .\` first.`);
  return root;
}

// Parse the machine-read block of the registry: rows between <!-- projects:start/end -->.
function parseRegistry(root) {
  const file = path.join(root, REGISTRY);
  if (!exists(file)) return { file, rows: [], text: null };
  const text = read(file);
  const m = text.match(/<!-- projects:start -->([\s\S]*?)<!-- projects:end -->/);
  if (!m) return { file, rows: [], text, noMarkers: true };
  const rows = [];
  for (const line of m[1].split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const name = cells[0].replace(/`/g, '');
    if (name === 'Project' || /^-+$/.test(name)) continue;
    rows.push({ name, tier: cells[1], responsibilities: cells[2] || '', keywords: cells[3] || '' });
  }
  return { file, rows, text };
}

// Add a project's routing row to memory/MEMORY.md and stub its cluster — the memory index
// must never disagree with the registry about which projects exist (check enforces it).
function addMemoryRow(root, name) {
  const memFile = path.join(root, 'memory/MEMORY.md');
  const out = [];
  if (!exists(memFile)) return out;
  const mem = read(memFile);
  if (mem.includes('<!-- projects:end -->') && !mem.includes(`| \`${name}\` |`)) {
    const row = `| \`${name}\` | (fill in) | [cluster](clusters/${name}.md) | [board](../docs/tasks/${name}.md) |\n`;
    write(memFile, mem.replace('<!-- projects:end -->', row + '<!-- projects:end -->'));
    out.push('memory/MEMORY.md (row)');
  }
  if (writeIfMissing(path.join(root, `memory/clusters/${name}.md`),
    `# ${name} — memory cluster\n\nLoaded only when a task routes to \`${name}\`. Facts that change decisions here:\nbuild/test quirks, deploy steps, conventions the agent definition doesn't cover.\n`)) {
    out.push(`memory/clusters/${name}.md`);
  }
  return out;
}

function readManifest(root) {
  const p = path.join(root, MANIFEST);
  return exists(p) ? JSON.parse(read(p)) : {};
}

function writeManifest(root, data) {
  write(path.join(root, MANIFEST), JSON.stringify(data, null, 2) + '\n');
}

module.exports = {
  PKG_ROOT, REGISTRY, MANIFEST, TIERS,
  fail, log, exists, read, write, writeIfMissing, copyTree, today, templateBlock,
  findRoot, requireRoot, parseRegistry, addMemoryRow, readManifest, writeManifest,
};
