import { NextResponse } from "next/server";
import { buildMockChargingStatus } from "@/lib/charging-mock";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/stations/:id/charging
 * Returnează telemetrie mock pentru o bicicletă în curs de încărcare la stația dată.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const stationId = Number.parseInt(id, 10);
  if (!Number.isFinite(stationId) || stationId < 1) {
    return NextResponse.json({ error: "ID stație invalid." }, { status: 400 });
  }

  const payload = buildMockChargingStatus(stationId);
  if (!payload) {
    return NextResponse.json({ error: "Stația nu a fost găsită." }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
