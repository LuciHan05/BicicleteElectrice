/** Răspuns API pentru telemetria încărcării unei biciclete la stație (mock). */
export type ChargingStatusResponse = {
  stationId: number;
  stationName: string;
  bikeId: string;
  batteryPercent: number;
  /** Minute până la încărcare completă estimată */
  etaMinutesToFull: number;
  /** Putere instantanee (W) */
  powerWatts: number;
  /** Tensiune la intrarea încărcătorului (V) */
  voltageVolts: number;
  /** Curent de încărcare (A) */
  currentAmps: number;
  /** Temperatură estimată acumulator (°C) */
  batteryTempCelsius: number;
  updatedAt: string;
};
