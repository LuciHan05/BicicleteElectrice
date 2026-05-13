import { getStatieById } from "./stations";
import type { DefectReportRecord } from "./report-types";

const reports: DefectReportRecord[] = [];
const MAX_REPORTS = 200;

/**
 * Stocare în memorie (demo). La restart server datele se pierd — în producție
 * înlocuiește cu DB / ticketing (Linear, Jira Service, etc.).
 */
export function persistDefectReport(input: {
  target: DefectReportRecord["target"];
  stationId: number | null;
  bikeIdentifier: string | null;
  category: string;
  categoryLabel: string;
  description: string;
}): DefectReportRecord {
  const id = `DEF-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
  const stationName =
    input.stationId != null ? getStatieById(input.stationId)?.nume ?? null : null;

  const row: DefectReportRecord = {
    id,
    createdAt: new Date().toISOString(),
    target: input.target,
    stationId: input.stationId,
    stationName,
    bikeIdentifier: input.bikeIdentifier,
    category: input.category,
    categoryLabel: input.categoryLabel,
    description: input.description,
  };

  reports.unshift(row);
  if (reports.length > MAX_REPORTS) {
    reports.length = MAX_REPORTS;
  }
  return row;
}

export function listDefectReports(limit = 100): DefectReportRecord[] {
  return reports.slice(0, Math.min(limit, reports.length));
}
