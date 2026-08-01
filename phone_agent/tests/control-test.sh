#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
control="$repo_root/phone_agent/control.sh"

test "$(PIKMIN_AGENT_CONTROL_DIR="$tmp_dir" bash "$control" status)" = "running"
timed="$(PIKMIN_AGENT_CONTROL_DIR="$tmp_dir" bash "$control" pause 60)"
case "$timed" in paused\ until\ * ) ;; *) echo "unexpected timed status: $timed" >&2; exit 1 ;; esac
test "$(PIKMIN_AGENT_CONTROL_DIR="$tmp_dir" bash "$control" pause-manual)" = "paused manual"
test "$(PIKMIN_AGENT_CONTROL_DIR="$tmp_dir" bash "$control" resume)" = "running"
if PIKMIN_AGENT_CONTROL_DIR="$tmp_dir" bash "$control" pause 0 >/dev/null 2>&1; then
  echo "pause 0 should fail" >&2
  exit 1
fi
echo "control.sh tests passed"
