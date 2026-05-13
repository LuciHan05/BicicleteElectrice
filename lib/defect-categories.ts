import type { DefectCategoryOption } from "./report-types";

export const CATEGORII_STATIE: DefectCategoryOption[] = [
  { value: "dock_nu_incarca", label: "Dock-ul nu încarcă / eroare la conectare" },
  { value: "ecran_statie", label: "Ecran sau interfață stație defectă" },
  { value: "cablu_conector", label: "Cablu, conector sau priză deteriorată" },
  { value: "alimentare", label: "Lipsă tensiune / panou electric" },
  { value: "structura", label: "Structură deteriorată (stalp, suport)" },
  { value: "altul_statie", label: "Altul (stație de încărcare)" },
];

export const CATEGORII_BICICLETA: DefectCategoryOption[] = [
  { value: "baterie", label: "Baterie / autonomie anormală" },
  { value: "motor", label: "Motor sau asistare la pedalare" },
  { value: "frane", label: "Frâne" },
  { value: "roti", label: "Roți, anvelope sau spițe" },
  { value: "ghidon_display", label: "Ghidon, claxon sau display bicicletă" },
  { value: "incuietoare", label: "Încuietoare sau sistem de prindere" },
  { value: "altul_bicicleta", label: "Altul (bicicletă)" },
];

export function labelForCategory(
  target: "station" | "bike",
  value: string,
): string | undefined {
  const list = target === "station" ? CATEGORII_STATIE : CATEGORII_BICICLETA;
  return list.find((c) => c.value === value)?.label;
}
