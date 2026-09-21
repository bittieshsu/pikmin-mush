import {runtime} from './cloud';

export const POWER_REASONS = ['thermal-severe','battery-hot','low-battery','plugged-draining','sensor-unavailable','battery-cold','requested','restart-check'];
export function parsePowerPause(input: any, now=Date.now()) {
  if(!input || typeof input!=='object') return null;
  const {id,paused_at,resumed_at,reason}=input;
  if(typeof id!=='string'||!/^[A-Za-z0-9._-]{6,100}$/.test(id)||!POWER_REASONS.includes(reason)) return null;
  if(!Number.isSafeInteger(paused_at)||paused_at<1_700_000_000_000||paused_at>now+300_000) return null;
  if(resumed_at!==null && (!Number.isSafeInteger(resumed_at)||resumed_at<paused_at||resumed_at>now+300_000))return null;
  return {id,paused_at,resumed_at,reason};
}

export async function savePowerPause(agentId:string, event:NonNullable<ReturnType<typeof parsePowerPause>>) {
  // Replayed pause packets must never reopen an already completed interval.
  await runtime().DB.prepare(`INSERT INTO agent_power_pauses(key,agent_id,paused_at,resumed_at,reason,received_at)
    VALUES(?,?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET
    resumed_at=COALESCE(agent_power_pauses.resumed_at,excluded.resumed_at),received_at=excluded.received_at
    WHERE agent_power_pauses.paused_at=excluded.paused_at AND agent_power_pauses.reason=excluded.reason`)
    .bind(`${agentId}:${event.id}`,agentId,event.paused_at,event.resumed_at,event.reason,Date.now()).run();
}

export async function powerPauseHistory(from:number,to:number) {
  const rows=await runtime().DB.prepare(`SELECT p.*,a.name AS agent_name FROM agent_power_pauses p
    LEFT JOIN scan_agents a ON a.id=p.agent_id
    WHERE p.paused_at<=? AND (p.resumed_at IS NULL OR p.resumed_at>=?) ORDER BY p.paused_at DESC LIMIT 1001`)
    .bind(to,from).all();
  return {from,to,pauses:rows.results.slice(0,1000),truncated:rows.results.length>1000};
}
