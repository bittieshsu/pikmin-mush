# Release and rollback gates

GitHub main is the only development source. Sites source is a release mirror.
Never edit the release mirror without porting the change into a reviewed PR.
Keep unrelated Android repositories and test artifacts out of site commits.

1. Verify a clean full checkout and matching remote; fetch main and inspect diffs.
2. Each independent item has its own commit and behavioral regression tests.
3. Run site npm test and production dependency audit; for notifier changes run
   the Python suite. Do not bypass failed required checks.
4. Split the site subtree, merge into the Sites release mirror, and compare the
   resulting tree to the tested subtree. Build the exact resulting source.
5. Obtain a short-lived source credential only immediately before the push.
   Use a per-command header; never write credentials into Git/config/logs.
6. Package using the Sites helper. Record GitHub SHA, Sites source SHA, version,
   succeeded deployment, live query bounds and sample upload verification.
7. /api/version exposes the contract/schema/catalogue generation. It is not a
   substitute for recording the immutable source SHA and Sites version.

## Catalogue updates

Increment CATALOGUE_REVISION in lib/catalogue-seed.mjs for every catalogue edit.
The seed applies atomically only if its revision exceeds the stored revision;
older/same Workers do nothing. The catalogue is accessed lazily by event-spots,
so a seed failure does not stop mushroom uploads. Unknown limited-event dates
must remain unknown; community/user coordinates are not labelled official.

## Rollback

Prefer a forward corrective release retaining all additive migrations. Do not
edit applied migrations or remove observation data. Do not roll back to versions
69-72 after versioned catalogue seeding is enabled: older code deletes/reseeds the
catalogue unconditionally and does not honor its revision guard.
For report failures, retain the SQLite outbox and its frozen content. A confirmed
chunk is not replayed. An ambiguous network send needs Discord reconciliation;
exactly-once network delivery cannot be promised across a process crash.

## Controlled activation

Allocation remains shadow-only until 24h of target-attributed observations and
adequate per-region samples exist. Next step is one-agent canary; do not modify
all routes based on a short measurement. Preserve local-date and no-overlap rules.
Legacy zero-row acknowledgements stay unclassified until phones report evidence.

## Secrets

Read-only metrics and allocation-shadow endpoints accept the existing controller
bearer credential as well as the signed-in administrator. No other admin actions
gain controller access. This supports unattended health verification without
storing browser sessions; never expose controller tokens in URLs or reports.

Never copy old chat credentials into a release. Rotate an active exposed agent
credential only with an authenticated device update and subsequent live upload
verification; revoke the old credential after that proof. Existing rotation APIs
remain the supported path. A code deployment alone does not prove token rotation.
