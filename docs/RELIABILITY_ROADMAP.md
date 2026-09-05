# Scanner reliability delivery plan

Status: in progress. Production baseline: Sites 69, source f7b1ff4.
GitHub baseline: main 50f52c0. Authoritative full checkout for this run:
`C:\Users\Ody\.codex\tmp\pikmin-mush-inspect`.
The Google Drive directory is an older handoff, not a healthy full Git checkout.

Deliver each numbered item as a separate commit (and a corresponding commit in
ody-line-bot when needed). Never bundle unrelated phone changes. A local commit
or a successful build is not a production acceptance result.

0. Reconcile production-only site changes into GitHub; preserve current phone
   code, curated event catalogue, global filtering, telemetry and rotation.
1. Shared selection contract: explicit absolute discovery window, timezone,
   valid under-five participants, grouped types, pagination, exclusion audit.
   Retries must keep the scheduled window, not move it with the retry clock.
2. Durable report lifecycle and per-chunk outbox; preserve the frozen report
   across retries, independently deliver giants and large reports, distinguish
   pending verification from a genuinely empty result.
3. Separate location, challenge and immutable observations; preserve discovery
   while recording last-seen and last-verified separately. Additive migration
   before changing readers; never invent historical observations.
4. Diagnose scan outcomes: captured/duplicate/empty/refresh or extraction failure,
   upload failure; do not infer scan success merely from an online heartbeat.
5. Productivity-based allocation: historical shadow evaluation first, exploration
   floor and local-date constraints retained; one-agent canary before activation.
6. Release provenance, compatibility/rollback gates, versioned event seeding,
   accurate source/date labels and bounded security-log retention.

Acceptance per item: focused behavioral tests, regression suite, production
build, exact source push, succeeded deployment, live API checks. Record evidence
and any unverified boundaries here. Never record tokens or webhook URLs.

## Initial audit

- Production-only deltas found in 22 site files; no phone code is imported from
  the older Sites test fixture.
- Event-spot inline script changed without refreshing its CSP hash in release
  69; repair the hash and retain a test derived from actual script bytes.
- Existing event catalogue assertions refer to records intentionally removed by
  the user's replacement catalogue; update assertions to the approved dataset.
- Report retry selection currently uses retry time as the end of the window.
- Report chunks currently have no independent durable acknowledgement.
