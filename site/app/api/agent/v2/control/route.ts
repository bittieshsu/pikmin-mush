import { ensureSchema, plain, runtime } from "../../../../../lib/cloud";
import { scanInteger } from "../../../../../lib/scan-identifiers.mjs";
import {
  agentRequestVersions, authorizeFleetAgent, renewLease, touchAgent,
} from "../../../../../lib/fleet";

export async function GET(request: Request) {
  const agent = await authorizeFleetAgent(request);
  if (!agent) return plain("stop\n", 401);
  await touchAgent(agent.id, agentRequestVersions(request));
  await ensureSchema();
  // 後台單獨暫停此 Agent：讓進行中的掃描立即進入 pause（不影響其他 Agent 或整個 job）。
  if (agent.paused) return plain("pause\n");
  const url = new URL(request.url);
  const jobId = scanInteger(url.searchParams.get("job_id"));
  const targetId = scanInteger(url.searchParams.get("target_id"));
  const lease = url.searchParams.get("lease") ?? "";
  if (jobId === null || targetId === null || !lease) {
    return plain("stop\n");
  }
  const job = await runtime().DB.prepare("SELECT status FROM scan_jobs WHERE id=?")
    .bind(jobId).first();
  const status = String(job?.status ?? "");
  if (status === "paused") return plain("pause\n");
  if (!["queued", "running"].includes(status)) return plain("stop\n");
  return plain(await renewLease(agent.id, jobId, targetId, lease) ? "run\n" : "stop\n");
}
