# Public map efficiency (issue #95)

This change reduces public-read work without changing Agent uploads, task leases,
report schedules, candidate rules, or global search semantics. It does not assert
that a billing incident occurred or that production D1 row usage has been measured.

## API contract and clients

- Every `GET /api/mushrooms` is now cursor-paginated: default 500, maximum 1,000
  records per response (one lookahead row internally). **Omitting `limit` no longer
  returns the entire database.** Follow `pagination.has_more` / `next_cursor` until
  complete. No total-result or world-area cutoff is introduced.
- Default responses preserve `count`, fleet status, discovery names and retention
  metadata. Continuations can request `include_meta=0`: `count` is null, and status,
  agent markers and retention are omitted. Keep the first page's metadata; never
  treat a missing count as zero or a page failure as successful partial results.
- New cursors retain their original issue time and expire after one hour (`410`,
  `cursor_expired`). Start a new query after expiry. This is a usability/freshness
  bound, not a cryptographic anti-scraping control. Older cursors remain accepted
  for rollout compatibility. There is no arbitrary page-depth cutoff.
- The Windows scanner proxy assembles bounded cloud pages for its legacy map,
  rejects repeated/missing cursors and fails closed on a failed page.
- The independent Discord client's `_fetch_mushrooms()` already follows all pages
  and preserves absolute report bounds. Its default requests do not opt into the
  public response cache; participant data remains read from D1. No bot settings,
  schedule, service or database changes are required.

## Cache, metadata and limits

- Only the exact public GET route with `cache=brief` opts into a 15-second
  Cloudflare Cache API response cache. Authorization and `Cache-Control: no-cache`
  or `no-store` bypass it. Errors, rate-limit responses and Set-Cookie responses
  are not cached. Admin, upload and verification routes are never wrapped.
- Cache keys isolate origin, filters, sort, priority, window, bbox, page limit,
  cursor and metadata mode. They ignore the former timestamp cache-buster and
  sort type/level selections. Unknown parameters have no API semantics.
- Browser responses must revalidate. `X-Map-Cache` reports HIT/MISS/BYPASS;
  `updated` is the response snapshot time, not a new observation of a mushroom.
- Count results and fleet metadata use a bounded 15-second isolate memo. Metadata
  responses include `metadata_updated_at`; combined with response caching, count
  and fleet metadata may be up to approximately 30 seconds old. A failure is not
  cached. This memo is a performance aid, never a source of durable state.
- Retention keeps its authoritative D1 five-minute lease. A 30-second per-isolate
  memo/in-flight guard reduces repeated maintenance lock checks across map pages
  and uploads. Errors are retried, not memoized as success.
- Best-effort per-isolate burst limiting uses only Cloudflare's injected
  `CF-Connecting-IP`: burst 120, refill two reads/second, at most 2,048 in-memory
  buckets. It returns non-cacheable `429` plus `Retry-After`. It neither persists
  nor logs IPs, and skips requests without a platform identity. This is **not** a
  distributed WAF or an enforceable fleet-wide quota. Deploy a platform rate-limit
  rule later if measured abuse warrants one; allow for shared NATs and bot pagination.
- Cache API hits avoid the route's D1 work, not Worker invocation itself. Edge
  cache contents are regional; cache hit rates and actual costs require production
  measurement. Cache failure falls back to a normal bounded query.

## Browser behavior

- Map still refreshes every 20 seconds when visible. Both views send selected
  level/type/time/participant/search filters to the server. The list remains world-wide.
- Viewports snap outward to 0.05-degree cells; adjacent pans can reuse responses.
  The actual visible map clips the small overfetch. Date-line wrapping and repeated
  worlds remain supported. Marker rendering retains its existing 3,000-row viewport
  cap; the global list can continue through every page.
- List first page refreshes at most once a minute. Once more pages are loaded,
  automatic list refresh pauses to preserve that browsing snapshot; its timestamp
  and notice tell the user to press Refresh for the latest first page. More remains
  available. No automatic full-list recrawl and no disguised stale-as-live merge.
- Background/busy auto refresh is skipped; explicit filter changes cancel outdated
  requests. `429`/`503` Retry-After pauses map and list together, retaining existing
  data. Expired list cursors restart at the first page. CSP hashes are updated.

## Observability and follow-up

`public_map_read` JSON logs sample 5% of ordinary requests and retain slow (>=1s)
or failed reads. Fields are cache state, HTTP status, duration, returned rows and
fixed query labels with D1 `meta.rows_read` / `rows_written`. Missing D1 metadata is
null, not zero. No raw query, SQL, bindings, coordinates, cursor, IP or credential
is logged. These metrics cover the labeled read queries; schema probes and retention
maintenance are not included. Use D1 analytics for total database usage.

Compare cache hit rate, p50/p95 latency, rows read per returned record, and error/
429 rates over comparable traffic windows before adding indexes or stronger limits.
Do not implement `updated_after` alone: expiry/invalidation/deletion tombstones and
a reliable watermark/resync contract are prerequisites. Do not restrict world-wide
search or silently truncate result pages as a performance shortcut.

References: [issue #95](https://github.com/odyliao-lab/pikmin-mush/issues/95),
[D1 analytics](https://developers.cloudflare.com/d1/observability/metrics-analytics/),
[Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/).
