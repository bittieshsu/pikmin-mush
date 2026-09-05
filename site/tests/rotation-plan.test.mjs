import assert from "node:assert/strict";
import test from "node:test";
import {
  planDailyRotation, planManualRedeploy, ROTATION_DAYS, rotationWindow,
} from "../lib/rotation-plan.mjs";

test("switches at 07:30 and 19:30 Asia/Taipei", () => {
  const beforeMorning = rotationWindow(Date.parse("2026-07-22T23:29:59Z"));
  const morning = rotationWindow(Date.parse("2026-07-22T23:30:00Z"));
  const beforeEvening = rotationWindow(Date.parse("2026-07-23T11:29:59Z"));
  const evening = rotationWindow(Date.parse("2026-07-23T11:30:00Z"));
  assert.equal(beforeMorning.scheduleDate, "2026-07-22-pm");
  assert.equal(morning.scheduleDate, "2026-07-23-am");
  assert.equal(beforeEvening.scheduleDate, "2026-07-23-am");
  assert.equal(evening.scheduleDate, "2026-07-23-pm");
  assert.equal(morning.nextSwitchAt, Date.parse("2026-07-23T11:30:00Z"));
  assert.equal(evening.nextSwitchAt, Date.parse("2026-07-23T23:30:00Z"));
});

test("manual redeploy avoids both current and next scheduled routes", () => {
  const now = Date.parse("2026-08-03T05:00:00Z");
  const agents = ["primary", "agent-2", "agent-3"];
  const current = planDailyRotation(agents, now);
  const manual = planManualRedeploy(agents, now);
  const next = planDailyRotation(agents, current.nextSwitchAt);
  const currentIds = new Set(current.assignments.map((item) => item.id));
  const nextIds = new Set(next.assignments.map((item) => item.id));
  assert.equal(manual.assignments.length, 3);
  assert.equal(manual.assignments.every((item) => !currentIds.has(item.id)), true);
  assert.equal(manual.assignments.every((item) => !nextIds.has(item.id)), true);
  assert.ok(manual.assignments.every((item) => [35, 36, 37, 38].includes(item.cityCount)));
});

test("assigns three Agents distinct balanced priority routes without Taiwan or Japan", () => {
  const seenBundles = new Set();
  const seenPacks = new Set();
  for (let slot = 0; slot < ROTATION_DAYS.length; slot += 1) {
    const now = Date.parse("2026-07-21T23:30:00Z") + slot * 12 * 60 * 60_000;
    const plan = planDailyRotation(["agent-3", "agent-2", "agent-1"], now);
    assert.equal(plan.assignments.length, 3);
    assert.equal(new Set(plan.assignments.map((item) => item.id)).size, 3);
    const counts = plan.assignments.map((item) => item.cityCount);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 3);
    assert.ok(Math.min(...counts) >= 35);
    const slotPacks = new Set();
    for (const assignment of plan.assignments) {
      seenBundles.add(assignment.id);
      for (const pack of assignment.packs) {
        assert.equal(slotPacks.has(pack), false, `${pack} was assigned twice in one slot`);
        slotPacks.add(pack);
        seenPacks.add(pack);
      }
    }
  }
  assert.equal(seenBundles.size, 12);
  assert.equal(seenPacks.has("tw"), false);
  assert.equal(seenPacks.has("jp"), false);
  assert.ok(seenPacks.has("in"));
  assert.ok(seenPacks.has("us-east"));
  assert.ok(seenPacks.has("mx"));
  assert.ok(seenPacks.has("br"));
  assert.ok(seenPacks.has("nz"));
  assert.ok(seenPacks.has("ae"));
  assert.ok(seenPacks.has("ro"));
  assert.ok(seenPacks.has("fi"));
  assert.ok(seenPacks.has("us-west"));
});

test("each scheduled route is already safely in its local new day", () => {
  // 07:30 Taipei is the risky boundary: UTC+1 Europe would only be 00:30,
  // so route selection must use the curated UTC+2-or-later groups instead.
  const morning = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-09-01T23:30:00Z"),
  );
  assert.equal(morning.slot, "morning");
  assert.ok(morning.assignments.every((route) => route.id.startsWith("morning-")));

  // 19:30 Taipei maps to the morning of the same local date in the Americas.
  const evening = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-09-01T11:30:00Z"),
  );
  assert.equal(evening.slot, "evening");
  assert.ok(evening.assignments.every((route) => route.id.startsWith("evening-")));
});

test("morning and evening assignments never repeat the previous routes", () => {
  const morning = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-22T00:00:00Z"),
  );
  const evening = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-22T12:00:00Z"),
  );
  const morningRoutes = new Set(morning.assignments.map((item) => item.id));
  for (const assignment of evening.assignments) {
    assert.equal(morningRoutes.has(assignment.id), false);
  }
});

test("reverses the three routes between Agents on the next cycle", () => {
  const first = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-22T00:00:00Z"),
  );
  const nextCycle = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-24T00:00:00Z"),
  );
  assert.equal(first.assignments[0].id, nextCycle.assignments[2].id);
  assert.equal(first.assignments[1].id, nextCycle.assignments[1].id);
  assert.equal(first.assignments[2].id, nextCycle.assignments[0].id);
});
