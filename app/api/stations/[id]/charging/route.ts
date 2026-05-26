import { NextResponse } from "next/server";
import { getChargingDetail } from "@/lib/charging-service";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/stations/:id/charging
 * Stații live (ESP): date din ingest; restul: simulare mock.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const stationId = Number.parseInt(id, 10);
  if (!Number.isFinite(stationId) || stationId < 1) {
    return NextResponse.json({ error: "ID stație invalid." }, { status: 400 });
  }

  const payload = getChargingDetail(stationId);
  if (!payload) {
    return NextResponse.json({ error: "Stația nu a fost găsită." }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
