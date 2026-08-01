#!/system/bin/sh

MODDIR="${PIKMIN_AGENT_CONTROL_DIR:-${0%/*}}"
PAUSE_FILE="$MODDIR/pause.until"
AUDIT_LOG="$MODDIR/control.log"

now_epoch() {
  date +%s
}

write_audit() {
  printf '%s %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$1" >>"$AUDIT_LOG"
  chmod 600 "$AUDIT_LOG" 2>/dev/null || true
}

status() {
  if [ ! -s "$PAUSE_FILE" ]; then
    echo "running"
    return 0
  fi
  value="$(tr -d '\r\n ' <"$PAUSE_FILE" 2>/dev/null)"
  if [ "$value" = "manual" ]; then
    echo "paused manual"
    return 0
  fi
  case "$value" in
    ''|*[!0-9]*) rm -f "$PAUSE_FILE"; echo "running"; return 0 ;;
  esac
  now="$(now_epoch)"
  if [ "$value" -le "$now" ]; then
    rm -f "$PAUSE_FILE"
    write_audit "auto-resume"
    echo "running"
    return 0
  fi
  echo "paused until $value $((value - now))"
}

pause_minutes() {
  minutes="$1"
  case "$minutes" in
    ''|*[!0-9]*) echo "error invalid-minutes" >&2; exit 2 ;;
  esac
  if [ "$minutes" -lt 1 ] || [ "$minutes" -gt 10080 ]; then
    echo "error minutes-out-of-range" >&2
    exit 2
  fi
  until_epoch="$(( $(now_epoch) + minutes * 60 ))"
  tmp="$PAUSE_FILE.tmp.$$"
  printf '%s\n' "$until_epoch" >"$tmp"
  chmod 600 "$tmp"
  mv -f "$tmp" "$PAUSE_FILE"
  write_audit "pause minutes=$minutes until=$until_epoch"
  status
}

case "${1:-status}" in
  status) status ;;
  pause) pause_minutes "${2:-}" ;;
  pause-manual)
    printf 'manual\n' >"$PAUSE_FILE"
    chmod 600 "$PAUSE_FILE"
    write_audit "pause manual"
    status
    ;;
  resume)
    rm -f "$PAUSE_FILE"
    write_audit "resume"
    status
    ;;
  *)
    echo "usage: $0 {status|pause MINUTES|pause-manual|resume}" >&2
    exit 2
    ;;
esac
