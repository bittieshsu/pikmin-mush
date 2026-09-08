# Exact verification evidence: 2026-09-08 checkpoint

The scheduled 10:30 inspection found a reader-side gap after the v77 freshness
work. The controller verification GET still approved a completed target using
the mutable mushroom last_seen timestamp. An upload from another target/agent
could therefore be counted as this recheck. The new regression executes the
actual route against SQLite: before the fix, it incorrectly returned eligible
with no target observation at all.

## Repair

The report reader now requires an observation matching the completed target,
completing agent, location, current challenge start, level/type and current
participant count/capacity, received within the recorded lease/completion
interval. Second-resolution timestamps conservatively exclude the ambiguous
first partial second. It also requires the requested level (3 for candidates,
4 for giant rechecks), a valid under-five count and an unexpired challenge.
It returns verified_at only when that receipt exists. Unknown evidence does not
become a successful empty map or a successful recheck.

No schedule, phone script, native code, route allocation, Discord replay or DB
migration is part of this repair. Old reports are not reconstructed. Same-start
unresolved game identities and physical capture freshness remain limitations of
the existing observation model; a receipt is not proof of later slot availability.
The legacy giant-recheck invalidation writer is not used by scheduled giant
reports and is not claimed to be upgraded by this reader-side change.

## Observation checkpoint

- Sites v78 / main a83b132 were current before this repair.
- History v2: 14.8809 hours from 2026-09-07 19:40:15 Taipei; orphan observations
  and events both zero; canary_ready false. A real cycle-0 job 191 target archive
  exists, sampled after queue reset. No routes changed; 20% exploration retained.
- Rolling 24h target completions: Cancer 2715, Leo 3295, Aries 2422. All healthy;
  failures zero. Distinct observed challenges 9829/11227/7401 are not eligible
  opportunities. Per-agent eligible/hour and a comparable canary baseline are
  still unimplemented, so no regional performance conclusion is claimed.
- Native evidence covers only the newest 383/584/399 targets, respectively:
  restart counts 0/1/1, upload failures 0/0/0. Earlier targets lack those markers;
  query-only and zero-row observations are not confirmed empty locations.
- 07:00 giant/large Discord IDs 1546656505909084252 / 1546656517619589201 were
  fetched successfully and exactly match the frozen outbox. They predate the
  full v77 rollout and do not prove the new report lifecycle.
- New real lifecycle acceptance awaits 12:30 -> 14:00. Existing candidate-only
  and release-validation audit records must not be presented as full success.
- Repair-start notification acknowledged as 1546711357754310677. The durable
  checkpoint and delivery deduplication reside in the independent bot's ignored
  tmp/allocation-checkpoint-20260908-1030.json and its report outbox.

The 24h epoch gate cannot pass before 19:40:15 today, later than the existing
19:30 check. Keep the automation and original rotations; do not move either
schedule just to reach the gate. Required canary persistence/rollback and
comparability checks must still precede activation after the sample gate passes.

Validation: actual-route regression rejects wrong target/agent/challenge,
out-of-lease observations, changed values, full/invalid counts, wrong level,
expired challenges and unsuccessful targets. Release test results and live
evidence are recorded in the PR after deployment.
