'use client';
import {useState} from 'react';
type Event={key:string;batch:string;phase:string;kind:string;at:number;window:number[];rows:Array<{id:string;reason:string;lat:number|null;lng:number|null;count:number|null;capacity:number|null;message_id:string}>};
const reasons:Record<string,string>={candidate:'待複查',eligible:'符合發布',participants_full:'已滿五人',participants_unknown:'人數未知',verification_pending:'複查未完成',not_verified:'未取得有效複查',wrong_level:'等級已改變',invalid:'失效',expired:'已結束',outside_window:'超出時間範圍',already_sent:'已發布過',limit:'達巨菇上限',sent:'已送達',pending:'等待發送',uncertain:'送達需核對',failed:'失敗'};
export default function ReportAudit(){
 const [events,setEvents]=useState<Event[]>([]),[batch,setBatch]=useState(''),[error,setError]=useState(''),[page,setPage]=useState(0),[more,setMore]=useState(false),[loaded,setLoaded]=useState(false);
 async function load(next=0){try{const r=await fetch('/api/admin/report-audit?'+new URLSearchParams({batch,page:String(next)}));if(!r.ok)throw Error('讀取失敗');const d=await r.json();setEvents(d.events);setMore(d.has_more);setPage(next);setLoaded(true);setError('');}catch{setError('暫時無法取得發布紀錄；保留上次結果');}}
 return <section style={{padding:20,border:'1px solid #cbd5c0',borderRadius:12,marginTop:20}}>
 <h2>情報發布明細</h2><p>候選 → 複查 → 篩選 → 發送。保留 30 天；啟用前的紀錄不補造。每列事件最多 100 筆。</p>
 <input aria-label="情報批次" placeholder="批次（留空查看全部）" value={batch} onChange={e=>setBatch(e.target.value)}/><button onClick={()=>load()}>讀取／更新</button>
 {error&&<p role="alert">{error}</p>}{loaded&&!events.length&&<p>尚無紀錄（不代表當期為零筆）</p>}
 {events.map(e=><details key={e.key}><summary>{e.batch}・{e.kind==='large'?'大菇':'巨菇'}・{({candidates:'候選',verification:'複查',selection:'篩選',delivery:'發送'} as Record<string,string>)[e.phase]}・{e.rows.length} 筆</summary>
 <p>窗口：{new Date(e.window[0]*1000).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})} ～ {new Date(e.window[1]*1000).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})}（台北）</p>
 {e.rows.map((r,i)=><div key={r.id+':'+i}>{reasons[r.reason]||r.reason}・{r.count??'?'} / {r.capacity??'?'} 人・{r.lat??'—'}, {r.lng??'—'} {r.message_id&&`Discord ${r.message_id}`}</div>)}</details>)}
 <button disabled={!page} onClick={()=>load(page-1)}>上一頁</button><button disabled={!more} onClick={()=>load(page+1)}>下一頁</button>
 </section>;
}
