'use strict';

// Mechanical form of skills/onboard-project: the four files that must exist TOGETHER for a
// project to be routable — runtime dir, registry row, agent definition, task board.

const path = require('path');
const u = require('./util');

module.exports = async function addProject(args) {
  const [name, tier, type] = args;
  if (!name || !tier) u.fail('usage: superharness add-project <name> <personal|work> [type]');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) u.fail(`project name must be kebab-case, got "${name}"`);
  if (!u.TIERS.includes(tier)) u.fail(`tier must be one of ${u.TIERS.join('|')}, got "${tier}" — the tier decides git/review/deploy policy, so it is never guessed`);

  const root = u.requireRoot();
  const reg = u.parseRegistry(root);
  if (reg.text == null) u.fail(`${u.REGISTRY} missing — run \`npm create superharness\` first`);
  if (reg.noMarkers) u.fail(`${u.REGISTRY} has no <!-- projects:start/end --> markers; add-project cannot place the row`);
  if (reg.rows.some((r) => r.name === name)) u.fail(`"${name}" is already registered — this command creates, it does not re-onboard`);
  if (u.exists(path.join(root, `agents/${name}.md`))) u.fail(`agents/${name}.md already exists`);

  const created = [];

  // Runtime directory — NOT git-initialised: the project's own repo is a separate concern.
  const runtimeDir = `runtime/${tier}/code/${name}`;
  u.write(path.join(root, runtimeDir, '.gitkeep'), '');
  created.push(`${runtimeDir}/`);

  // Registry row, INSIDE the markers — a row outside them is invisible to route/triage.
  const row = `| \`${name}\` | ${tier} | (placeholder — fill in) | ${name}${type ? `, ${type}` : ''} (placeholders) |\n`;
  u.write(reg.file, reg.text.replace('<!-- projects:end -->', row + '<!-- projects:end -->'));
  created.push(`${u.REGISTRY} (row)`);

  // Agent definition from the template — Tier / Repo / Stack filled, scope left for a human.
  const agent = u.templateBlock('agent-definition.md')
    .replace(/<project-name>/g, name)
    .replace('<personal | work>', tier)
    .replace('<path or URL>', `${runtimeDir}/`)
    .replace('<language / framework>', type || '<language / framework>')
    .replace(/<project>/g, name);
  u.write(path.join(root, `agents/${name}.md`), agent);
  created.push(`agents/${name}.md`);

  // Task board — empty but structurally complete; every discipline assumes it exists.
  const board = u.templateBlock('task-board.md')
    .replace(/<project-name>/g, name)
    .replace('<YYYY-MM-DD>', u.today())
    .replace(/^- \[[ x]\] <task>.*\n(  - \*\*.*\n)*/gm, '');
  u.write(path.join(root, `docs/tasks/${name}.md`), board);
  created.push(`docs/tasks/${name}.md`);

  created.push(...u.addMemoryRow(root, name));

  // The memory row is deliberate structural growth of the always-loaded index (one line per
  // project, by design) — raise the tax baseline by exactly that, so `check` still catches
  // everything else that creeps in.
  const { measureTax } = require('./check');
  const manifest = u.readManifest(root);
  const tax = measureTax(root).total;
  const delta = typeof manifest.taxBaseline === 'number' ? tax - manifest.taxBaseline : 0;
  if (delta > 0) {
    manifest.taxBaseline = tax;
    u.writeManifest(root, manifest);
    created.push(`${u.MANIFEST} (tax baseline +${delta} bytes for the memory row)`);
  }

  u.log(`Registered "${name}" (${tier}-tier${tier === 'work' ? ': feature branch + PR + review gate' : ': commit direct to main'})\n`);
  for (const c of created) u.log(`  + ${c}`);
  u.log(`
Left as placeholders — fill in before the first dispatch:
  ${u.REGISTRY}   responsibilities + requirement keywords (route depends on these being specific)
  agents/${name}.md   Role / Scope / Conventions / Definition of done
Then put the project's own repo in ${runtimeDir}/ (clone or move; it stays out of this history).
`);
};
