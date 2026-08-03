import {
  adminAuthorized, noStoreJson, sameOrigin,
} from "../../../../../lib/cloud";
import { redeployDailyRotation } from "../../../../../lib/rotation";

export async function POST(request: Request) {
  if (!adminAuthorized(request)) return noStoreJson({ error: "forbidden" }, 403);
  if (!sameOrigin(request)) return noStoreJson({ error: "invalid origin" }, 403);
  try {
    return noStoreJson({ ok: true, ...(await redeployDailyRotation()) });
  } catch (error) {
    return noStoreJson({
      error: error instanceof Error ? error.message : "無法重新分配掃描區域",
    }, 409);
  }
}
