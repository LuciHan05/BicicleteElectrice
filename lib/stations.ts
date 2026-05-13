export type Statie = {
  id: number;
  nume: string;
  coordonate: [number, number];
  biciclete: number;
  locuriGoale: number;
  /** Mock: există bicicletă conectată la încărcare la această stație. */
  chargingConnected: boolean;
};

export const STATII_BICICLETE: Statie[] = [
  {
    id: 1,
    nume: "Piața Unirii",
    coordonate: [46.7693, 23.5899],
    biciclete: 5,
    locuriGoale: 2,
    chargingConnected: true,
  },
  {
    id: 2,
    nume: "Parcul Central",
    coordonate: [46.7698, 23.5783],
    biciclete: 0,
    locuriGoale: 10,
    chargingConnected: false,
  },
  {
    id: 3,
    nume: "Iulius Mall",
    coordonate: [46.7715, 23.6268],
    biciclete: 12,
    locuriGoale: 0,
    chargingConnected: true,
  },
  {
    id: 4,
    nume: "Cluj Arena",
    coordonate: [46.7681, 23.5704],
    biciclete: 3,
    locuriGoale: 4,
    chargingConnected: false,
  },
  {
    id: 5,
    nume: "Gheorgheni — Sala Polivalentă",
    coordonate: [46.7759, 23.6122],
    biciclete: 7,
    locuriGoale: 1,
    chargingConnected: true,
  },
  {
    id: 6,
    nume: "Mărăști — Memorandumului",
    coordonate: [46.7825, 23.5981],
    biciclete: 2,
    locuriGoale: 8,
    chargingConnected: false,
  },
];

export function getStatieById(id: number): Statie | undefined {
  return STATII_BICICLETE.find((s) => s.id === id);
}
