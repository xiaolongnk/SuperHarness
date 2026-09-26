// acme-web (EXAMPLE) — illustrative stub only, not a working build.
// A real acme-web would be a React app; this file exists to give the work-tier
// example project a source file to route commits against. See README.md.

function renderDashboard(reports) {
  return reports.map((r) => `${r.title}: ${r.value}`).join("\n");
}

module.exports = { renderDashboard };
