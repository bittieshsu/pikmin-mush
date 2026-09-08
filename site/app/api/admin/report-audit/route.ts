import {adminAuthorized,noStoreJson,runtime} from '../../../../lib/cloud';
import {AUDIT_SUMMARY_SQL,AUDIT_REASON_SQL} from '../../../../lib/admin-report-view.mjs';
export async function GET(request:Request){
 if(!adminAuthorized(request))return noStoreJson({error:'forbidden'},403);
 const params=new URL(request.url).searchParams;
 const batch=params.get('batch')||'';
 if(batch&&!/^[a-zA-Z0-9:._-]{6,100}$/.test(batch))return noStoreJson({error:'invalid batch'},400);
 if(params.get('view')==='summary'){
   const db=runtime().DB;
   const kind=params.get('kind')==='giant'?'giant':'large';
   const batches=await db.prepare(`SELECT batch,MAX(at) AS at FROM report_audit_events
     GROUP BY batch ORDER BY at DESC,batch DESC LIMIT 30`).all<{batch:string;at:number}>();
   const selected=batch||batches.results[0]?.batch||'';
   if(!selected)return noStoreJson({batch:'',batches:[],phases:[],reasons:[]});
   const [phases,reasons]=await Promise.all([
     db.prepare(AUDIT_SUMMARY_SQL).bind(selected).all(),
     db.prepare(AUDIT_REASON_SQL).bind(selected,kind).all(),
   ]);
   return noStoreJson({batch:selected,batches:batches.results,phases:phases.results,reasons:reasons.results});
 }
 const page=Math.max(0,Math.min(10000,Number.parseInt(params.get('page')||'0',10)||0));
 const result=await runtime().DB.prepare(`SELECT payload FROM report_audit_events e WHERE
   e.at=(SELECT MAX(latest.at) FROM report_audit_events latest WHERE latest.batch=e.batch AND latest.phase=e.phase AND latest.kind=e.kind)
   ${batch?'AND e.batch=?':''} ORDER BY at DESC,key DESC LIMIT 51 OFFSET ?`)
   .bind(...(batch?[batch]:[]),page*50).all<{payload:string}>();
 return noStoreJson({events:result.results.slice(0,50).map(row=>JSON.parse(row.payload)),page,has_more:result.results.length>50,retention_days:30});
}
