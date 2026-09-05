import { ensureSchema, noStoreJson, readBoundedUtf8, runtime, sameOrigin } from "../../../../lib/cloud";
import { recordCopyAuditEvent } from "../../../../lib/copy-audit";

const MAX_BODY_BYTES = 1_500;

function validPayload(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  const eventType = payload.kind === "gps" ? "copy_gps" : payload.kind === "info" ? "copy_info" : "";
  const mushroomId = typeof payload.id === "string" ? payload.id.trim() : "";
  const lat = Number(payload.lat), lng = Number(payload.lng);
  const level = Number(payload.level), type = Number(payload.type);
  if (!eventType || !mushroomId || mushroomId.length > 256 ||
      !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      !Number.isFinite(lng) || lng < -180 || lng > 180 ||
      ![2, 3, 4].includes(level) || !Number.isInteger(type) || type < 0 || type > 10_000) return null;
  return { eventType, mushroomId, lat, lng, level, type } as const;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return noStoreJson({ error: "forbidden" }, 403);
  const body = await readBoundedUtf8(request, MAX_BODY_BYTES);
  if ("error" in body) return noStoreJson({ error: body.error }, 413);
  let parsed: unknown;
  try { parsed = JSON.parse(body.text); } catch { return noStoreJson({ error: "invalid payload" }, 400); }
  const input = validPayload(parsed);
  if (!input) return noStoreJson({ error: "invalid payload" }, 400);
  await ensureSchema();
  // Only audit a currently stored mushroom ID; this avoids turning the public
  // endpoint into an arbitrary event sink.
  const existing = await runtime().DB.prepare("SELECT id FROM mushrooms WHERE id=?")
    .bind(input.mushroomId).first();
  if (existing) await recordCopyAuditEvent(request, input);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
