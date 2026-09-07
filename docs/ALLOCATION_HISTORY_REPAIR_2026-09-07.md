# Allocation measurement integrity repair

## Confirmed defect

`resetLoop()` deleted a job's completed queue rows. Both shadow numerators and
denominators joined those disposable rows. Historical observations could remain
while their country attribution disappeared. A SQLite reproduction proved this;
the number of affected production rows has not been established.

## Repair and release boundary

- Archive ID, job, cycle, country and verification kind before queue deletion in
  one atomic D1 batch. Archive failure prevents deletion.
- Resolve historical targets from current queue plus archive, without double
  joins. Keep archives eight days and prune at most 5,000 per maintenance cycle.
- Restart the measurement epoch at the first v2 shadow request. Use exactly the
  same window for numerator and denominator; expose orphan observations/events.
- Fail the sample gate if either orphan count is nonzero. No inferred recovery
  of already-lost country data. Archive schema is additive migration 0017.
- Tests cover retained count after deletion, retries, overlapping rows and
  rollback on archive failure. No phone, route or notification schedule change.

## Still required before canary

Wait at least 24 hours after the new epoch and prove an actual loop reset retains
attribution. Check rolling-window expiration separately from true data loss.
Per-agent comparable unique opportunity metrics, fixed acceptance criteria,
durable canary settings, rotation protection and rollback remain unfinished.
`canary_ready` is only a sample/integrity gate, not authorization to skip these.
Do not infer capture freshness from ingestion time or `+0` from an empty map.

Notification service is now `F:\claude_ws\ody-discord-bot`, not LINE. Validation
messages must use its persistent outbox and record actual Discord acknowledgement.
