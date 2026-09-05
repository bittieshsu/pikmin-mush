import { adminAuthorized, ensureSchema, noStoreJson } from "../../../../lib/cloud";
import { readCopyAuditEvents } from "../../../../lib/copy-audit";

export async function GET(request: Request) {
  if (!adminAuthorized(request)) return noStoreJson({ error: "forbidden" }, 403);
  const url = new URL(request.url);
  const requestedHours = Number.parseInt(url.searchParams.get("hours") ?? "24", 10);
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") ?? "200", 10);
  const hours = Number.isFinite(requestedHours) ? Math.min(24 * 30, Math.max(1, requestedHours)) : 24;
  const limit = Number.isFinite(requestedLimit) ? Math.min(500, Math.max(1, requestedLimit)) : 200;
  await ensureSchema();
  return noStoreJson(await readCopyAuditEvents(hours, limit));
}
