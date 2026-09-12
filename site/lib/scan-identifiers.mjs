// Database identities are NOT bounded counters. Never clamp or round them:
// doing so can acknowledge a different row. SQLite IDs must remain exactly
// representable by JavaScript; reject invalid/unsafe values before DB access.
export function scanInteger(value, minimum = 1) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= minimum ? number : null;
}
