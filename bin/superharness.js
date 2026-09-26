#!/usr/bin/env node
'use strict';

const path = require('path');
const { fail } = require('../src/util');

const COMMANDS = {
  init: 'src/init',
  'add-project': 'src/add-project',
  check: 'src/check',
  prime: 'src/prime',
};

const USAGE = `superharness — scaffold and maintain an agent-harness repo

Usage (also: npm create superharness <dir>  /  npx create-superharness <command>):
  superharness init [dir] [--with-examples] [--no-git]
      Create a new harness repo (or adopt the current directory).
  superharness add-project <name> <personal|work> [type]
      Register a runtime project: runtime dir, registry row, agent definition, task board.
  superharness check [--update-baseline]
      Measure the always-loaded tax and detect registry/agent/board drift. Exits 1 on drift.
  superharness prime
      Print the always-loaded core (PHILOSOPHY + discipline index). Wired as a SessionStart hook.

Docs: https://github.com/xiaolongnk/SuperHarness
`;

// A closed pipe (`... | head`) is not an error worth a stack trace.
process.stdout.on('error', (e) => { if (e.code === 'EPIPE') process.exit(0); throw e; });

let [cmd, ...args] = process.argv.slice(2);
// Invoked as `create-superharness` (via `npm create superharness <dir>`), a bare directory or
// nothing means init. Invoked as `superharness`, an unknown word stays an error — a typo must
// not scaffold a directory.
if (path.basename(process.argv[1]).startsWith('create-') && (cmd === undefined || (!COMMANDS[cmd] && !cmd.startsWith('-') && cmd !== 'help'))) {
  if (cmd !== undefined) args = [cmd, ...args];
  cmd = 'init';
}

if (!cmd || cmd === '-h' || cmd === '--help' || cmd === 'help') {
  process.stdout.write(USAGE);
  process.exit(0);
}
if (cmd === '-v' || cmd === '--version') {
  process.stdout.write(require('../package.json').version + '\n');
  process.exit(0);
}
if (!COMMANDS[cmd]) fail(`unknown command "${cmd}"\n\n${USAGE}`);

Promise.resolve(require('../' + COMMANDS[cmd])(args)).catch((err) => fail(err.message || String(err)));
