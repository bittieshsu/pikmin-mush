export const AUDIT_REASONS=['candidate','eligible','participants_full','participants_unknown','verification_pending','not_verified','wrong_level','invalid','expired','outside_window','already_sent','limit','sent','pending','uncertain','failed'];
export function cleanReportAudit(body){
 if(!body||typeof body!=='object')throw new Error('invalid audit');
 const {key,batch,phase,kind,at,window,rows}=body;
 if(!/^[a-zA-Z0-9:._-]{6,180}$/.test(key||'')||!/^[a-zA-Z0-9:._-]{6,100}$/.test(batch||'')||
 !['candidates','verification','selection','delivery'].includes(phase)||!['large','giant'].includes(kind)||
 !Number.isSafeInteger(at)||at<=0||at>Date.now()+60000||!Array.isArray(rows)||rows.length>100)throw new Error('invalid audit');
 if(!Array.isArray(window)||window.length!==2||window.some(v=>!Number.isSafeInteger(v)||v<0)||window[0]>window[1])throw new Error('invalid window');
 return {key,batch,phase,kind,at,window,rows:rows.map(r=>{
  if(!r||typeof r.id!=='string'||r.id.length>200||!AUDIT_REASONS.includes(r.reason))throw new Error('invalid audit row');
  const n=k=>Number.isFinite(r[k])?r[k]:null;
  return {id:r.id,reason:r.reason,lat:n('lat'),lng:n('lng'),level:n('level'),type:n('type'),count:n('count'),capacity:n('capacity'),verified_at:n('verified_at'),
    message_id:/^\d{1,24}$/.test(r.message_id||'')?r.message_id:''};
 })};
}
