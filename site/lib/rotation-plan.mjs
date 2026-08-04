export const ROTATION_TIME_ZONE = "Asia/Taipei";
export const ROTATION_SWITCH_MINUTES = [7 * 60 + 30, 19 * 60 + 30];
export const ROTATION_SWITCH_MINUTE = ROTATION_SWITCH_MINUTES[0];
export const ROTATION_EPOCH_DATE = "2026-07-22";

// Four balanced slots cover every configured non-Taiwan country pack exactly
// once. Each slot has four non-overlapping routes of 26–27 cities so four
// Agents receive nearly identical workloads at every 07:30 / 19:30 switch.
export const ROTATION_DAYS = [
  [
    { id: "global-01", label: "全球路線 01", packs: ["jp", "cl", "sg"], cityCount: 27 },
    { id: "global-02", label: "全球路線 02", packs: ["br", "in", "qa"], cityCount: 27 },
    { id: "global-03", label: "全球路線 03", packs: ["us-central", "ar", "at"], cityCount: 27 },
    { id: "global-04", label: "全球路線 04", packs: ["us-east", "au", "be"], cityCount: 27 },
  ],
  [
    { id: "global-05", label: "全球路線 05", packs: ["us-west", "fr", "bo"], cityCount: 27 },
    { id: "global-06", label: "全球路線 06", packs: ["gb", "mx", "it"], cityCount: 27 },
    { id: "global-07", label: "全球路線 07", packs: ["co", "id", "de", "ch"], cityCount: 27 },
    { id: "global-08", label: "全球路線 08", packs: ["kr", "my", "ec", "cr"], cityCount: 27 },
  ],
  [
    { id: "global-09", label: "全球路線 09", packs: ["nz", "pe", "eg", "dk"], cityCount: 27 },
    { id: "global-10", label: "全球路線 10", packs: ["ph", "th", "es", "dz"], cityCount: 27 },
    { id: "global-11", label: "全球路線 11", packs: ["vn", "fi", "ma", "gr", "bz"], cityCount: 27 },
    { id: "global-12", label: "全球路線 12", packs: ["nl", "no", "pl", "ae", "bg"], cityCount: 26 },
  ],
  [
    { id: "global-13", label: "全球路線 13", packs: ["ro", "se", "ve", "cz", "gt"], cityCount: 26 },
    { id: "global-14", label: "全球路線 14", packs: ["hr", "hu", "hn", "ie", "il", "is"], cityCount: 26 },
    { id: "global-15", label: "全球路線 15", packs: ["pa", "pt", "jo", "ni", "py", "rs"], cityCount: 26 },
    { id: "global-16", label: "全球路線 16", packs: ["sa", "tn", "si", "sk", "sv", "uy"], cityCount: 26 },
  ],
];

const DAY_MS = 86_400_000;
const TAIPEI_OFFSET_MS = 8 * 60 * 60_000;

function dateOrdinal(dateKey) {
  return Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / DAY_MS);
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

export function rotationWindow(now = Date.now()) {
  const taipei = new Date(now + TAIPEI_OFFSET_MS);
  const minute = taipei.getUTCHours() * 60 + taipei.getUTCMinutes();
  const localDate = taipei.toISOString().slice(0, 10);
  let effectiveDate = localDate;
  let slot = "morning";
  let slotIndex = 0;
  let nextLocal = new Date(`${localDate}T19:30:00Z`);
  if (minute < ROTATION_SWITCH_MINUTES[0]) {
    const previous = new Date(`${localDate}T00:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    effectiveDate = previous.toISOString().slice(0, 10);
    slot = "evening";
    slotIndex = 1;
    nextLocal = new Date(`${localDate}T07:30:00Z`);
  } else if (minute >= ROTATION_SWITCH_MINUTES[1]) {
    slot = "evening";
    slotIndex = 1;
    nextLocal = new Date(`${localDate}T00:00:00Z`);
    nextLocal.setUTCDate(nextLocal.getUTCDate() + 1);
    nextLocal.setUTCHours(7, 30, 0, 0);
  }
  const slotOffset =
    (dateOrdinal(effectiveDate) - dateOrdinal(ROTATION_EPOCH_DATE)) * 2 + slotIndex;
  return {
    scheduleDate: `${effectiveDate}-${slot === "morning" ? "am" : "pm"}`,
    localDate: effectiveDate,
    slot,
    slotOffset,
    dayOffset: Math.floor(slotOffset / 2),
    nextSwitchAt: nextLocal.getTime() - TAIPEI_OFFSET_MS,
  };
}

export function planDailyRotation(agentIds, now = Date.now()) {
  const agents = [...new Set(agentIds.map(String).filter(Boolean))].sort();
  if (!agents.length) return { ...rotationWindow(now), assignments: [] };
  const bundles = ROTATION_DAYS.flat();
  if (agents.length > bundles.length) {
    throw new Error(`自動輪替最多支援 ${bundles.length} 個啟用 Agent`);
  }
  const window = rotationWindow(now);
  const primaryDay = mod(window.slotOffset, ROTATION_DAYS.length);
  const cycle = Math.floor(window.slotOffset / ROTATION_DAYS.length);
  const selected = [];
  for (let offset = 0; selected.length < agents.length; offset += 1) {
    const routes = ROTATION_DAYS[mod(primaryDay + offset, ROTATION_DAYS.length)];
    const ordered = mod(cycle, 2) ? [...routes].reverse() : routes;
    for (const bundle of ordered) {
      if (!selected.some((item) => item.id === bundle.id)) selected.push(bundle);
      if (selected.length === agents.length) break;
    }
  }
  return {
    ...window,
    cycle,
    dayIndex: primaryDay,
    assignments: agents.map((agentId, index) => ({ agentId, ...selected[index] })),
  };
}

// Select a balanced route set for an operator-triggered redeployment without
// consuming or modifying the scheduled 07:30 / 19:30 rotation window. The
// manual set skips both the current scheduled day and the next scheduled day,
// so the next automatic switch always moves every Agent to fresh packs.
export function planManualRedeploy(agentIds, now = Date.now()) {
  const agents = [...new Set(agentIds.map(String).filter(Boolean))].sort();
  if (!agents.length) return { ...rotationWindow(now), assignments: [] };
  const bundles = ROTATION_DAYS.flat();
  if (agents.length > bundles.length) {
    throw new Error(`手動重新分配最多支援 ${bundles.length} 個啟用 Agent`);
  }
  const window = rotationWindow(now);
  const currentDay = mod(window.slotOffset, ROTATION_DAYS.length);
  const manualDay = mod(currentDay + 2, ROTATION_DAYS.length);
  const cycle = Math.floor(window.slotOffset / ROTATION_DAYS.length);
  const routes = ROTATION_DAYS[manualDay];
  const ordered = mod(cycle, 2) ? [...routes].reverse() : routes;
  return {
    ...window,
    cycle,
    dayIndex: manualDay,
    assignments: agents.map((agentId, index) => ({ agentId, ...ordered[index] })),
  };
}
