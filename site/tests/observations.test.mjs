import assert from "node:assert/strict";
import test from "node:test";
import { observationIdentity } from "../lib/observations.mjs";
import { observationStatements } from "../lib/observations.mjs";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

test("location, challenge and observation identities do not collapse", () => {
  const row = {id:"poi",start_ms:1000,level:4,type:15,challenger_count:1,challenger_capacity:35,total_power:10,finish_ms:9999};
  const first=observationIdentity(row,"a",100);
  const later=observationIdentity(row,"a",200);
  assert.equal(first.challenge,later.challenge);
  assert.notEqual(first.key,later.key);
  assert.deepEqual(first,observationIdentity(row,"a",100));
  assert.notEqual(first.challenge,observationIdentity({...row,start_ms:2000},"a",100).challenge);
  assert.equal(observationIdentity({...row,start_ms:0},"a",100).confidence,"unresolved");
});

test("history SQL preserves first observation, separates respawns and ignores retries", () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../drizzle/0015_slimy_klaw.sql", import.meta.url), "utf8"));
  sqlite.exec(readFileSync(new URL("../drizzle/0016_superb_random.sql", import.meta.url), "utf8"));
  const adapter={prepare(sql){return {bind(...values){return ()=>sqlite.prepare(sql).run(...values);}};}};
  const row={id:"p",lat:1,lng:2,start_ms:1000,level:3,type:2,challenger_count:1,challenger_capacity:35,total_power:10,finish_ms:0};
  for(const at of [100,100,200])for(const stmt of observationStatements(adapter,row,"a",at))stmt();
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM mushroom_observations").get().n,2);
  assert.equal(sqlite.prepare("SELECT first_recorded_at FROM mushroom_challenges").get().first_recorded_at,100);
  for(const stmt of observationStatements(adapter,{...row,start_ms:2000},"a",300))stmt();
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM mushroom_challenges").get().n,2);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM mushroom_locations").get().n,1);
  const bulk = Array.from({length:6},(_,i)=>({...row,id:`bulk-${i}`}));
  for(const stmt of observationStatements(adapter,bulk,"a",400))stmt();
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM mushroom_locations").get().n,7);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM mushroom_observations").get().n,9);
  sqlite.close();
});
