export const AUDIT_LATEST_SQL = `e.at=(SELECT MAX(latest.at) FROM report_audit_events latest
  WHERE latest.batch=e.batch AND latest.phase=e.phase AND latest.kind=e.kind)`;
export const AUDIT_SUMMARY_SQL = `SELECT e.phase,e.kind,MAX(e.at) AS at,
  MIN(json_extract(e.payload,'$.window[0]')) AS window_start,
  MAX(json_extract(e.payload,'$.window[1]')) AS window_end,
  COUNT(DISTINCT json_extract(j.value,'$.id')) AS items,
  COUNT(DISTINCT CASE WHEN json_extract(j.value,'$.reason')='eligible' THEN json_extract(j.value,'$.id') END) AS eligible,
  COUNT(DISTINCT CASE WHEN json_extract(j.value,'$.reason')='sent' AND COALESCE(json_extract(j.value,'$.message_id'),'')!='' THEN json_extract(j.value,'$.id') END) AS confirmed,
  COUNT(DISTINCT CASE WHEN json_extract(j.value,'$.reason')='uncertain' THEN json_extract(j.value,'$.id') END) AS uncertain
  FROM report_audit_events e LEFT JOIN json_each(e.payload,'$.rows') j ON 1=1
  WHERE e.batch=? AND ${AUDIT_LATEST_SQL} GROUP BY e.phase,e.kind`;
export const AUDIT_REASON_SQL = `SELECT json_extract(j.value,'$.reason') AS reason,
  COUNT(DISTINCT json_extract(j.value,'$.id')) AS items FROM report_audit_events e,
  json_each(e.payload,'$.rows') j WHERE e.batch=? AND e.kind=? AND e.phase='selection'
  AND ${AUDIT_LATEST_SQL} GROUP BY reason`;
export function deliveryLabel(phase) {
  if(!phase)return '尚無送達紀錄';
  if(phase.items>0 && phase.confirmed===phase.items)return `已確認送達 ${phase.confirmed} 段訊息`;
  if(phase.uncertain>0)return '送達不明，需核對';
  return '尚未全部確認送達';
}
