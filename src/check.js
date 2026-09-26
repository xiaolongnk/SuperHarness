'use strict';

// The two things docs/architecture.md and disciplines/self-improvement-loop.md promise but
// prose cannot enforce:
//   1. the always-loaded tax trends FLAT OR DOWN (the library may grow without limit);
//   2. registry / agents / task boards / runtime dirs agree — a project missing any one
//      of them is a partial state that misroutes the next requirement.
// Exit 1 on any finding so this can gate CI or a pre-commit hook.

const fs = require('fs');
const path = require('path');
const u = require('./util');

// What a session actually pays before any routing happens — measured against the real
// loading surface, not the architecture diagram: CLAUDE.md is read by the agent CLI, the
// next three are what scripts/harness-prime.sh injects, and every skill's `description:`
// is loaded by the CLI so it can decide when to invoke the skill. skills/README.md and
// knowledge/README.md are human indexes read on demand; they are NOT counted.
const ALWAYS_LOADED = [
  'CLAUDE.md',
  'PHILOSOPHY.md',
  'disciplines/README.md',
  'memory/MEMORY.md',
];

const BOARD_SECTIONS = ['Now', 'Next', 'Parked', 'Recently shipped'];
const SKILL_FIELDS = ['name', 'description', 'domains', 'tier'];

function measureTax(root) {
  const files = [];
  let total = 0;
  for (const rel of ALWAYS_LOADED) {
    const p = path.join(root, rel);
    if (!u.exists(p)) continue;
    const bytes = fs.statSync(p).size;
    files.push({ rel, bytes });
    total += bytes;
  }
  const skillsDir = path.join(root, 'skills');
  if (u.exists(skillsDir)) {
    let bytes = 0;
    for (const d of fs.readdirSync(skillsDir)) {
      const skill = path.join(skillsDir, d, 'SKILL.md');
      if (!u.exists(skill)) continue;
      const m = u.read(skill).match(/^description:\s*(.*)$/m);
      if (m) bytes += Buffer.byteLength(m[1]);
    }
    files.push({ rel: 'skills/*/SKILL.md description: lines', bytes });
    total += bytes;
  }
  return { files, total };
}

function listMd(dir) {
  if (!u.exists(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => f.slice(0, -3));
}

function checkDrift(root) {
  const findings = [];
  const reg = u.parseRegistry(root);
  if (reg.text == null) return [`${u.REGISTRY} missing`];
  if (reg.noMarkers) return [`${u.REGISTRY} has no <!-- projects:start/end --> markers`];

  const registered = new Set();
  for (const r of reg.rows) {
    registered.add(r.name);
    if (!u.TIERS.includes(r.tier)) findings.push(`registry: "${r.name}" has tier "${r.tier}" (expected ${u.TIERS.join('|')})`);
    if (!u.exists(path.join(root, `agents/${r.name}.md`))) findings.push(`registry: "${r.name}" has no agents/${r.name}.md`);
    const board = path.join(root, `docs/tasks/${r.name}.md`);
    if (!u.exists(board)) findings.push(`registry: "${r.name}" has no docs/tasks/${r.name}.md`);
    else {
      const text = u.read(board);
      for (const s of BOARD_SECTIONS) {
        if (!new RegExp(`^## .*${s}`, 'm').test(text)) findings.push(`docs/tasks/${r.name}.md: missing "## ${s}" section`);
      }
    }
    if (u.TIERS.includes(r.tier) && !u.exists(path.join(root, `runtime/${r.tier}/code/${r.name}`))) {
      findings.push(`registry: "${r.name}" has no runtime/${r.tier}/code/${r.name}/`);
    }
  }
  for (const a of listMd(path.join(root, 'agents'))) {
    if (!registered.has(a)) findings.push(`agents/${a}.md has no registry row — nothing will ever route here`);
  }
  for (const b of listMd(path.join(root, 'docs/tasks'))) {
    if (!registered.has(b)) findings.push(`docs/tasks/${b}.md has no registry row`);
  }

  // Memory index: its project rows must be registry projects, and their clusters must exist.
  const memFile = path.join(root, 'memory/MEMORY.md');
  if (u.exists(memFile)) {
    const m = u.read(memFile).match(/<!-- projects:start -->([\s\S]*?)<!-- projects:end -->/);
    if (m) {
      const inMemory = new Set();
      for (const line of m[1].split('\n')) {
        const cells = line.split('|').slice(1, -1).map((c) => c.trim());
        const name = (cells[0] || '').replace(/`/g, '');
        if (!line.startsWith('|') || name === 'Project' || /^-+$/.test(name) || !name) continue;
        inMemory.add(name);
        if (!registered.has(name)) findings.push(`memory/MEMORY.md: "${name}" is not in the registry`);
        if (!u.exists(path.join(root, `memory/clusters/${name}.md`))) findings.push(`memory/MEMORY.md: "${name}" points at a missing memory/clusters/${name}.md`);
      }
      for (const r of reg.rows) {
        if (!inMemory.has(r.name)) findings.push(`memory/MEMORY.md: registry project "${r.name}" has no routing row`);
      }
    }
  }

  // Skills: every skill declares the routing frontmatter and is reachable from the index.
  const skillsDir = path.join(root, 'skills');
  if (u.exists(skillsDir)) {
    const index = u.exists(path.join(skillsDir, 'README.md')) ? u.read(path.join(skillsDir, 'README.md')) : '';
    for (const d of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const skill = path.join(skillsDir, d.name, 'SKILL.md');
      if (!u.exists(skill)) { findings.push(`skills/${d.name}/ has no SKILL.md`); continue; }
      const fm = (u.read(skill).match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
      for (const f of SKILL_FIELDS) {
        if (!new RegExp(`^${f}:`, 'm').test(fm)) findings.push(`skills/${d.name}/SKILL.md: frontmatter missing "${f}:"`);
      }
      if (index && !index.includes(`${d.name}/SKILL.md`)) findings.push(`skills/README.md does not index skills/${d.name}`);
    }
  }
  // Knowledge: every entry is reachable from the archive index, or nobody will ever find it.
  const knowledgeDir = path.join(root, 'knowledge');
  if (u.exists(path.join(knowledgeDir, 'README.md'))) {
    const index = u.read(path.join(knowledgeDir, 'README.md'));
    for (const cat of fs.readdirSync(knowledgeDir, { withFileTypes: true })) {
      if (!cat.isDirectory()) continue;
      for (const f of fs.readdirSync(path.join(knowledgeDir, cat.name))) {
        if (f.endsWith('.md') && !index.includes(`${cat.name}/${f}`)) findings.push(`knowledge/README.md does not link knowledge/${cat.name}/${f}`);
      }
    }
  }

  // Links: every relative markdown link resolves. templates/ is exempt (its links are
  // illustrations of a shape); fenced code blocks and <placeholder> targets are skipped.
  findings.push(...checkLinks(root));
  return findings;
}

const LINK_SKIP_DIRS = new Set(['.git', 'node_modules', 'templates', 'runtime', 'tmp']);

function mdFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) { if (!LINK_SKIP_DIRS.has(e.name) && !e.name.startsWith('.')) mdFiles(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.md')) out.push(path.join(dir, e.name));
  }
  return out;
}

function checkLinks(root) {
  const findings = [];
  for (const file of mdFiles(root)) {
    const text = u.read(file).replace(/```[\s\S]*?```/g, '');
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = m[1].split('#')[0];
      if (!target || /^[a-z]+:/.test(target) || target.includes('<')) continue;
      if (!u.exists(path.resolve(path.dirname(file), target))) {
        findings.push(`${path.relative(root, file)}: broken link → ${m[1]}`);
      }
    }
  }
  return findings;
}

module.exports = async function check(args) {
  const updateBaseline = args.includes('--update-baseline');
  const root = u.requireRoot();
  const manifest = u.readManifest(root);
  const tax = measureTax(root);
  const findings = checkDrift(root);

  u.log('Always-loaded tax:');
  for (const f of tax.files) u.log(`  ${String(f.bytes).padStart(7)}  ${f.rel}`);
  const baseline = manifest.taxBaseline;
  let taxLine = `  ${String(tax.total).padStart(7)}  total`;
  if (typeof baseline === 'number') {
    const delta = tax.total - baseline;
    taxLine += `  (baseline ${baseline}, ${delta >= 0 ? '+' : ''}${delta})`;
    if (delta > 0 && !updateBaseline) {
      findings.push(`always-loaded tax grew ${delta} bytes over baseline — relocate content to the on-demand library (skills/curate), or run \`superharness check --update-baseline\` if the growth is deliberate`);
    }
  }
  u.log(taxLine + '\n');

  if (updateBaseline) {
    manifest.taxBaseline = tax.total;
    u.writeManifest(root, manifest);
    u.log(`Baseline updated to ${tax.total} bytes.\n`);
  }

  if (findings.length === 0) {
    u.log(`OK — ${u.parseRegistry(root).rows.length} project(s), no drift.`);
    return;
  }
  u.log(`${findings.length} finding(s):`);
  for (const f of findings) u.log(`  ✗ ${f}`);
  process.exitCode = 1;
};

module.exports.measureTax = measureTax;
module.exports.checkDrift = checkDrift;
