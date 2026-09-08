export const ADMIN_PAGES = [
  {id:'overview', label:'總覽', icon:'◫'}, {id:'fleet', label:'機隊', icon:'♧'},
  {id:'reports', label:'情報', icon:'➤'}, {id:'more', label:'更多', icon:'☰'},
];
export function agentState(agent) {
  if (!agent.enabled) return '已停用';
  if (agent.paused) return '已暫停';
  if (!agent.online) return '離線';
  if (['critical','warning','version_mismatch'].includes(agent.health?.status)) return '待確認';
  return agent.current_target_id ? '掃描中' : '待命';
}
export function needsAttention(agent) {
  return agent.enabled && !agent.paused && (!agent.online ||
    ['critical','warning','version_mismatch'].includes(agent.health?.status));
}
export function ageLabel(at, now) {
  if (!Number.isFinite(at) || at <= 0) return '尚未回報';
  const seconds = Math.max(0, Math.floor((now-at)/1000));
  return seconds < 60 ? `${seconds} 秒前` : seconds < 3600 ? `${Math.floor(seconds/60)} 分鐘前` : `${Math.floor(seconds/3600)} 小時前`;
}
// Schedule only after completion: slow requests never accumulate a polling queue.
export function pollWhileVisible(task, delay, doc, timers) {
  let stopped=false, timer=null, running=false;
  const schedule=()=>{if(!stopped)timer=timers.setTimeout(tick,delay);};
  async function tick(){
    if(stopped || running)return;
    if(timer!==null)timers.clearTimeout(timer);
    if(doc.hidden){schedule();return;}
    running=true;
    try{await task();}catch{/* The caller retains its last successful data and error. */}
    finally{running=false;schedule();}
  }
  const visible=()=>{if(!doc.hidden)void tick();};
  doc.addEventListener('visibilitychange',visible);
  timer=timers.setTimeout(tick,0);
  return ()=>{stopped=true;if(timer!==null)timers.clearTimeout(timer);doc.removeEventListener('visibilitychange',visible);};
}
