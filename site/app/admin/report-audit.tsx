'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useVisiblePolling} from './use-visible-polling';
import {deliveryLabel} from '../../lib/admin-report-view.mjs';
import styles from './admin.module.css';
type AuditRow={id:string;reason:string;lat:number|null;lng:number|null;count:number|null;capacity:number|null;message_id:string};
type Event={key:string;batch:string;phase:string;kind:string;at:number;window:number[];rows:AuditRow[]};
type Phase={phase:string;kind:string;at:number;window_start:number;window_end:number;items:number;eligible:number;confirmed:number;uncertain:number};
type Summary={batch:string;batches:{batch:string;at:number}[];phases:Phase[];reasons:{reason:string;items:number}[]};
const phases=[['candidates','凍結候選'],['verification','複查紀錄'],['selection','條件篩選'],['delivery','Discord 發送']];
const reasons:Record<string,string>={candidate:'待複查',eligible:'符合發布',participants_full:'已滿五人',participants_unknown:'人數未知',verification_pending:'複查未完成',not_verified:'未取得有效複查',wrong_level:'等級已改變',invalid:'失效',expired:'已結束',outside_window:'超出時間範圍',already_sent:'已發布過',limit:'達巨菇上限',sent:'已送達',pending:'等待發送',uncertain:'送達需核對',failed:'失敗'};
const time=(n:number)=>n?new Date(n).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false}):'—';
export default function ReportAudit(){
 const [summary,setSummary]=useState<Summary|null>(null),[batch,setBatch]=useState(''),[kind,setKind]=useState('large');
 const [error,setError]=useState(''),[loading,setLoading]=useState(false);
 const [batchQuery,setBatchQuery]=useState('');
 const [events,setEvents]=useState<Event[]>([]),[page,setPage]=useState(0),[more,setMore]=useState(false),[loaded,setLoaded]=useState(false),[detailError,setDetailError]=useState('');
 const requestVersion=useRef(0),detailVersion=useRef(0),latestBatch=useRef('');
 const load=useCallback(async()=>{
   const version=++requestVersion.current;setLoading(true);
   try{const r=await fetch('/api/admin/report-audit?'+new URLSearchParams({view:'summary',batch,kind}),{cache:'no-store'});
     if(!r.ok)throw Error();const data=await r.json();if(version!==requestVersion.current)return;
     if(latestBatch.current!==data.batch){++detailVersion.current;setEvents([]);setLoaded(false);setPage(0);setMore(false);latestBatch.current=data.batch;}
     setSummary(data);setError('');
   }catch{if(version===requestVersion.current)setError('情報紀錄暫時無法更新；保留最近一次成功結果。');}
   finally{if(version===requestVersion.current)setLoading(false);}
 },[batch,kind]);
 useVisiblePolling(load,60_000);
 useEffect(()=>()=>{++requestVersion.current;++detailVersion.current;},[]);
 const change=(nextBatch:string,nextKind:string)=>{++requestVersion.current;++detailVersion.current;setBatch(nextBatch);setKind(nextKind);setSummary(null);setEvents([]);setLoaded(false);setPage(0);setMore(false);setError('');};
 const selected=summary?.batch||batch;
 async function details(next=0){
   if(!selected)return;const version=++detailVersion.current;setLoading(true);
   try{const r=await fetch('/api/admin/report-audit?'+new URLSearchParams({batch:selected,page:String(next)}),{cache:'no-store'});
     if(!r.ok)throw Error();const d=await r.json();if(version!==detailVersion.current)return;
     setEvents(d.events);setMore(d.has_more);setPage(next);setLoaded(true);setDetailError('');
   }catch{if(version===detailVersion.current)setDetailError('明細更新失敗；保留上次結果。');}
   finally{if(version===detailVersion.current)setLoading(false);}
 }
 const current=summary?.phases.filter(p=>p.kind===kind)||[];
 const delivery=current.find(p=>p.phase==='delivery');
 const selection=current.find(p=>p.phase==='selection');
 return <section className={styles.reportView} aria-label="情報發布明細">
   <div className={styles.overviewHeading}><h2>情報發布</h2><button type="button" onClick={()=>void load()} disabled={loading}>重新整理</button></div>
   <div className={styles.reportControls}>
     <label>批次<select value={batch} onChange={e=>change(e.target.value,kind)}><option value="">最近一批</option>{summary?.batches.map(b=><option key={b.batch} value={b.batch}>{b.batch}</option>)}{batch&&!summary?.batches.some(b=>b.batch===batch)&&<option value={batch}>{batch}</option>}</select></label>
     <div>{[['large','大菇'],['giant','活動巨菇']].map(([id,label])=><button type="button" key={id} aria-pressed={kind===id} onClick={()=>change(batch,id)}>{label}</button>)}</div>
   </div>
   <details className={styles.reasonDisclosure}><summary>查詢其他批次</summary><form onSubmit={e=>{e.preventDefault();change(batchQuery.trim(),kind);}}><label>批次識別碼<input value={batchQuery} onChange={e=>setBatchQuery(e.target.value)} maxLength={160} required placeholder="貼上完整批次識別碼"/></label><button type="submit">查詢</button></form></details>
   {error&&<p role="status" className={styles.inlineWarning}>{error}</p>}
   {!summary?<p>讀取情報紀錄…</p>:!summary.batch?<p>尚無紀錄，不代表當期為零筆。</p>:<>
   <div className={styles.overviewPanel}>
     <h3>{deliveryLabel(delivery)}</h3>
     <p className={styles.caption}>{selected}</p>
     <ol className={styles.reportTimeline}>{phases.map(([id,label])=>{
       const p=current.find(x=>x.phase===id);const giantSkip=kind==='giant'&&id==='verification';
       return <li key={id} data-recorded={Boolean(p)}><span>{label}</span><strong>{giantSkip?'不適用':!p?'尚無紀錄':id==='delivery'?`${p.confirmed} / ${p.items} 段已確認`:id==='selection'?`${p.eligible} / ${p.items} 個符合`:`${p.items} 個有紀錄`}</strong>{p&&<small>紀錄更新 {time(p.at)}</small>}</li>;
     })}</ol>
     <details className={styles.reasonDisclosure}><summary>排除原因{selection?` · ${Math.max(0,selection.items-selection.eligible)} 個`:''}</summary>
       {!selection?<p>尚無篩選紀錄。</p>:summary.reasons.filter(r=>r.reason!=='eligible').map(r=><div className={styles.reasonRow} key={r.reason}><span>{reasons[r.reason]||r.reason}</span><strong>{r.items}</strong></div>)}
       {selection&&selection.items===selection.eligible&&<p>這批篩選紀錄沒有排除項目。</p>}
     </details>
     {current.length>0&&<p className={styles.caption}>資料窗口 {time(current[0].window_start*1000)} ～ {time(current[0].window_end*1000)}（台北）</p>}
   </div>
   <details key={selected+kind} className={styles.disclosure} onToggle={e=>{if(e.currentTarget.open&&!loaded)void details();}}><summary>完整明細與送達編號</summary>
     {detailError&&<p role="status">{detailError}</p>}
     {loaded&&!events.some(e=>e.kind===kind)&&<p>本頁沒有此種類明細；可翻頁查看，摘要統計不受分頁影響。</p>}
     {events.filter(e=>e.kind===kind).map(e=><details key={e.key}><summary>{phases.find(p=>p[0]===e.phase)?.[1]} · {e.rows.length} 筆 · {time(e.at)}</summary>{e.rows.map((r,i)=><p key={r.id+':'+i} className={styles.auditRow}>{reasons[r.reason]||r.reason} · {r.count??'?'} / {r.capacity??'?'} 人<br/>{r.lat??'—'}, {r.lng??'—'}{r.message_id&&<><br/>Discord {r.message_id}</>}</p>)}</details>)}
     <div className={styles.reportPagination}><button type="button" disabled={loading||!page} onClick={()=>void details(page-1)}>上一頁</button><span>第 {page+1} 頁</span><button type="button" disabled={loading||!more} onClick={()=>void details(page+1)}>下一頁</button></div>
   </details>
   </>}
   <p className={styles.caption}>紀錄保留 30 天。啟用前的紀錄不補造；同步可能延遲。「有複查紀錄」不等於全部成功，「送達」以訊息編號為準。</p>
 </section>;
}
