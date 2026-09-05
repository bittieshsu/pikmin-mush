// Zero appended TSV rows do not prove an empty map or even a successful hook.
export function classifyScanOutcome({ok,rows,outcome=""}) {
  if (!ok) return ["refresh_timeout","extraction_failed","upload_failed"].includes(outcome)
    ? outcome : "failed_unclassified";
  if (Number(rows)>0) return "captured";
  if (outcome === "duplicate" || outcome === "empty") return outcome;
  return "zero_unclassified";
}
export const SCAN_OUTCOME_LABELS = {
  captured:"已擷取資料", duplicate:"重複資料", empty:"已確認空點",
  zero_unclassified:"無新增行；尚不能判定空點或重複",
  refresh_timeout:"地圖刷新逾時", extraction_failed:"擷取失敗",
  upload_failed:"上傳失敗", failed_unclassified:"失敗原因未分類",
};
