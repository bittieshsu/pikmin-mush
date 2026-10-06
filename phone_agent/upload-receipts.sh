#!/system/bin/sh
# Sourced by agent.sh. Opt-in, one immutable pending range per phone.
upload_receipt_new() {
  UP_DIR="$MODDIR/upload.pending"
  UP_STREAM_FILE="$MODDIR/upload.stream"
  if [ ! -d "$UP_DIR" ]; then
    [ -f "$TSV" ] || return 0
    UP_SIZE="$(stat -c %s "$TSV" 2>/dev/null)"
    case "$UP_SIZE" in ''|*[!0-9]*) return 1 ;; esac
    UP_SOURCE="$(stat -c '%d:%i' "$TSV" 2>/dev/null)" || return 1
    UP_PRIOR_SOURCE="$(cat "$MODDIR/upload.source" 2>/dev/null || true)"
    if [ "$UP_SIZE" -lt "$OFFSET" ] || { [ -n "$UP_PRIOR_SOURCE" ] && [ "$UP_SOURCE" != "$UP_PRIOR_SOURCE" ]; }; then
      save_offset 0 || return 1
      rm -f "$UP_STREAM_FILE" || return 1
    fi
    printf '%s\n' "$UP_SOURCE" >"$MODDIR/upload.source.new" && \
      mv "$MODDIR/upload.source.new" "$MODDIR/upload.source" || return 1
    [ "$UP_SIZE" -gt "$OFFSET" ] || return 0
    if [ ! -f "$UP_STREAM_FILE" ]; then
      cat /proc/sys/kernel/random/uuid >"$UP_STREAM_FILE.new" || return 1
      mv "$UP_STREAM_FILE.new" "$UP_STREAM_FILE" || return 1
    fi
    # A process crash during preparation leaves only an unpublished directory.
    rm -rf "$MODDIR/upload.preparing"
    mkdir "$MODDIR/upload.preparing" || return 1
    UP_COUNT=$((UP_SIZE - OFFSET))
    [ "$UP_COUNT" -le "$MAX_UPLOAD_CHUNK_BYTES" ] || UP_COUNT="$MAX_UPLOAD_CHUNK_BYTES"
    dd if="$TSV" of="$MODDIR/upload.preparing/raw" bs=1 skip="$OFFSET" count="$UP_COUNT" 2>/dev/null || return 1
    UP_LINES="$(wc -l <"$MODDIR/upload.preparing/raw" | tr -d ' ')"
    [ "$UP_LINES" -le 100 ] || UP_LINES=100
    [ "$UP_LINES" -gt 0 ] || return 1
    head -n "$UP_LINES" "$MODDIR/upload.preparing/raw" >"$MODDIR/upload.preparing/body" || return 1
    rm "$MODDIR/upload.preparing/raw" || return 1
    UP_COUNT="$(stat -c %s "$MODDIR/upload.preparing/body")"
    UP_HASH="$(sha256sum "$MODDIR/upload.preparing/body" | cut -d ' ' -f1)"
    printf '%s\n%s\n%s\n%s\n' "$(cat "$UP_STREAM_FILE")" "$OFFSET" "$((OFFSET+UP_COUNT))" "$UP_HASH" \
      >"$MODDIR/upload.preparing/meta" || return 1
    mv "$MODDIR/upload.preparing" "$UP_DIR" || return 1
  fi
  UP_STREAM="$(sed -n '1p' "$UP_DIR/meta")"
  UP_START="$(sed -n '2p' "$UP_DIR/meta")"
  UP_END="$(sed -n '3p' "$UP_DIR/meta")"
  UP_HASH="$(sed -n '4p' "$UP_DIR/meta")"
  case "$UP_START:$UP_END" in *[!0-9:]*|:*|*:) echo '[agent] invalid pending upload range'; return 1 ;; esac
  [ "${#UP_STREAM}" -eq 36 ] && [ "${#UP_HASH}" -eq 64 ] || return 1
  [ "$UP_END" -gt "$UP_START" ] || return 1
  [ "$(stat -c %s "$UP_DIR/body")" -eq "$((UP_END-UP_START))" ] || return 1
  [ "$(sha256sum "$UP_DIR/body" | cut -d ' ' -f1)" = "$UP_HASH" ] || return 1
  if [ "$OFFSET" -eq "$UP_END" ]; then
    # Crash after saving the accepted offset, before deleting pending state.
    rm -rf "$UP_DIR"
    return 0
  fi
  [ "$OFFSET" -eq "$UP_START" ] || { echo '[agent] pending upload offset conflict'; return 1; }
  UP_NOW="$(date +%s)"
  UP_AFTER="$(sed -n '1p' "$UP_DIR/retry" 2>/dev/null || printf 0)"
  UP_TRIES="$(sed -n '2p' "$UP_DIR/retry" 2>/dev/null || printf 0)"
  case "$UP_AFTER" in ''|*[!0-9]*) UP_AFTER=0 ;; esac
  case "$UP_TRIES" in ''|*[!0-9]*) UP_TRIES=0 ;; esac
  [ "$UP_NOW" -ge "$UP_AFTER" ] || return 1
  UP_CODE="$(auth_curl -o "$RESPONSE" -w '%{http_code}' -X POST \
    -H 'Content-Type: application/octet-stream' -H 'X-Upload-Protocol: receipt-v1' \
    -H "X-Upload-Stream: $UP_STREAM" -H "X-Upload-Start: $UP_START" -H "X-Upload-End: $UP_END" \
    --data-binary "@$UP_DIR/body" "$SERVER_URL/api/agent/upload" 2>/dev/null)"
  if [ "$UP_CODE" = 200 ] && grep -Eq '^accepted=[0-9]+$' "$RESPONSE"; then
    save_offset "$UP_END" || return 1
    rm -rf "$UP_DIR"
    echo "[agent] receipt upload accepted bytes=$((UP_END-UP_START)), offset=$UP_END"
    return 0
  fi
  [ "$UP_TRIES" -ge 6 ] || UP_TRIES=$((UP_TRIES+1))
  UP_DELAY=$((5 * (1 << UP_TRIES)))
  [ "$UP_DELAY" -le 300 ] || UP_DELAY=300
  UP_DELAY=$((UP_DELAY + UP_NOW % 5))
  printf '%s\n%s\n' "$((UP_NOW+UP_DELAY))" "$UP_TRIES" >"$UP_DIR/retry.new"
  mv "$UP_DIR/retry.new" "$UP_DIR/retry"
  echo "[agent] receipt upload retry http=$UP_CODE delay=${UP_DELAY}s (pending retained)"
  DIAG_UPLOAD_FAILURES=$(( ${DIAG_UPLOAD_FAILURES:-0} + 1 ))
  return 1
}
