export type DefectTarget = "station" | "bike";

export type DefectReportRecord = {
  id: string;
  createdAt: string;
  target: DefectTarget;
  stationId: number | null;
  stationName: string | null;
  bikeIdentifier: string | null;
  category: string;
  categoryLabel: string;
  description: string;
};

export type DefectCategoryOption = { value: string; label: string };
