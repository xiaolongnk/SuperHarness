# acme-api (EXAMPLE)

> **This is a fictional example project**, shipped with the framework so a fresh clone has a
> real, work-tier project to route work against — see
> [`runtime/README.md`](../../../README.md) for why this exists and how to replace it with
> your own projects.

A stub for a backend API + job queue maintained by a multi-person team — public REST
endpoints, async export/report jobs, auth. This directory holds a single illustrative stub
file (`main.go`), not a working build; the point is to demonstrate the work-tier layout
(registry row, agent definition, task board), not to ship a real backend.

## Why this is work tier

Multiple maintainers, real coordination cost — see [`docs/portfolio.md`](../../../../docs/portfolio.md)
§2 for the tier model. Changes here go through a feature branch and a PR, never straight to
`main`. See [`agents/acme-api.md`](../../../../agents/acme-api.md) for the full agent
definition and [`docs/tasks/acme-api.md`](../../../../docs/tasks/acme-api.md) for the task
board.
