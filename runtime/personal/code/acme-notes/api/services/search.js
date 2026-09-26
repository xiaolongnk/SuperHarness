'use strict';
// EXAMPLE — the search service the acme-notes walkthrough refers to. Fictional, minimal.

// Rebuild search.idx from notes.db in full. Called inside the caller's transaction so the
// index commits or rolls back together with the notes that changed (see
// knowledge/incidents/search-stale-after-import-2026-02-14.md).
function rebuildIndex(db) {
  const notes = db.all('SELECT id, title, body FROM notes');
  db.run('DELETE FROM search_idx');
  for (const n of notes) db.run('INSERT INTO search_idx (id, text) VALUES (?, ?)', [n.id, `${n.title}\n${n.body}`]);
  return notes.length;
}

function search(db, query) {
  return db.all('SELECT id FROM search_idx WHERE text LIKE ?', [`%${query}%`]);
}

module.exports = { rebuildIndex, search };
