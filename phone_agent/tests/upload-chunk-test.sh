#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
TSV="$TMP/data"; CHUNK="$TMP/chunk"; RESPONSE="$TMP/response"
MAX_UPLOAD_CHUNK_BYTES=262144; OFFSET=0; SERVER_URL=http://unused
save_offset() { OFFSET="$1"; }
auth_curl() { printf '%s' "$HTTP"; }
eval "$(sed -n '/^upload_new() {/,/^game_display_id() {/p' "$ROOT/agent.sh" | sed '$d')"
awk 'BEGIN {for(i=0;i<2502;i++) print "sample"}' >"$TSV"
HTTP=200
upload_new
[ "$(wc -l <"$CHUNK")" -eq 2000 ]
[ "$OFFSET" -eq 14000 ]
HTTP=413
if upload_new; then exit 1; fi
[ "$OFFSET" -eq 14000 ]
HTTP=200
upload_new
[ "$(wc -l <"$CHUNK")" -eq 502 ]
[ "$OFFSET" -eq "$(wc -c <"$TSV")" ]
printf 'a\npartial' >"$TSV"
OFFSET=0
upload_new
[ "$OFFSET" -eq 2 ]
if upload_new; then exit 1; fi
[ "$OFFSET" -eq 2 ]
printf '水\n冰藍\n' >"$TSV"
OFFSET=0; MAX_UPLOAD_CHUNK_BYTES=5
upload_new
[ "$OFFSET" -eq 4 ]
printf 'upload chunk tests passed\n'
