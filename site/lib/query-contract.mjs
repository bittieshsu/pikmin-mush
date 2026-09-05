// Versioned public query contract. Time boundaries use Unix seconds, inclusive.
export const QUERY_CONTRACT_VERSION = 1;
export const DISCOVERY_SQL = "MAX(COALESCE(first_seen, 0), CAST(COALESCE(start_ms, 0) / 1000 AS INTEGER))";
export const UNDER_FIVE_SQL = "challenger_capacity > 0 AND challenger_count >= 0 AND challenger_count < 5 AND challenger_count <= challenger_capacity";

export function discoveryWindow(params, nowSeconds) {
  const from = params.get("discovered_from"), to = params.get("discovered_to");
  const hours = params.get("discovered_within_hours");
  if (from !== null || to !== null) {
    if (hours !== null || from === null || to === null ||
        !/^\d{1,11}$/.test(from) || !/^\d{1,11}$/.test(to)) throw new Error("invalid discovery window");
    const start = Number(from), end = Number(to);
    if (start > end || end - start > 31 * 86400 || end > nowSeconds) throw new Error("invalid discovery window");
    return { from: start, to: end };
  }
  if (hours !== null) {
    if (!["6", "12"].includes(hours)) throw new Error("invalid discovered_within_hours");
    return { from: nowSeconds - Number(hours) * 3600, to: nowSeconds };
  }
  return null;
}
