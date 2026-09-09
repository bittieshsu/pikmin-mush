import {TARGET_HISTORY_CTE} from './target-history.mjs';

export function comparisonWindow(params, now, epoch) {
  const explicit=params.has('from') || params.has('to');
  const from=explicit?Number(params.get('from')):Math.max(now-86400000,epoch);
  const to=explicit?Number(params.get('to')):now;
  if ((explicit && (!params.has('from') || !params.has('to'))) ||
      !Number.isSafeInteger(from) || !Number.isSafeInteger(to) ||
      from<Math.max(epoch,now-7*86400000) || to>now || to-from<3600000 || to-from>7*86400000)
    throw new RangeError('Use an absolute millisecond window of 1h–7d inside retained corrected history');
  return {from,to,hours:(to-from)/3600000};
}

// Receipt and target-completion windows are bounded on BOTH sides. A retry ACK
// cannot inflate the denominator, and queue archives cannot double join a target.
export function comparisonSql(byCountry=false) {
  const country=byCountry?'country':"''";
  return `${TARGET_HISTORY_CTE}, ranked_events AS (
    SELECT e.*,t.country,ROW_NUMBER() OVER(PARTITION BY e.agent_id,e.target_id ORDER BY e.at DESC,e.id DESC) AS rn
    FROM scan_agent_events e JOIN durable_targets t ON t.id=e.target_id
    WHERE e.at>=?1 AND e.at<?2 AND e.event_type IN ('target_completed','target_failed')
      AND t.verification_kind=''
  ), events AS (SELECT *,CASE WHEN json_valid(detail) THEN detail ELSE '{}' END AS json_detail
    FROM ranked_events WHERE rn=1), effort AS (
    SELECT agent_id,${country} AS region,COUNT(*) AS targets,
      SUM(event_type='target_completed') AS completed_targets,
      SUM(event_type='target_failed') AS failed_targets,
      SUM(rows=0) AS zero_row_targets, SUM(MAX(0,duration_ms)) AS scan_ms,
      SUM(json_extract(json_detail,'$.evidence.version')=1) AS measured_targets,
      SUM(COALESCE(json_extract(json_detail,'$.evidence.restarts'),0)) AS restarts,
      SUM(COALESCE(json_extract(json_detail,'$.evidence.upload_failures'),0)) AS upload_failures
    FROM events GROUP BY agent_id,region
  ), observations AS (
    SELECT o.*,e.country,c.identity_confidence
    FROM mushroom_observations o JOIN events e ON e.target_id=o.target_id AND e.agent_id=o.agent_id
    JOIN mushroom_challenges c ON c.key=o.challenge_key
    WHERE o.received_at>=CAST((?1+999)/1000 AS INTEGER) AND o.received_at<CAST((?2+999)/1000 AS INTEGER)
      AND o.received_at*1000>=e.at-MAX(0,e.duration_ms)
      AND o.received_at*1000<=e.at AND e.event_type='target_completed'
      AND o.level IN (3,4) AND o.challenger_capacity>0 AND o.challenger_count>=0
      AND o.challenger_count<5 AND o.challenger_count<=o.challenger_capacity
      AND (o.finish_ms=0 OR o.finish_ms>o.received_at*1000)
  ), opportunities AS (
    SELECT agent_id,${country} AS region,
      COUNT(DISTINCT CASE WHEN identity_confidence='challenge_start' THEN challenge_key END) AS eligible_unique,
      COUNT(DISTINCT CASE WHEN identity_confidence='challenge_start' AND level=3 THEN challenge_key END) AS eligible_large,
      COUNT(DISTINCT CASE WHEN identity_confidence='challenge_start' AND level=4 THEN challenge_key END) AS eligible_giant,
      COUNT(DISTINCT CASE WHEN identity_confidence<>'challenge_start' THEN challenge_key END) AS unresolved_unique
    FROM observations GROUP BY agent_id,region
  ) SELECT f.*,COALESCE(o.eligible_unique,0) AS eligible_unique,
    COALESCE(o.eligible_large,0) AS eligible_large,COALESCE(o.eligible_giant,0) AS eligible_giant,
    COALESCE(o.unresolved_unique,0) AS unresolved_unique
    FROM effort f LEFT JOIN opportunities o ON o.agent_id=f.agent_id AND o.region=f.region
    ORDER BY f.agent_id,f.region`;
}

export function comparisonRates(row,hours) {
  const targets=Number(row.targets),scanHours=Number(row.scan_ms)/3600000;
  return {...row,scan_hours:scanHours,
    eligible_per_wall_hour:Number(row.eligible_unique)/hours,
    eligible_per_scan_hour:scanHours?Number(row.eligible_unique)/scanHours:null,
    success_rate:targets?Number(row.completed_targets)/targets:null,
    zero_row_rate:targets?Number(row.zero_row_targets)/targets:null,
    diagnostic_coverage:targets?Number(row.measured_targets??0)/targets:null};
}

export async function buildAllocationComparison(db,window) {
  const [agents,regions]=await Promise.all([false,true].map(async country=>{
    const result=await db.prepare(comparisonSql(country)).bind(window.from,window.to).all();
    return result.results.map(row=>comparisonRates(row,window.hours));
  }));
  return {measurement_version:1,window_start:window.from,window_end:window.to,
    window_hours:window.hours,complete_24h:window.hours>=24,agents,regions,
    activation_ready:false,
    note:'Historical eligible-at-receipt opportunities, not current availability or exclusive fleet discoveries. Resolved challenge identities only; unresolved counted separately. Normal completed/failed targets only; rechecks excluded. Zero rows remain unknown. Window is [from,to). Rates alone do not establish comparability or authorize canary activation.'};
}
