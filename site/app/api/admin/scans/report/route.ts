import { adminAuthorized, ensureSchema, noStoreJson } from "../../../../../lib/cloud";
import { activeOrLatestJob } from "../../../../../lib/scans";
import { buildJobEfficiencyReport } from "../../../../../lib/metrics";

export async function GET(request: Request) {
  if (!adminAuthorized(request)) return noStoreJson({ error: "forbidden" }, 403);
  await ensureSchema();
  const requested = Number(new URL(request.url).searchParams.get("jobId") ?? 0);
  const latest = requested > 0 ? null : await activeOrLatestJob();
  const jobId = requested > 0 ? requested : Number(latest?.id ?? 0);
  if (!Number.isInteger(jobId) || jobId < 1) {
    return noStoreJson({ error: "尚無可產生報告的掃描工作" }, 404);
  }
  const report = await buildJobEfficiencyReport(jobId);
  return report ? noStoreJson(report) : noStoreJson({ error: "scan job missing" }, 404);
}
