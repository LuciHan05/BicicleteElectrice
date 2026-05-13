/** Element din lista de stații (mock API). */
export type StationListItemDTO = {
  id: number;
  nume: string;
  /** Bicicletă conectată la dock-ul de încărcare (simulare). */
  chargingConnected: boolean;
  biciclete: number;
  locuriGoale: number;
};

/** Detaliu telemetrie încărcare pentru o stație (mock API). */
export type StationChargingDetailDTO = {
  stationId: number;
  stationName: string;
  connected: boolean;
  bikeId: string | null;
  batteryPercent: number | null;
  etaMinutesToFull: number | null;
  powerWatts: number | null;
  voltageVolts: number | null;
  currentAmps: number | null;
  updatedAt: string;
};
