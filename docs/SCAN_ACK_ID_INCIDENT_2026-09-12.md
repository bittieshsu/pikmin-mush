# Scan ACK identifier incident (2026-09-12)

All three devices remained online but blocked on persisted completion ACKs.
The v2 ACK route reused a bounded statistics counter parser for database IDs,
silently clamping target IDs above 1,000,000. Actual targets 1000003, 1000395
and 1000456 became 1000000, so completeTask could not acknowledge the intended
row. Control renewal used the correct ID, retaining the lease and the retry loop.

## Recovery and durable boundary

- Keep existing database IDs, leases, observations and device pending ACKs.
  No ID reset, deletion, or phone reboot is required for this failure.
- Parse identities as strict decimal positive safe integers, without clamping.
  Sequence/cycle compatibility fields permit zero; malformed/unsafe values
  return 400 before completion/lookup. Statistics counters remain bounded.
- Cover v2 ACK, legacy ACK and control. Retain token/lease authorization and
  duplicate handling. JS safe integer ceiling is 9,007,199,254,740,991, not an
  operational monthly limit. A future larger ID protocol must use decimal
  strings end-to-end; never round, wrap, or recycle live identities.
- Existing agents automatically retry their persisted ACK after release.
  Verify each agent advances to subsequent targets and uploads fresh rows.
- Health now warns after 30 minutes without target completion while online
  with an assigned target; critical at 60 minutes, even if uploads/heartbeats
  continue. This is a diagnostic warning, not an automatic reboot policy.
- Regression tests exercise the real ACK handler above 1 million, 32-bit and
  at the safe integer boundary, invalid inputs and retry statuses.

Do not repair this incident by pruning history or increasing a count clamp.
History retention is a separate storage policy and must preserve unique IDs.
