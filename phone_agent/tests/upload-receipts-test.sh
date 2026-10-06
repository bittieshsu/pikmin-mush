#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
MODDIR="$TMP/mod"; mkdir "$MODDIR"
printf '12345678-1234-1234-1234-123456789abc\n' >"$MODDIR/upload.stream"
TSV="$TMP/data"; CHUNK="$TMP/chunk"; RESPONSE="$TMP/response"; OFFSET_FILE="$MODDIR/upload.offset"
OFFSET=0; MAX_UPLOAD_CHUNK_BYTES=262144; SERVER_URL=https://example.invalid
UPLOAD_RECEIPTS_ENABLED=1; HTTP=500; CALLS=0; BAD_RESPONSE=0
cp "$ROOT/upload-receipts.sh" "$MODDIR/upload-receipts.sh"
save_offset() { printf '%s\n' "$1" >"$OFFSET_FILE"; OFFSET="$1"; }
cat() {
  if [ "$1" = /proc/sys/kernel/random/uuid ]; then
    printf '87654321-4321-4321-4321-cba987654321\n'
  else command cat "$@"; fi
}
auth_curl() {
  CALLS=$((CALLS+1)) # command substitution uses a subshell; also persist evidence.
  printf '%s\n' "$*" >>"$TMP/calls"
  cp "$MODDIR/upload.pending/body" "$TMP/sent"
  printf 'accepted=1\n' >"$RESPONSE"
  [ "$BAD_RESPONSE" = 0 ] || printf 'unexpected\n' >"$RESPONSE"
  printf '%s' "$HTTP"
}
eval "$(sed -n '/^upload_new() {/,/^game_display_id() {/p' "$ROOT/agent.sh" | sed '$d')"
printf 'first\n' >"$TSV"
if upload_new; then exit 1; fi
[ "$OFFSET" -eq 0 ]
cmp "$TMP/sent" "$MODDIR/upload.pending/body"
cp "$MODDIR/upload.pending/meta" "$TMP/original-meta"
printf 'next\n' >>"$TSV"
if upload_new; then exit 1; fi # backoff: no new request
[ "$(wc -l <"$TMP/calls")" -eq 1 ]
cmp "$TMP/original-meta" "$MODDIR/upload.pending/meta"
# Simulated agent process restart: load only the durable offset and pending state.
OFFSET="$(cat "$OFFSET_FILE" 2>/dev/null || printf 0)"; HTTP=200
printf '0\n1\n' >"$MODDIR/upload.pending/retry"
upload_new
[ "$OFFSET" -eq 6 ]
printf 'first\n' >"$TMP/expected"; cmp "$TMP/sent" "$TMP/expected"
[ ! -d "$MODDIR/upload.pending" ]
upload_new
[ "$OFFSET" -eq 11 ]
printf 'next\n' >"$TMP/expected"; cmp "$TMP/sent" "$TMP/expected"
# Crash after accepted offset was saved but before pending directory was removed.
HTTP=500; printf 'later\n' >>"$TSV"
if upload_new; then exit 1; fi
OFFSET="$(sed -n '3p' "$MODDIR/upload.pending/meta")"; save_offset "$OFFSET"
N="$(wc -l <"$TMP/calls")"; upload_new
[ "$(wc -l <"$TMP/calls")" -eq "$N" ]
[ ! -d "$MODDIR/upload.pending" ]
# Pending payload stays uploadable even if game file disappears.
printf 'orphan\n' >>"$TSV"
if upload_new; then exit 1; fi
rm "$TSV"; HTTP=200; printf '0\n6\n' >"$MODDIR/upload.pending/retry"
upload_new
[ ! -d "$MODDIR/upload.pending" ]
# Invalid/mismatched 200 is never acceptance, even when opt-in is turned off.
printf 'a\n' >"$TSV"; OFFSET=0; HTTP=500
if upload_new; then exit 1; fi
UPLOAD_RECEIPTS_ENABLED=0
printf '0\n6\n' >"$MODDIR/upload.pending/retry"
HTTP=200; BAD_RESPONSE=1
if upload_new; then exit 1; fi
[ "$OFFSET" -eq 0 ]; [ -d "$MODDIR/upload.pending" ]
printf '0\n6\n' >"$MODDIR/upload.pending/retry"
printf 'corrupt' >>"$MODDIR/upload.pending/body"
if upload_new; then exit 1; fi
[ "$OFFSET" -eq 0 ]; [ -d "$MODDIR/upload.pending" ]
printf 'receipt upload tests passed\n'
