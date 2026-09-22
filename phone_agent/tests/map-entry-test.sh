#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
eval "$(sed -n '/^enter_map_view() {/,/^}/p' "$ROOT/agent.sh")"
game_swipe() { printf 'swipe %s %s %s %s' "$@"; }
game_tap() { printf 'tap %s %s' "$@"; }
MAP_VIEW_TAP_X=360; MAP_VIEW_TAP_Y=1400
[ "$(enter_map_view)" = 'tap 360 1400' ]
MAP_ENTRY_MODE=swipe
MAP_ENTRY_START_X=1230; MAP_ENTRY_END_X=220; MAP_ENTRY_Y=1600
[ "$(enter_map_view)" = 'swipe 1230 1600 220 1600' ]
game_swipe() { return 2; }
if enter_map_view; then exit 1; else [ "$?" = 2 ]; fi
echo 'map entry tests passed'
