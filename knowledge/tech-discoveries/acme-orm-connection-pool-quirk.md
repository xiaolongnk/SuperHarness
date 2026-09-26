# ORM connection pool silently caps at 5 regardless of configured max

**Date**: 2026-05-28
**Tech**: acme-notes's ORM layer (Postgres pool)
**Context**: diagnosing slow API responses under concurrent load

## Discovery

Setting the ORM's `pool.max` config to a higher value (e.g. 20) had no effect on actual
concurrent connections — the driver underneath silently capped at 5 because a separate,
lower-level "statement cache" setting defaulted to a pool of its own that the ORM's pool
config didn't override. The ORM's documented `pool.max` only bounds its own wrapper; the
driver-level default wins whenever it's lower.

## Why It Matters

Under load, requests queued waiting for a connection well before the configured pool
limit was reached, and every dashboard reporting "pool utilization" read from the ORM's
own counters — which looked healthy (well under 20) while the real driver-level pool was
saturated. Without knowing about the separate cap, the natural next step (raise pool.max
further) would have done nothing.

## Example

```
# looked correct, had no effect on the real ceiling:
pool: { max: 20 }

# the actual fix — set the driver-level cap explicitly:
driver: { statementCacheSize: 20, poolSize: 20 }
```

Always confirm a pool/connection-limit setting against the actual lower-level driver, not
just the ORM's wrapper config — check for a second, independently-defaulted cap before
assuming the top-level setting is authoritative.
