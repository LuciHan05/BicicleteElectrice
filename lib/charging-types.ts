/** Element din lista de stații (mock API). */
export type StationListItemDTO = {
  id: number;
  nume: string;
  /** Bicicletă conectată la dock-ul de încărcare (simulare sau live ESP). */
  chargingConnected: boolean;
  /** Stație cu telemetrie reală de la ESP. */
  liveTelemetry?: boolean;
  biciclete: number;
  locuriGoale: number;
};

/** Detaliu telemetrie încărcare pentru o stație. */
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
  source?: "live" | "mock";
  /** Ultima citire ESP a expirat (fără date recente). */
  stale?: boolean;
};

/** Payload trimis de ESP la ingest. */
export type TelemetryIngestBody = {
  voltageVolts: number;
  currentAmps: number;
  powerWatts?: number;
  connected?: boolean;
  batteryPercent?: number | null;
  bikeId?: string | null;
};
