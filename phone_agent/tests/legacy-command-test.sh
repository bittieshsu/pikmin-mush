#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
# Execute the actual outer-loop legacy block, not a second implementation.
BLOCK=$(sed -n '/^  if \[ "$AGENT_ID" = "primary" \]/,/^  fi/p' "$ROOT/agent.sh")
auth_curl() { echo called >>"$TMP/calls"; }
AGENT_ID=primary; LEGACY_COMMAND_ENABLED=0; SERVER_URL=http://unused; LAST_SEQ=0
eval "$BLOCK"
test ! -f "$TMP/calls"
LEGACY_COMMAND_ENABLED=1
eval "$BLOCK"
test "$(wc -l <"$TMP/calls")" -eq 1
AGENT_ID=other
eval "$BLOCK"
test "$(wc -l <"$TMP/calls")" -eq 1
echo 'legacy command opt-in tests passed'
