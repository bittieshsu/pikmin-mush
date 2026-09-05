import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { catalogueStatements,CATALOGUE_STATE } from "../lib/catalogue-seed.mjs";
test("same and older catalogue revisions cannot overwrite a newer snapshot",()=>{
  const sqlite=new DatabaseSync(":memory:");
  sqlite.exec(`CREATE TABLE maintenance_state(name TEXT PRIMARY KEY,last_run_at INTEGER DEFAULT 0);
    CREATE TABLE event_spots(id TEXT PRIMARY KEY,country,city,name,lat,lng,spot_kind,reward_kind,reward_summary,
    start_at,end_at,cooldown_note,eligibility_note,coordinate_note,verification_status,source_title,source_url,last_verified_at,updated_at);`);
  sqlite.prepare("INSERT INTO maintenance_state(name) VALUES(?)").run(CATALOGUE_STATE);
  const db={prepare(sql){return{bind(...args){return()=>sqlite.prepare(sql).run(...args);}}}};
  const seed={id:"new",country:"c",city:"c",name:"n",lat:0,lng:0,spotKind:"limited",rewardKind:"mixed",
    rewardSummary:"r",startAt:0,endAt:0,cooldownNote:"",eligibilityNote:"",coordinateNote:"",verificationStatus:"community",
    sourceTitle:"user",sourceUrl:"",lastVerifiedAt:0};
  const apply=(id,rev)=>{sqlite.exec("BEGIN");for(const s of catalogueStatements(db,[{...seed,id}],rev,1))s();sqlite.exec("COMMIT");};
  apply("new",2);apply("stale",1);apply("same",2);
  assert.deepEqual(sqlite.prepare("SELECT id FROM event_spots").all().map(r=>r.id),["new"]);
  apply("next",3);
  assert.deepEqual(sqlite.prepare("SELECT id FROM event_spots").all().map(r=>r.id),["next"]);
  assert.throws(()=>catalogueStatements(db,[],4,1));
  sqlite.close();
});
