import { NextResponse } from "next/server";
import { upsertLiveTelemetry } from "@/lib/charging-store";
import { getStatieById } from "@/lib/stations";
import { parseTelemetryIngestBody } from "@/lib/telemetry-parse";
import { isTelemetryAuthorized } from "@/lib/telemetry-auth";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/stations/:id/charging/ingest
 * ESP trimite tensiune, curent, putere (JSON).
 * Header: X-Telemetry-Key: <TELEMETRY_API_KEY>
 */
export async function POST(request: Request, context: RouteContext) {
  if (!isTelemetryAuthorized(request)) {
    return NextResponse.json({ error: "Cheie telemetrie invalidă." }, { status: 401 });
  }

  const { id } = await context.params;
  const stationId = Number.parseInt(id, 10);
  if (!Number.isFinite(stationId) || stationId < 1) {
    return NextResponse.json({ error: "ID stație invalid." }, { status: 400 });
  }

  const statie = getStatieById(stationId);
  if (!statie) {
    return NextResponse.json({ error: "Stația nu a fost găsită." }, { status: 404 });
  }
  if (!statie.liveTelemetry) {
    return NextResponse.json(
      { error: "Această stație nu acceptă telemetrie live." },
      { status: 403 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalid." }, { status: 400 });
  }

  const body = parseTelemetryIngestBody(raw);
  if (!body) {
    return NextResponse.json(
      {
        error:
          "Câmpuri obligatorii: voltageVolts + currentAmps sau tensiune + curent (numere).",
      },
      { status: 400 },
    );
  }

  const detail = upsertLiveTelemetry(stationId, body);
  if (!detail) {
    return NextResponse.json({ error: "Stația nu a fost găsită." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: detail });
}
