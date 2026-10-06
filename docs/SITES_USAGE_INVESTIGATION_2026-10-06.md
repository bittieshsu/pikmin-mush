# Sites usage investigation — 2026-10-06

## Scope and evidence boundaries

User authorized continued diagnosis, testing and correction after the initial
read-only review. Preserve authentication, scan allocation, safety guards,
manual pauses, upload offsets, pending ACKs, notifier scheduling and public
freshness. Do not infer the Sites quota formula from request counts. Do not
delete history to make a metric smaller.

Production baseline: Sites v101, source
`8aa80512f4b26d4f9fda455062db709cf33c3555`, deployment succeeded at
2026-10-05 16:01:40 UTC. Its tree is exactly GitHub
`4c624cef896148f15d4a64218677be2dfb7ea503:site`:
`6174a1ba60d15902b2bab604d04cfa56598ba0de`.
The source SHA is a release-mirror merge, not a GitHub commit.
v101 archive 5,898,240 bytes / 85 files; v100 5,908,480 / 85.
This rules out a large increase in this release archive, not database growth
or aggregate Sites usage.

Four enabled agents had recent accepted data; Libra was disabled. Actual
phone script content matches `30d1435` for Aries/Cancer and `ef377d5` for
Leo/Scorpio. This does not establish continuous month-long uptime.

## Confirmed baseline defects

1. Primary polls legacy `/api/agent/command` each outer iteration with its
   individual credential. The legacy route requires runtime AGENT_TOKEN;
   fleet v2 accepts the individual hash. A bounded error sample from
   2026-10-06 13:09–13:53 Asia/Taipei contained 55 command 401s. It is not
   an error-rate denominator. Rejected legacy requests exit before D1 work.
2. A valid control invokes touchAgent twice, each issuing an UPDATE and a
   sampled heartbeat INSERT SELECT. Authentication/job reads plus renewal
   give seven explicit SQL operations before initialization overhead. The
   correction removes two operations, not a promised percentage of rows
   written or Sites quota. Pause/stop keep presence, and stale leases must
   not overwrite the Agent's current assignment.
3. Upload writes rows and counters before touchAgent; a late error can cause
   retry from the same phone offset. Observation keys include server receipt
   seconds, so a replay in a later second can add history. The client rebuilds
   its chunk on retry and can include new rows: a body hash alone does not
   solve overlapping replay. A particular Scorpio 12:13 error has not yet
   been reconciled to duplicate production records.

## Measurements (bounded samples, not monthly estimates)

The 13:53:15–13:55:07 request sample reached its 100-event limit. Deduplicated
request IDs gave 97 requests. Control intervals: Aries median 6.472s (10),
Cancer 6.466s (16), Leo 6.386s (12), Scorpio 6.212s (10). The phone's 2s
outer sleep is not the aggregate active scan request interval. Idle windows
still need measurement without forcing a pause.

Existing public_map_read traces, all on 2026-10-06 Asia/Taipei:

| Time | Cache | Returned | Recorded rows_read | Duration |
| --- | --- | --- | --- | --- |
| 13:53:29 | BYPASS | 1000 | 38303 | 207ms |
| 13:53:50 | MISS | 18 | 7174 | 1061ms |
| 13:59:02 | MISS | 51 | 7213 | 1087ms |

Recorded SELECT rows_written were zero. These are not whole-request totals
or table counts. The trace samples normal requests at 5% and always retains
slow/error requests, so this sample cannot establish HIT percentage.
Issue95 cursor pagination, named cache, bounded memory fallback and hidden
page suppression already exist. Keep notifier/authenticated reads uncached.

Retention last succeeded 13:47:09, pending=0, failures=0, duration=1003ms,
192 observations deleted, batch not saturated. Pending describes eligible
mushrooms, not a count of all historical tables or their physical size.

## Rollout and acceptance

- Independent commits: legacy opt-in, control touch coalescing, and the
  production source-map-js advisory patch discovered by the release audit.
  That dependency advisory is not evidence for the usage notification cause.
- Local behavioral tests cover run/pause/stop/invalid lease/unauthorized,
  12-minute renewal, unchanged version reporting and one presence update.
- Canary the minimal legacy change on Aries's current script; do not install
  unrelated visual-recovery changes onto an older phone script. Preserve its
  original script, config, token, pending ACK and offset. No game reboot is
  needed for this shell-only change. Verify object capture, accepted upload
  and completed target after service restart, not just PID/heartbeat.
- Control release acceptance uses natural fleet requests: same endpoint
  interval, successful uploads/ACKs, no new 401/500 loop. Local SQL-operation
  reduction is separate from production D1 row-cost measurement.
- Rollback: original phone script and service restart; forward corrective
  website release retaining all migrations/data. No data deletion.

## Remaining work and stop conditions

### 2026-10-06 follow-up implementation (not production acceptance)

PR129 is live as Sites v102, GitHub main `6de93aad`, release source
`3c904e37ada8377090a5a6867d2e30748f239489`, deployment succeeded
2026-10-06 06:35:00 UTC. Latest bounded sample 06:56:36–06:57:18 UTC:
44 distinct requests, all 200 (control18/upload9/mushrooms8/ACK5/task4),
no legacy command. This is neither a monthly error rate nor a quota attribution.

The next independent changes implement opt-in receipts and phone immutable
pending batches; see [UPLOAD_RECEIPTS.md](UPLOAD_RECEIPTS.md). The real local
D1 transaction test plus route fault injection and full site suite passed
92 tests. Phone receipt/chunk/power integration/legacy opt-in checks passed,
lint passed, production audit zero vulnerabilities. An additional standalone
`tsc --noEmit` check reports missing Worker binding declarations and broad
strict-type errors; it is not recorded as a passing gate. Existing release
gates are build/test/audit/CI; live receipt-path acceptance is still required.

Receipts remain canary-only and are not expired until acknowledged-stream
compaction can preserve offline retry safety. Measure their growth and the
100-line chunk impact before fleet activation. Do not delete receipt history
blindly as a usage fix. No production receipt upload was injected for tests.

1. Reconcile the upload retry incident; implement an immutable persisted
   pending chunk and an authenticated receipt identity including stream
   generation and byte range. Plan transactional/recoverable server receipts,
   preserve original acceptance time and counters, reject mismatched replays,
   and test response loss/restart/partial failure. Retain unsent chunks after
   bounded exponential backoff; never silently discard retries.
2. Collect complete active and natural-idle request windows, cache hit/bypass
   denominators, D1 query cost, table counts, oldest/newest times, daily growth
   and physical capacity. Current native DB tools only provide limited rows.
   Browser tooling failed to initialize; no analytics totals were independently
   refreshed. Do not approximate whole-table counts from limited pages.
3. Resolve the 10:04 50% and 10:15 80% notices only with a matching platform
   usage time series and quota definition. Until available, label delayed
   accounting/burst/storage attribution as hypotheses, not a root cause.
4. Continue bounded monitoring; notify meaningful regressions or completion,
   not every unchanged sample. Do not claim the quota incident solved solely
   because code tests or a deployment succeeded.
