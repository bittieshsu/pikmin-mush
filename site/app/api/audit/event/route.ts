import { ensureSchema, noStoreJson, readBoundedUtf8, runtime, sameOrigin } from "../../../../lib/cloud";
import { recordPublicUsageEvent, type UsageEventInput } from "../../../../lib/copy-audit";

const MAX_BODY_BYTES = 1_500;
const EVENT_TYPES = new Set<UsageEventInput["eventType"]>([
  "page_view", "filter_apply", "search", "map_focus", "api_error",
]);

function validEvent(value: unknown): UsageEventInput | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  const eventType = String(payload.event_type ?? "") as UsageEventInput["eventType"];
  const dimension = typeof payload.dimension === "string" ? payload.dimension.trim() : "";
  const mushroomId = typeof payload.mushroom_id === "string" ? payload.mushroom_id.trim() : "";
  if (!EVENT_TYPES.has(eventType) || dimension.length > 160 || mushroomId.length > 256) return null;
  if ((eventType === "map_focus") !== Boolean(mushroomId)) return null;
  return { eventType, dimension, mushroomId };
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return noStoreJson({ error: "forbidden" }, 403);
  const body = await readBoundedUtf8(request, MAX_BODY_BYTES);
  if ("error" in body) return noStoreJson({ error: body.error }, 413);
  let parsed: unknown;
  try { parsed = JSON.parse(body.text); } catch { return noStoreJson({ error: "invalid payload" }, 400); }
  const event = validEvent(parsed);
  if (!event) return noStoreJson({ error: "invalid payload" }, 400);
  await ensureSchema();
  if (event.mushroomId) {
    const existing = await runtime().DB.prepare("SELECT id FROM mushrooms WHERE id=?")
      .bind(event.mushroomId).first();
    if (!existing) return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  await recordPublicUsageEvent(request, event);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
