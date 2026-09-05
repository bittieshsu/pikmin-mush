export const ROTATION_TIME_ZONE = "Asia/Taipei";
export const ROTATION_SWITCH_MINUTES = [7 * 60 + 30, 19 * 60 + 30];
export const ROTATION_SWITCH_MINUTE = ROTATION_SWITCH_MINUTES[0];
export const ROTATION_EPOCH_DATE = "2026-07-22";

// A route is selected by the city's *local calendar date*, not merely by its
// longitude.  At the 07:30 Taipei switch we only use locations that have had
// at least an hour of the new local day (Asia, Oceania, Gulf and UTC+2 Europe).
// At 19:30 Taipei the same guard selects the Americas.  This prevents a new
// monthly/event mushroom type from being mixed with the previous-day type.
const MORNING_ROTATION_DAYS = [
  [
    { id: "morning-01", label: "跨日東半球 01", packs: ["in", "kr", "th", "my"], cityCount: 36 },
    { id: "morning-02", label: "跨日東半球 02", packs: ["id", "ph", "vn", "au", "qa"], cityCount: 37 },
    { id: "morning-03", label: "跨日東半球 03", packs: ["nz", "ae", "sa", "fi", "ro", "bg", "sg", "il"], cityCount: 38 },
  ],
  [
    { id: "morning-04", label: "跨日東半球 04", packs: ["in", "kr", "ph", "qa", "sg", "ae"], cityCount: 36 },
    { id: "morning-05", label: "跨日東半球 05", packs: ["id", "vn", "au", "my", "il"], cityCount: 38 },
    { id: "morning-06", label: "跨日東半球 06", packs: ["nz", "th", "fi", "ro", "bg", "jo"], cityCount: 36 },
  ],
];

const EVENING_ROTATION_DAYS = [
  [
    { id: "evening-01", label: "跨日西半球 01", packs: ["us-east", "mx", "br", "bz"], cityCount: 36 },
    { id: "evening-02", label: "跨日西半球 02", packs: ["us-central", "ca", "ec", "co", "hn"], cityCount: 38 },
    { id: "evening-03", label: "跨日西半球 03", packs: ["us-west", "ar", "pe", "cl"], cityCount: 38 },
  ],
  [
    { id: "evening-04", label: "跨日西半球 04", packs: ["us-east", "gt", "sv", "ni", "cr", "pa", "bz"], cityCount: 36 },
    { id: "evening-05", label: "跨日西半球 05", packs: ["us-central", "mx", "br", "uy"], cityCount: 38 },
    { id: "evening-06", label: "跨日西半球 06", packs: ["us-west", "ca", "ar", "co"], cityCount: 38 },
  ],
];

// Kept as an export for callers that display the whole route catalogue.
export const ROTATION_DAYS = [...MORNING_ROTATION_DAYS, ...EVENING_ROTATION_DAYS];

const PACK_TIME_ZONES = {
  in: "Asia/Kolkata", kr: "Asia/Seoul", th: "Asia/Bangkok", my: "Asia/Kuala_Lumpur",
  sg: "Asia/Singapore", id: "Asia/Jakarta", ph: "Asia/Manila", vn: "Asia/Ho_Chi_Minh",
  au: "Australia/Perth", nz: "Pacific/Auckland", ae: "Asia/Dubai", sa: "Asia/Riyadh",
  il: "Asia/Jerusalem", jo: "Asia/Amman", qa: "Asia/Qatar", fi: "Europe/Helsinki",
  ro: "Europe/Bucharest", bg: "Europe/Sofia",
  br: "America/Sao_Paulo", ec: "America/Guayaquil", ar: "America/Argentina/Buenos_Aires",
  co: "America/Bogota", pe: "America/Lima", cl: "America/Santiago", uy: "America/Montevideo",
  gt: "America/Guatemala", hn: "America/Tegucigalpa", sv: "America/El_Salvador",
  ni: "America/Managua", cr: "America/Costa_Rica", pa: "America/Panama", mx: "America/Mexico_City",
  bz: "America/Belize", "us-east": "America/New_York", "us-central": "America/Chicago",
  "us-west": "America/Los_Angeles", ca: "America/Toronto",
};

const DAY_MS = 86_400_000;
const TAIPEI_OFFSET_MS = 8 * 60 * 60_000;

function dateOrdinal(dateKey) {
  return Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / DAY_MS);
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function datePartsInTimeZone(now, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(now));
  const value = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    minute: Number(value("hour")) * 60 + Number(value("minute")),
    timeZone,
  };
}

function assertPacksHaveCrossedMidnight(packs, window, now) {
  // A one-hour buffer avoids a locale/clock boundary exactly at 00:00.  All
  // curated packs have a representative IANA zone; multi-zone countries in
  // these routes are deliberately wholly on the safe side of the boundary.
  const notReady = packs.map((pack) => {
    const timeZone = PACK_TIME_ZONES[pack];
    if (!timeZone) return `${pack}(缺少時區)`;
    const local = datePartsInTimeZone(now, timeZone);
    return local.date === window.localDate && local.minute >= 60
      ? null
      : `${pack}(${local.date} ${String(Math.floor(local.minute / 60)).padStart(2, "0")}:${String(local.minute % 60).padStart(2, "0")})`;
  }).filter(Boolean);
  if (notReady.length) {
    throw new Error(`尚未安全跨日，拒絕派送：${notReady.join("、")}`);
  }
}

function routeDaysFor(window) {
  return window.slot === "morning" ? MORNING_ROTATION_DAYS : EVENING_ROTATION_DAYS;
}

function assignmentsFor(agentIds, window, dayIndex, cycle, now) {
  const routes = routeDaysFor(window)[dayIndex];
  const ordered = mod(cycle, 2) ? [...routes].reverse() : routes;
  const selected = ordered.slice(0, agentIds.length);
  for (const route of selected) assertPacksHaveCrossedMidnight(route.packs, window, now);
  return agentIds.map((agentId, index) => ({ agentId, ...selected[index] }));
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
  const window = rotationWindow(now);
  const days = routeDaysFor(window);
  if (agents.length > days[0].length) {
    throw new Error(`自動輪替最多支援 ${days[0].length} 個啟用 Agent`);
  }
  const primaryDay = mod(window.dayOffset, days.length);
  const cycle = Math.floor(window.dayOffset / days.length);
  return {
    ...window,
    cycle,
    dayIndex: primaryDay,
    assignments: assignmentsFor(agents, window, primaryDay, cycle, now),
  };
}

// Select a balanced route set for an operator-triggered redeployment without
// consuming or modifying the scheduled 07:30 / 19:30 rotation window. The
// manual set skips both the current scheduled day and the next scheduled day,
// so the next automatic switch always moves every Agent to fresh packs.
export function planManualRedeploy(agentIds, now = Date.now()) {
  const agents = [...new Set(agentIds.map(String).filter(Boolean))].sort();
  if (!agents.length) return { ...rotationWindow(now), assignments: [] };
  const window = rotationWindow(now);
  const days = routeDaysFor(window);
  if (agents.length > days[0].length) {
    throw new Error(`手動重新分配最多支援 ${days[0].length} 個啟用 Agent`);
  }
  const currentDay = mod(window.dayOffset, days.length);
  const manualDay = mod(currentDay + 1, days.length);
  const cycle = Math.floor(window.dayOffset / days.length);
  return {
    ...window,
    cycle,
    dayIndex: manualDay,
    assignments: assignmentsFor(agents, window, manualDay, cycle, now),
  };
}
