'use strict';
// EXAMPLE — the bulk-import path from the acme-notes walkthrough. Fictional, minimal.

const { rebuildIndex } = require('./search');

// Import notes in one transaction and rebuild the derived index INSIDE it. The 2026-02-14
// incident was this function without the rebuildIndex call: notes landed in notes.db, search
// stayed stale, and every direct read looked fine.
function importNotes(db, rows) {
  return db.transaction(() => {
    for (const r of rows) db.run('INSERT INTO notes (title, body) VALUES (?, ?)', [r.title, r.body]);
    rebuildIndex(db);
    return rows.length;
  });
}

module.exports = { importNotes };
