# Cancer upload recovery — 2026-09-11

## Cause

Native 152 capture and target ACKs continued, but upload repeatedly returned
HTTP 413. A 262,144-byte chunk contained 2,502 newline-terminated records,
exceeding the API's 2,500 parsed-row limit. The unchanged offset made retries
repeat forever. The response file was stale because curl uses `-f`; its old
`accepted` text was not evidence of a new successful request.

## Repair

The sender now caps chunks at 2,000 complete lines as well as the existing
byte limit, preserving UTF-8 record boundaries and advancing the offset only
on HTTP 200. No server limits or authentication rules were relaxed.

Cancer's installed script matched the source before the focused patch. Only
Cancer's Agent process was restarted; game, native module, routes, schedules,
and other devices were unchanged. Native remains 152.0-r1.

The roughly 23 MB accumulated TSV and previous offset/script/config were
backed up on the device under a root-only recovery directory. Old unuploaded
records are quarantined, not deleted or replayed as fresh observations. The
existing API timestamps ingestion and associates current targets, so replaying
that backlog would falsely refresh historical data and contaminate allocation
metrics. Live ingestion resumed from the backed-up complete-line boundary.

## Tests and caveats

`bash phone_agent/tests/upload-chunk-test.sh` tests the 2,502-line case,
failed-request offset preservation, subsequent remainder delivery, incomplete
lines, and a multibyte UTF-8 boundary. Shell syntax validation also passes.

The health endpoint can still report healthy from successful target capture
despite failed uploads; validate real upload events/observations instead.
Historical quarantined data is not included in the recovery's live results.

## Live acceptance

After recovery, two consecutive targets captured 11 and 5 rows with map-object
markers and completed ACKs. Four uploads advanced the offset from 23,990,813
to 23,992,523 bytes. The server metrics sample at 1789067445767 reported 16
observed/new challenges for Cancer and a last-data age of 1,494 ms. No HTTP 413
occurred in this recovery interval. This is immediate end-to-end recovery
evidence, not a full-day soak. The installed script SHA-256 matches the tested
source: `63d8f44066a958ce347b6fa2ffd41d3274e68c17a1c6596d10650a809ccebaaa`.
