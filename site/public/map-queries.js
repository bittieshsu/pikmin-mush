(function (root) {
  'use strict';
  function quantizedBbox(bounds, step = 0.05) {
    const [west, south, east, north] = bounds;
    const wrap = x => ((x + 180) % 360 + 360) % 360 - 180;
    const lo = (x, min) => Math.max(min, Math.floor(x / step) * step);
    const hi = (x, max) => Math.min(max, Math.ceil(x / step) * step);
    const w = east - west >= 360 ? -180 : lo(wrap(west), -180);
    const e = east - west >= 360 ? 180 : hi(wrap(east), 180);
    return [w, lo(south, -90), e, hi(north, 90)].map(x => x.toFixed(5)).join(',');
  }
  function filterParams(state, types, sort, priority, limit) {
    const params = new URLSearchParams({ limit: String(limit), cache: 'brief',
      levels: [...state.levels].sort().join(','), types: [...types].sort().join(','),
      sort, prioritize_low: priority ? '1' : '0' });
    if (state.q) params.set('q', state.q);
    if (state.underFiveOnly) params.set('under_five', '1');
    if (state.recentHours) params.set('discovered_within_hours', String(state.recentHours));
    return params;
  }
  function shouldRefreshList({ hidden, busy, rows, pageSize, lastUpdated, now }) {
    return !hidden && !busy && rows <= pageSize && now - lastUpdated >= 60_000;
  }
  function createFetcher(fetcher = root.fetch.bind(root), now = Date.now) {
    let retryAt = 0;
    return async function read(params, signal) {
      if (now() < retryAt) throw Object.assign(new Error('請稍候再更新'), { name: 'RetryLaterError' });
      const response = await fetcher('/api/mushrooms?' + params, { signal });
      if (response.status === 429 || response.status === 503) {
        const header = response.headers.get('Retry-After');
        const seconds = /^\d+$/.test(header || '') ? Number(header) : Math.ceil((Date.parse(header) - now()) / 1000);
        retryAt = now() + Math.max(1, Number.isFinite(seconds) ? seconds : 10) * 1000;
        throw Object.assign(new Error('服務繁忙，稍後自動重試'), { name: 'RetryLaterError' });
      }
      if (response.status === 410) throw Object.assign(new Error('清單分頁已過期'), { name: 'CursorExpiredError' });
      if (!response.ok) throw new Error('http ' + response.status);
      return response.json();
    };
  }
  root.MushroomQueries = { quantizedBbox, filterParams, shouldRefreshList, createFetcher };
})(globalThis);
