import { NextResponse } from "next/server";
import { labelForCategory } from "@/lib/defect-categories";
import { listDefectReports, persistDefectReport } from "@/lib/report-store";
import type { DefectTarget } from "@/lib/report-types";
import { getStatieById } from "@/lib/stations";

type PostBody = {
  target?: string;
  stationId?: number | null;
  bikeIdentifier?: string | null;
  category?: string;
  description?: string;
};

function normalizeBikeId(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (s.length === 0) return null;
  return s.slice(0, 120);
}

/**
 * POST /api/reports — trimite un raport de defecțiune (mock, stocat în memorie).
 * GET /api/reports — ultimele rapoarte (demo / depanare).
 */
export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Corp JSON invalid." }, { status: 400 });
  }

  const target = body.target === "bike" ? "bike" : body.target === "station" ? "station" : null;
  if (!target) {
    return NextResponse.json(
      { error: 'Câmpul „target” trebuie să fie „station” sau „bike”.' },
      { status: 400 },
    );
  }

  const stationIdRaw = body.stationId;
  const stationId =
    stationIdRaw === null || stationIdRaw === undefined || stationIdRaw === ""
      ? null
      : Number(stationIdRaw);

  if (stationId !== null && (!Number.isFinite(stationId) || stationId < 1)) {
    return NextResponse.json({ error: "ID stație invalid." }, { status: 400 });
  }

  if (target === "station" && stationId === null) {
    return NextResponse.json(
      { error: "Pentru defecțiune la stație, selectează stația." },
      { status: 400 },
    );
  }

  if (stationId !== null && !getStatieById(stationId)) {
    return NextResponse.json({ error: "Stația nu există." }, { status: 400 });
  }

  const category = typeof body.category === "string" ? body.category.trim() : "";
  const categoryLabel = labelForCategory(target, category);
  if (!categoryLabel) {
    return NextResponse.json({ error: "Categorie invalidă pentru tipul selectat." }, { status: 400 });
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 12) {
    return NextResponse.json(
      { error: "Descrierea trebuie să aibă cel puțin 12 caractere." },
      { status: 400 },
    );
  }
  if (description.length > 4000) {
    return NextResponse.json({ error: "Descrierea este prea lungă." }, { status: 400 });
  }

  const bikeIdentifier = normalizeBikeId(body.bikeIdentifier);
  if (target === "bike" && !bikeIdentifier && stationId === null) {
    return NextResponse.json(
      {
        error:
          "Pentru bicicletă: indică fie codul/ID-ul bicicletei, fie stația unde ai observat problema.",
      },
      { status: 400 },
    );
  }

  const record = persistDefectReport({
    target: target as DefectTarget,
    stationId,
    bikeIdentifier,
    category,
    categoryLabel,
    description,
  });

  return NextResponse.json(
    { ok: true, report: { id: record.id, createdAt: record.createdAt } },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  return NextResponse.json(
    { reports: listDefectReports(limit) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
