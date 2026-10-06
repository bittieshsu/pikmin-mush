import { ensureSchema, plain, runtime } from "../../../../../lib/cloud";
import { scanInteger } from "../../../../../lib/scan-identifiers.mjs";
import {
  agentRequestVersions, authorizeFleetAgent, renewLease, touchAgent,
} from "../../../../../lib/fleet";

export async function GET(request: Request) {
  const agent = await authorizeFleetAgent(request);
  if (!agent) return plain("stop\n", 401);
  const versions = agentRequestVersions(request);
  // Non-renewal replies still refresh presence/version once. A valid lease
  // renewal does that itself; do not duplicate the UPDATE and heartbeat SQL.
  const reply = async (command: string) => {
    await touchAgent(agent.id, versions);
    return plain(`${command}\n`);
  };
  await ensureSchema();
  // 後台單獨暫停此 Agent：讓進行中的掃描立即進入 pause（不影響其他 Agent 或整個 job）。
  if (agent.paused) return reply("pause");
  const url = new URL(request.url);
  const jobId = scanInteger(url.searchParams.get("job_id"));
  const targetId = scanInteger(url.searchParams.get("target_id"));
  const lease = url.searchParams.get("lease") ?? "";
  if (jobId === null || targetId === null || !lease) {
    return reply("stop");
  }
  const job = await runtime().DB.prepare("SELECT status FROM scan_jobs WHERE id=?")
    .bind(jobId).first();
  const status = String(job?.status ?? "");
  if (status === "paused") return reply("pause");
  if (!["queued", "running"].includes(status)) return reply("stop");
  return plain(await renewLease(agent.id, jobId, targetId, lease, versions) ? "run\n" : "stop\n");
}
