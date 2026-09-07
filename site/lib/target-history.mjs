// The queue is disposable; historical attribution must survive a loop reset.
export const TARGET_HISTORY_CTE = `WITH durable_targets AS (
  SELECT id,country,verification_kind FROM scan_targets
  UNION ALL
  SELECT h.id,h.country,h.verification_kind FROM scan_target_history h
  WHERE NOT EXISTS (SELECT 1 FROM scan_targets t WHERE t.id=h.id)
)`;

export function archiveAndDeleteTargets(db, jobId, now) {
  // D1 batch is atomic: archive failure must prevent destructive queue deletion.
  return db.batch([
    db.prepare(`INSERT OR IGNORE INTO scan_target_history
      (id,job_id,cycle,country,verification_kind,archived_at)
      SELECT id,job_id,cycle,country,verification_kind,? FROM scan_targets WHERE job_id=?`)
      .bind(now,jobId),
    db.prepare('DELETE FROM scan_targets WHERE job_id=?').bind(jobId),
  ]);
}
