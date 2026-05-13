export type Statie = {
  id: number;
  nume: string;
  coordonate: [number, number];
  biciclete: number;
  locuriGoale: number;
};

export const STATII_BICICLETE: Statie[] = [
  { id: 1, nume: "Piața Unirii", coordonate: [46.7693, 23.5899], biciclete: 5, locuriGoale: 2 },
  { id: 2, nume: "Parcul Central", coordonate: [46.7698, 23.5783], biciclete: 0, locuriGoale: 10 },
  { id: 3, nume: "Iulius Mall", coordonate: [46.7715, 23.6268], biciclete: 12, locuriGoale: 0 },
];

export function getStatieById(id: number): Statie | undefined {
  return STATII_BICICLETE.find((s) => s.id === id);
}
