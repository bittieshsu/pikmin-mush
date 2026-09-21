#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODDIR="$(mktemp -d)"
trap 'rm -rf "$MODDIR"' EXIT
source "$ROOT/power-guard.sh"
SERVER_URL=https://example.test
power_guard_init
PG_NOW=100
power_guard_hold low-battery
power_guard_event
active="$(cat "$PG_EVENT_ACTIVE")"
test "$(find "$PG_EVENT_DIR" -name '*.json' | wc -l)" -eq 1
auth_curl(){ return 1; }
power_guard_flush_events
test "$(find "$PG_EVENT_DIR" -name '*.json' | wc -l)" -eq 1
power_guard_init
PG_NOW=200
power_guard_event
test "$(cat "$PG_EVENT_ACTIVE")" = "$active"
PG_STATE=running
power_guard_event
test ! -e "$PG_EVENT_ACTIVE"
grep -q '"resumed_at":[0-9]' "$PG_EVENT_DIR"/*.json
auth_curl(){ return 0; }
power_guard_flush_events
test "$(find "$PG_EVENT_DIR" -name '*.json' | wc -l)" -eq 0
echo 'Power event persistence/retry/recovery tests passed'
