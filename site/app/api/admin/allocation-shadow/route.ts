import { adminAuthorized, controllerAuthorized, ensureSchema, noStoreJson, runtime } from "../../../../lib/cloud";
import { planDailyRotation } from "../../../../lib/rotation-plan.mjs";
import { COUNTRY_PACK_CATALOG } from "../../../../lib/scan-plans";
import { scoreRegions } from "../../../../lib/allocation-shadow.mjs";

export async function GET(request: Request) {
  if (!adminAuthorized(request) && !controllerAuthorized(request)) return noStoreJson({error:"forbidden"},403);
  await ensureSchema();
  const db=runtime().DB, now=Date.now(), since=now-7*86400000;
  const [effort,opportunities,coverage,agents]=await Promise.all([
    db.prepare(`SELECT t.country, COUNT(*) AS targets, SUM(e.duration_ms) AS scan_ms
      FROM scan_agent_events e JOIN scan_targets t ON e.target_id=t.id
      WHERE e.at>=? AND e.event_type IN ('target_completed','target_failed')
      AND e.at>=COALESCE((SELECT MIN(received_at)*1000 FROM mushroom_observations WHERE target_id IS NOT NULL), e.at+1)
      AND t.verification_kind='' GROUP BY t.country`).bind(since).all(),
    db.prepare(`SELECT t.country,COUNT(DISTINCT o.challenge_key) AS eligible_unique
      FROM mushroom_observations o JOIN scan_targets t ON o.target_id=t.id
      WHERE o.received_at>=? AND o.level IN (3,4) AND o.challenger_count>=0
      AND o.challenger_count<5 AND o.challenger_capacity>0
      AND o.challenger_count<=o.challenger_capacity AND t.verification_kind=''
      GROUP BY t.country`).bind(Math.floor(since/1000)).all(),
    db.prepare("SELECT MIN(received_at) AS since FROM mushroom_observations WHERE target_id IS NOT NULL").first<{since:number}>(),
    db.prepare("SELECT id FROM scan_agents WHERE enabled=1 ORDER BY id").all<{id:string}>(),
  ]);
  const counts=new Map(opportunities.results.map(r=>[r.country,Number(r.eligible_unique)]));
  const hours=coverage?.since ? Math.max(0,(now-coverage.since*1000)/3600000):0;
  const planned=planDailyRotation(agents.results.map(a=>a.id),now);
  const allowedPacks=new Set(planned.assignments.flatMap(r=>r.packs));
  const countries=new Set(COUNTRY_PACK_CATALOG.filter(p=>allowedPacks.has(p.id)).map(p=>p.name));
  const regions=scoreRegions(effort.results.filter(r=>countries.has(String(r.country)))
      .map(r=>({...r,eligible_unique:counts.get(r.country)??0})),hours);
  return noStoreJson({mode:"shadow",live_routes_changed:false,observed_hours:hours,
    exploration_floor:0.2, canary_ready:regions.filter(r=>r.enough_evidence).length>=2,
    note:"只建議當前跨日規則允許的區域；滿24小時且有足夠樣本後才評估單機實驗，不自動改全機隊。未歸屬目標的舊觀測不納入。",
    regions});
}
