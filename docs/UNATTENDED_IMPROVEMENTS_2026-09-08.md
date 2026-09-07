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

## Remaining validation / activation

- Run full site and bot suites, inspect additive migrations and required CI.
- Merge reviewed changes and publish exact site subtree, record release version.
- Verify public sort/search/filter bounds and anonymous audit rejection.
- Deploy phone diagnostics at a safe target boundary, without restarting game;
  verify each device still scans and uploads and evidence reaches metrics.
- Restart only the Discord service, preserving dirty unrelated startup changes,
  frozen reports, delivery ledger and scheduler times. Verify one listener.
- Exercise labelled audit/delivery fixtures without replacing scheduled reports.
- Wait for a real verification batch for participants_verified_at and report
  lifecycle acceptance. Do not label a synthetic fixture as real production proof.
- City-internal routing changes remain deferred to the existing allocation
  automation; do not disturb the currently collecting comparison.
- Send the final complete Discord report only after all applicable acceptance
  checks pass, distinguishing any long-running deferred work.

Tests so far: site 29 passed, lint clean; bot 48 passed (before final follow-up
review). These are local results, not a declaration of production completion.
