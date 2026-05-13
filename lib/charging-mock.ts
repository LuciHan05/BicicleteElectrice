import type { StationChargingDetailDTO, StationListItemDTO } from "./charging-types";
import { getStatieById, STATII_BICICLETE } from "./stations";

function wave(seed: number, t: number): number {
  return Math.sin(seed * 1.7 + t * 0.0004) * 0.5 + 0.5;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function listStationChargingSummaries(): StationListItemDTO[] {
  return STATII_BICICLETE.map((s) => ({
    id: s.id,
    nume: s.nume,
    chargingConnected: s.chargingConnected,
    biciclete: s.biciclete,
    locuriGoale: s.locuriGoale,
  }));
}

/**
 * Telemetrie mock pentru o stație.
 * Dacă stația nu are `chargingConnected`, toți parametrii de încărcare sunt null.
 */
export function buildMockChargingDetail(stationId: number): StationChargingDetailDTO | null {
  const statie = getStatieById(stationId);
  if (!statie) return null;

  const updatedAt = new Date().toISOString();

  if (!statie.chargingConnected) {
    return {
      stationId,
      stationName: statie.nume,
      connected: false,
      bikeId: null,
      batteryPercent: null,
      etaMinutesToFull: null,
      powerWatts: null,
      voltageVolts: null,
      currentAmps: null,
      updatedAt,
    };
  }

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

  return {
    stationId,
    stationName: statie.nume,
    connected: true,
    bikeId: `CBE-${stationId}-${(1000 + stationId * 37).toString(36).toUpperCase()}`,
    batteryPercent,
    etaMinutesToFull,
    powerWatts,
    voltageVolts,
    currentAmps,
    updatedAt,
  };
}
