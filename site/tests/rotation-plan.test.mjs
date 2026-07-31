import assert from "node:assert/strict";
import test from "node:test";
import {
  planDailyRotation, ROTATION_DAYS, rotationWindow,
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

test("assigns three Agents distinct balanced routes and covers all packs in five days", () => {
  const seenBundles = new Set();
  const seenPacks = new Set();
  for (let slot = 0; slot < ROTATION_DAYS.length; slot += 1) {
    const now = Date.parse("2026-07-21T23:30:00Z") + slot * 12 * 60 * 60_000;
    const plan = planDailyRotation(["agent-3", "agent-2", "agent-1"], now);
    assert.equal(plan.assignments.length, 3);
    assert.notEqual(plan.assignments[0].id, plan.assignments[1].id);
    assert.notEqual(plan.assignments[1].id, plan.assignments[2].id);
    const counts = plan.assignments.map((item) => item.cityCount);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 2);
    assert.ok(Math.min(...counts) >= 28);
    for (const assignment of plan.assignments) {
      seenBundles.add(assignment.id);
      for (const pack of assignment.packs) {
        assert.equal(seenPacks.has(pack), false, `${pack} was assigned twice in one cycle`);
        seenPacks.add(pack);
      }
    }
  }
  assert.equal(seenBundles.size, 15);
  assert.equal(seenPacks.has("tw"), false);
  assert.equal(seenPacks.size, 67);
});

test("morning and evening assignments never repeat the previous routes or packs", () => {
  const morning = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-22T00:00:00Z"),
  );
  const evening = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-22T12:00:00Z"),
  );
  const morningRoutes = new Set(morning.assignments.map((item) => item.id));
  const morningPacks = new Set(morning.assignments.flatMap((item) => item.packs));
  for (const assignment of evening.assignments) {
    assert.equal(morningRoutes.has(assignment.id), false);
    for (const pack of assignment.packs) assert.equal(morningPacks.has(pack), false);
  }
});

test("reverses the three routes between Agents on the next cycle", () => {
  const first = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-22T00:00:00Z"),
  );
  const nextCycle = planDailyRotation(
    ["agent-1", "agent-2", "agent-3"],
    Date.parse("2026-07-24T12:00:00Z"),
  );
  assert.equal(first.assignments[0].id, nextCycle.assignments[2].id);
  assert.equal(first.assignments[1].id, nextCycle.assignments[1].id);
  assert.equal(first.assignments[2].id, nextCycle.assignments[0].id);
});
