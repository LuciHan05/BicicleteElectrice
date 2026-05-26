import { NextResponse } from "next/server";
import { listStationChargingSummariesForApi } from "@/lib/charging-service";

/**
 * GET /api/stations
 * Lista stațiilor cu starea conexiunii la încărcare.
 */
export async function GET() {
  return NextResponse.json(
    { stations: listStationChargingSummariesForApi() },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
