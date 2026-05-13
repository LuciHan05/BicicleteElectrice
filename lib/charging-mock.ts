import type { ChargingStatusResponse } from "./charging-types";
import { getStatieById } from "./stations";

/** Variere lentă în timp (fără aleator pur) — simulează fluctuații de încărcare. */
function wave(seed: number, t: number): number {
  return Math.sin(seed * 1.7 + t * 0.0004) * 0.5 + 0.5;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Generează telemetrie mock pentru o stație.
 * Valorile depind ușor de `stationId` și de timpul serverului ca să pară „live”.
 */
export function buildMockChargingStatus(stationId: number): ChargingStatusResponse | null {
  const statie = getStatieById(stationId);
  if (!statie) return null;

  const t = Date.now();
  const w1 = wave(stationId, t);
  const w2 = wave(stationId + 3, t + 10_000);

  const baseBattery = 28 + (stationId * 19 + (t / 60_000) * 3) % 62;
  const batteryPercent = clamp(round1(baseBattery + w1 * 4 - 2), 12, 98);

  const remaining = (100 - batteryPercent) / 100;
  const etaMinutesToFull = Math.max(
    5,
    Math.round(remaining * 95 + w2 * 12 - 6),
  );

  const voltageVolts = round1(54.2 + w1 * 0.8 - 0.4);
  const currentAmps = round1(2.1 + w2 * 1.6);
  const powerWatts = Math.round(voltageVolts * currentAmps);

  const batteryTempCelsius = round1(24 + w1 * 9 + stationId * 0.4);

  return {
    stationId,
    stationName: statie.nume,
    bikeId: `CBE-${stationId}-${(1000 + stationId * 37).toString(36).toUpperCase()}`,
    batteryPercent,
    etaMinutesToFull,
    powerWatts,
    voltageVolts,
    currentAmps,
    batteryTempCelsius,
    updatedAt: new Date().toISOString(),
  };
}
