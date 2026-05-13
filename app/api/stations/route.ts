import { NextResponse } from "next/server";
import { listStationChargingSummaries } from "@/lib/charging-mock";

/**
 * GET /api/stations
 * Lista stațiilor cu starea conexiunii la încărcare (mock).
 */
export async function GET() {
  return NextResponse.json(
    { stations: listStationChargingSummaries() },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
