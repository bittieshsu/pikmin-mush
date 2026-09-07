# Unattended improvements — 2026-09-08

Scope approved in the project thread: global list consistency, phone evidence,
freshness, report audit; preserve allocation shadow and daily rotation. Do not
activate city routing changes before the existing observation/canary gates.

## Implementation checkpoints

1. `2eb272c`: server-side global search and whitelisted sort, keyset pagination
   with a frozen relative discovery window, fixed grouped type controls, list
   auto-refresh. Catalog-name search is a 120 km approximate neighbourhood,
   **not authoritative country boundaries**. Existing default API ordering is
   retained for notifier compatibility. Concurrent row updates mean pagination
   is a live view, not a transactional database snapshot.
2. `e899520`: optional per-target phone evidence persisted in the pending ACK:
   initial refresh wait, total scan time, fallback restart count, upload errors,
   object/query/timeout source. No timing/radius/route changes. Legacy and
   zero-row scans remain unclassified; these markers cannot prove true emptiness
   or count native duplicate objects. Distinct observed/new challenge counts use
   server receipt history, not native physical discovery time. First-receipt
   ties can attribute one challenge to multiple agents; do not sum these as a
   globally exclusive discovery count.
3. `d0ab864`: separate public observation-receipt and verification timestamps,
   unknown participant display, additive participants_verified_at. Verification
   requires a receipt attributed to the exact target and current challenge.
   Historical verifications are not fabricated. Freshness is no guarantee of
   available slots at the time a player arrives.
4. Report audit: local immutable candidate batch, durable bounded audit-sync
   queue, protected cloud timeline. Candidate fetch failure is not a completed
   empty batch. Delivery acknowledgements and uncertainty remain authoritative
   in the Discord outbox. Cloud audit may lag and must never block delivery.
   No webhook, token, message body or IP is sent to the audit table. Retention
   is 30 days; unpublished local audit events survive sync failures.

## Production release and evidence (2026-09-08, Asia/Taipei)

- Pikmin PR #85 and #86 merged; main `a804aa1`. PR #86 is test-only.
- Sites **v77** succeeded at 07:07:36, deployment
  `appgdep_6a9f43a406e08191969c3e52654637c3`, source
  `4face2fe6cf5a2829d7431d7277789c3a8cbd826` (PR #85 runtime).
- Discord bot PR #2 and #3 merged; main `597c612`. Service restarted with
  one listener, healthy scheduler and unchanged notification times. Existing
  dirty startup-task/VBS changes were preserved, not included in these PRs.
- Site build and 29 tests passed, lint clean; the additional actual-route
  pagination test in PR #86 passed separately. Bot suite: 49 passed.
- Public API checks: five sort modes returned the same fixed six-hour,
  level-3/under-five set, **76/76 IDs without duplicates**, over two pages each.
  Chinese query returned 200; map and freshness script returned 200.
  Anonymous audit GET rejected with 403 and POST with 401.
- A labelled `release-validation-20260908` empty audit fixture was accepted
  and acknowledged locally as synced. This proves the authenticated sync
  path, NOT an actual scheduled report or verified mushroom batch.
- Aries, Cancer and Leo now run agent.sh SHA-256
  `2d11f850f4372d2d4063ce8f78abe45da48c085865e9ab8af9092892dc30b762`.
  Serial identities were checked and previous scripts backed up on each phone
  as `agent.pre-evidence-20260908.sh`. No native module, GPS configuration,
  route or game process was restarted/changed. The daemon restart briefly
  pauses scanning; an in-progress lease may retry and is not a fair benchmark.
- All three resumed uploads and reported healthy. Initial new-evidence sample:
  Cancer 3 targets / 4333 ms average refresh / 2 query-only; Leo 16 / 938 ms / 0;
  Aries 7 / 1571 ms / 0. All had zero recorded fallback restarts/upload errors.
  These tiny, unequal windows are rollout checks, NOT comparative efficiency
  conclusions. Query-only is not proof of an empty location or failure.
- Rollback: use the previous known-good Sites version if needed; revert the
  relevant bot commit without deleting its delivery database; for phone
  diagnostics restore the verified per-device backup using the bounded daemon
  installer workflow. Do not blindly reboot games or discard pending leases.

## Remaining validation / activation

- Wait for a real verification batch for participants_verified_at and report
  lifecycle acceptance. Do not label a synthetic fixture as real production proof.
- Verify candidate, verification, exclusion and Discord message-id stages in
  the authenticated admin timeline, not just the successful fixture POST.
- City-internal routing changes remain deferred to the existing allocation
  automation; do not disturb the currently collecting comparison.
- Send the final complete Discord report only after all applicable acceptance
  checks pass, distinguishing any long-running deferred work.
- Continuation was added to the existing active `discord` thread automation;
  its **10:30/19:30 Taipei** schedule and allocation gates are unchanged. There
  is no second heartbeat. It must finish the real report acceptance and the
  gated city-routing work before sending the full completion report and pausing.
  Local scheduled work requires the host and Codex app to remain running.

## Explicit residual limits

- Native object deduplication still has its existing ten-minute suppression
  window. This release does not change its comparison fields or prove that all
  same-location respawns are captured immediately. Any native change needs
  version-locked build/device validation as a separate experiment.
- No authenticated browser UI acceptance or genuine scheduled verification
  batch was completed at this checkpoint. Do not equate API success with those
  pending checks, nor mark the entire unattended queue complete yet.
