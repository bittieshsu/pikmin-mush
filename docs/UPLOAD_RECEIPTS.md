# Replay-safe TSV upload (opt-in)

This is an additive protocol, not a change to the existing Agent credentials,
allocation, public refresh or Discord reports. Old upload clients retain their
existing behavior and its known replay limitation. Do not claim it protects
legacy clients simply because the server release is installed.

## Contract

An authenticated upload with `X-Upload-Protocol: receipt-v1` also carries
`X-Upload-Stream` (random UUID), `X-Upload-Start` and `X-Upload-End` (byte range).
The body is immutable, UTF-8, newline-terminated and at most 100 raw lines and
512,000 bytes. The phone retains its smaller 262,144-byte bound.
An already committed envelope returns its original accepted count without new
observations, counters or freshness timestamps. A changed body for the same
range or an older overlapping range returns 409 and is NOT discarded locally.
New distinct observations in later non-overlapping ranges remain observations.

All snapshot/history statements, receipt, uploaded counters, presence/version
and upload event execute in **one D1 batch transaction**, at most 72 statements
for a primary 100-row request; each statement has fewer than 100 parameters.
A late failure rolls the whole batch back. A concurrent duplicate is reconciled
against the committed receipt after the losing transaction aborts.
Receipt uniqueness and monotonic ranges are DB-enforced, not just a preflight
query. The range guard uses the existing primary-key prefix and reverse lookup
of the latest start, not a growing scan through all prior ranges.
The table and trigger are owned by migration 0023, not runtime schema creation.

The raw TSV parser and accepted-row definition are unchanged. Ingestion time is
still the server's first successful receipt, not an inferred phone scan time.
A retry preserves that time and the original target attribution after acceptance.
Legacy partial state must be empty before enabling receipt uploads; otherwise
the server refuses the switch without clearing it.

## Phone state and recovery

Install `upload-receipts.sh` alongside `agent.sh`; enable
`UPLOAD_RECEIPTS_ENABLED=1` only on the selected canary. Default remains 0.
The staging directory is published by rename. `upload.pending/body` and `meta`
freeze the range and SHA-256 before the first send. Later appended TSV data does
not enter a retry. Accepted offsets are saved through temporary-file rename.
Pending state survives process restart, response loss and missing/truncated TSV.
After accepted-offset save but before pending deletion, recovery removes the
already-accepted pending state without another request.
Detected truncation or inode replacement creates a new stream only after the
old pending upload is drained. An in-place truncate-and-regrow beyond the old
offset between observations cannot be reliably detected by size/inode alone;
do not promise recovery from that case without native stream-generation support.

Retry delay is capped at 300 seconds plus 0–4 seconds jitter, does not sleep in
the control loop, and is persisted. Attempts do not clear pending data. Integrity
failures or unexpected 200 bodies do not advance offset. Files are phone-local;
no credential is placed in pending metadata. A rename does not promise survival
of sudden filesystem/power loss; integrity/offset checks fail closed afterwards.

## Release, canary and rollback

Server must be released with its migration before any phone opt-in. Confirm the
existing real phone identity, script/config backup, empty legacy partial state,
and a safe stopped shell/in-flight transport boundary before reload. Do not
reuse the earlier `/proc/.../children` reload script.
Keep unrelated old phone navigation/recovery code when applying the canary.

Measure real chunk size, accepted rows, request count/interval, new receipt count,
upload delay and scan ACKs before/after. 100-line bounds may increase requests
when draining large backlogs; do not roll out solely on unit-test success.
Use natural accepted uploads and DB receipts, not fake production mushrooms.
Preserve original config/token/offset/pending ACK. Never force response loss or
failure in production merely to reproduce the local test.

Receipts currently have **no automatic TTL**: deleting one while a phone retains
its pending envelope would reintroduce duplicate ingestion. Keep activation
canary-only until receipt growth is measured and acknowledged-stream compaction
is designed. This is not a new retention policy for mushroom data.

Rollback by disabling opt-in while preserving the uploader/server until pending
data is acknowledged (the presence of pending state forces receipt mode even if
the flag is disabled). Do not restore a pre-receipt phone script or deploy an old
server while pending batches exist. Keep additive migrations and accepted data.

Local checks: site `npm test`, lint, production audit; phone receipt/chunk,
legacy-command and power-guard integration tests. The suite includes real local
D1 migration/trigger/rollback, actual upload route plus SQLite fault injection,
response-loss replay, concurrent duplicate, mismatch, overlap, separate agents,
fresh observations, auth/limits and phone durable retry paths. This is not live
fleet or Sites composite-quota acceptance.
