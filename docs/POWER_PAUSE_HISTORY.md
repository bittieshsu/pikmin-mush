# Protection pause history (2026-09-21)

- Phone power guard records a durable interval, retaining its original start across restart; queued uploads retry one per 30 seconds with a five-second timeout.
- Existing open hold is imported from the hold file timestamp. Earlier completed intervals cannot be reconstructed automatically.
- Agent POST `/api/agent/power-events` uses its existing token identity, a bounded body, validated timestamps/reasons and idempotent interval keys. A delayed open packet never reopens a completed interval.
- Additive Drizzle migration 0020 stores intervals. Admin/controller GET `/api/admin/power-events?from=...&to=...` uses epoch milliseconds, at most 31 days, overlapping intervals, and explicit truncation over 1,000 records. No public access.
- Admin overview/fleet disclosure shows 24 hours, Taipei timestamps, ongoing/unknown states. Recovery means the guard released its latch, not a successful scan.
- Independent Discord service appends Cancer intervals in the same 7/7/10-hour report window; counts and schedules are unchanged.
- Deployment order: site and migration, Cancer guard, notifier restart. Keep Cancer resume threshold 80 and factory protection. Verify real pause upload now; actual 80-percent recovery and first target ACK/upload require delayed observation.

Validation: site 46 tests and production audit clean; shell policy/parser/80-percent and durable outbox tests; Discord 72 tests. Do not simulate phone battery values or bypass protection for acceptance.
