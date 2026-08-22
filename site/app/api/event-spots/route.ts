import { ensureSchema, noStoreJson, runtime } from "../../../lib/cloud";

export const dynamic = "force-dynamic";

type EventSpotRow = {
  id: string; country: string; city: string; name: string; lat: number; lng: number;
  spot_kind: string; reward_kind: string; reward_summary: string; start_at: number; end_at: number;
  cooldown_note: string; eligibility_note: string; coordinate_note: string; verification_status: string;
  source_title: string; source_url: string; last_verified_at: number; updated_at: number;
};

export async function GET(request: Request) {
  await ensureSchema();
  const url = new URL(request.url);
  const country = String(url.searchParams.get("country") ?? "").trim();
  const requestedStatus = String(url.searchParams.get("status") ?? "active");
  if (country.length > 48 || !["active", "all", "ended"].includes(requestedStatus)) {
    return noStoreJson({ error: "invalid query" }, 400);
  }
  const now = Math.floor(Date.now() / 1000);
  const where = ["1=1"];
  const values: unknown[] = [];
  if (country) { where.push("country=?"); values.push(country); }
  if (requestedStatus === "active") { where.push("(end_at=0 OR end_at>=?)"); values.push(now); }
  if (requestedStatus === "ended") { where.push("end_at>0 AND end_at<?"); values.push(now); }
  const rows = await runtime().DB.prepare(`SELECT id, country, city, name, lat, lng,
      spot_kind, reward_kind, reward_summary, start_at, end_at, cooldown_note,
      eligibility_note, coordinate_note, verification_status, source_title, source_url,
      last_verified_at, updated_at FROM event_spots WHERE ${where.join(" AND ")}
      ORDER BY CASE WHEN end_at=0 THEN 1 ELSE 0 END DESC, end_at ASC, country ASC, city ASC, name ASC`)
    .bind(...values).all<EventSpotRow>();
  return noStoreJson({ updated: now, spots: rows.results });
}
