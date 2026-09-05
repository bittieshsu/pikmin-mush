import assert from "node:assert/strict";
import test from "node:test";
import { discoveryWindow, UNDER_FIVE_SQL } from "../lib/query-contract.mjs";

test("absolute windows stay fixed on retry and require complete valid bounds", () => {
  const p = new URLSearchParams("discovered_from=100&discovered_to=200");
  assert.deepEqual(discoveryWindow(p, 210), discoveryWindow(p, 300));
  for (const bad of ["discovered_from=100", "discovered_from=-1&discovered_to=200",
    "discovered_from=201&discovered_to=200", "discovered_within_hours=6junk",
    "discovered_from=0&discovered_to=3000000", "discovered_from=1&discovered_to=300"])
    assert.throws(() => discoveryWindow(new URLSearchParams(bad), 210));
});
test("relative windows have both lower and upper limits", () => {
  assert.deepEqual(discoveryWindow(new URLSearchParams("discovered_within_hours=6"), 50000), {from: 28400, to: 50000});
  assert.equal(discoveryWindow(new URLSearchParams(), 50000), null);
  assert.match(UNDER_FIVE_SQL, /challenger_capacity > 0/);
  assert.match(UNDER_FIVE_SQL, /challenger_count < 5/);
});
