# D1 target-materialization capacity measurement — task handoff

Updated: 2026-08-20 (Asia/Taipei)
Repository: `https://github.com/odyliao-lab/pikmin-mush`
Production: `https://mush.odyliao.cc`

## 1. Why this task exists

`CLAUDE_SITES_DEPLOY_HANDOFF_2026-08-20.md` §4 and §9 flag the same open
risk: PR #44 raised the per-task target limit from 10,000 to 30,000 and
widened `radiusKm` (2 km → 8 km) with `gridStepM` 600 m → 350 m, which can
produce roughly 2,116 points for a single city instead of ~49. Nobody has
measured how long `materializeTargets()` (`site/lib/targets.ts`) actually
takes against production D1 when a task approaches the new 30,000-point
ceiling. This document is the task spec for that measurement, written so it
can be handed to a fresh Codex session without further back-and-forth.

## 2. What to measure

`materializeTargets()` batches 7 target rows per `INSERT` and 50 statements
per `db.batch()` call. A task at the 30,000-point ceiling therefore issues
approximately:

- 4,286 `INSERT` statements, grouped into
- 86 sequential `db.batch()` round trips to D1.

Cloudflare Workers have execution-time limits that this has never been
tested against at this scale. The question to answer: **how long does a
~30,000-point (or as close to it as a real country-pack selection allows)
`materializeTargets()` call actually take against production D1, and does it
complete without hitting a Worker timeout or partial-write failure?**

## 3. Suggested approach (pick whichever fits the Codex environment best)

### Option A — time a real admin-triggered job

`POST /api/admin/scans/start` calls `materializeTargets()` synchronously
before returning its HTTP response, so the request's wall-clock time *is*
the materialization time (plus the cheap `buildScanPlan()` call before it,
which is pure in-memory computation and negligible by comparison).

1. In `mush.odyliao.cc/admin`, use country-pack selection plus the existing
   `estimate` panel to assemble a job close to 30,000 points (the "全選全世界"
   button will vastly overshoot it at the current `radiusKm=8`; pick a
   handful of packs instead and watch the point estimate).
2. Trigger the job and record how long the create call takes to return
   (browser network tab, or server-side timing — see Option B).
3. Confirm `scan_jobs.total_points` matches the estimate and that
   `scan_targets` actually has that many rows (a stuck/partial materialize
   would show a mismatch).

### Option B — temporary timing instrumentation

If Option A's request timing is inconvenient to capture directly, add
temporary instrumentation around the batching loop in
`site/lib/targets.ts`, e.g. wrapping the `for` loop with
`const startedAt = Date.now();` and logging
`console.log(\`[materialize] job=\${jobId} targets=\${targets.length} batches=\${batchCount} ms=\${Date.now() - startedAt}\`)`
after the final `db.batch()` call, then read the timing from Cloudflare
Worker logs (`wrangler tail` or the dashboard) after triggering a real job.
Remove the instrumentation (or gate it behind a debug flag) once the
measurement is recorded — don't leave ad hoc `console.log` in the
production path.

### Option C — isolated script against the same D1 binding

If there's a supported way to run a one-off script against the deployed
Worker's actual D1 database (not a local/miniflare simulation — the whole
point is production network-latency characteristics), synthesize a ~30,000
row target list and call `materializeTargets()`-equivalent logic directly,
timing it the same way as Option B. Only use this if it exercises the same
D1 binding as production; a local D1 emulation will not answer the actual
question.

## 4. What to record

Append a dated entry to `WORKLOG.md` with:

- Which option was used and the exact job size (point count, country packs
  selected, `radiusKm`/`gridStepM` used).
- Total wall-clock duration of `materializeTargets()`.
- Number of `db.batch()` calls observed and whether any errored, retried, or
  the job ended up partially materialized (`scan_targets` row count vs
  `scan_jobs.total_points`).
- Whether the run got anywhere near a Worker execution-time limit (if
  Cloudflare surfaces CPU time or wall time per invocation in logs/dashboard,
  capture that number).

## 5. What to do with the result

- **If comfortably fast and no partial-write risk observed**: no code change
  needed; note the headroom in `WORKLOG.md` and close this out.
- **If slow, close to a timeout, or any partial-write risk observed**:
  per `CLAUDE_SITES_DEPLOY_HANDOFF_2026-08-20.md` §4, implement resumable/
  asynchronous materialization — persist job progress, create targets in
  bounded chunks across multiple invocations (e.g. a queue/cron-driven
  continuation, or chunked client-triggered continuation calls), report
  duration/failure metrics, and make retries idempotent (the existing
  `INSERT OR IGNORE` already makes individual rows idempotent; the gap is
  resuming a partially-materialized job cleanly, not re-doing full inserts).
  This is real design work — don't half-implement it; either ship a
  complete resumable path or leave the current synchronous one in place with
  the measured limit documented as the practical job-size ceiling.

## 6. Process reminders (per the standing rules for this repo)

- Any code change (instrumentation or resumable materialization) goes
  through a feature branch → GitHub PR → tests → merge, same as PR #44/#45.
- Do not request, paste, persist, or share the Sites source credential
  anywhere in this process.
- Do not reintroduce a distance-based cooldown in `site/lib/fleet.ts` or
  `site/lib/scan-plans.ts` while touching this code — that's an unrelated,
  already-settled fix from PR #45.
- Actual Sites deployment (if a code change results from this task) is
  performed by an authenticated Codex Sites session, not Claude Code —
  see `CLAUDE_SITES_DEPLOY_HANDOFF_2026-08-20.md` §5.
