'use strict';

// Print the always-loaded core. The scaffold wires the equivalent shell one-liner
// (scripts/harness-prime.sh) as a SessionStart hook; this is the same thing for callers
// that have the CLI.

const path = require('path');
const u = require('./util');

module.exports = async function prime() {
  const root = u.requireRoot();
  for (const rel of ['PHILOSOPHY.md', 'disciplines/README.md', 'memory/MEMORY.md']) {
    const p = path.join(root, rel);
    if (u.exists(p)) process.stdout.write(u.read(p) + '\n');
  }
};
