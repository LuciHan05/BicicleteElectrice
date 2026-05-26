import type { StationChargingDetailDTO } from "./charging-types";
import { getStatieById } from "./stations";

/** După cât timp fără date de la ESP considerăm stația deconectată. */
export const TELEMETRY_STALE_MS = 60_000;

type LiveReading = {
  payload: Omit<StationChargingDetailDTO, "stationId" | "stationName">;
  receivedAt: number;
};

const liveByStationId = new Map<number, LiveReading>();

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function upsertLiveTelemetry(
  stationId: number,
  input: {
    voltageVolts: number;
    currentAmps: number;
    powerWatts?: number;
    connected?: boolean;
    batteryPercent?: number | null;
    bikeId?: string | null;
  },
): StationChargingDetailDTO | null {
  const statie = getStatieById(stationId);
  if (!statie) return null;

  const connected = input.connected ?? true;
  const updatedAt = new Date().toISOString();
  const receivedAt = Date.now();

  if (!connected) {
    const disconnected: StationChargingDetailDTO = {
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
      source: "live",
    };
    liveByStationId.set(stationId, {
      payload: {
        connected: false,
        bikeId: null,
        batteryPercent: null,
        etaMinutesToFull: null,
        powerWatts: null,
        voltageVolts: null,
        currentAmps: null,
        updatedAt,
        source: "live",
      },
      receivedAt,
    });
    return disconnected;
  }

  const voltageVolts = round1(input.voltageVolts);
  const currentAmps = round1(input.currentAmps);
  const powerWatts =
    input.powerWatts != null
      ? Math.round(input.powerWatts)
      : Math.round(voltageVolts * currentAmps);

  const batteryPercent =
    input.batteryPercent != null ? round1(input.batteryPercent) : null;

  const etaMinutesToFull =
    batteryPercent != null
      ? Math.max(5, Math.round(((100 - batteryPercent) / 100) * 90))
      : null;

  const detail: StationChargingDetailDTO = {
    stationId,
    stationName: statie.nume,
    connected: true,
    bikeId: input.bikeId ?? `CBE-${stationId}-LIVE`,
    batteryPercent,
    etaMinutesToFull,
    powerWatts,
    voltageVolts,
    currentAmps,
    updatedAt,
    source: "live",
  };

  liveByStationId.set(stationId, {
    payload: {
      connected: detail.connected,
      bikeId: detail.bikeId,
      batteryPercent: detail.batteryPercent,
      etaMinutesToFull: detail.etaMinutesToFull,
      powerWatts: detail.powerWatts,
      voltageVolts: detail.voltageVolts,
      currentAmps: detail.currentAmps,
      updatedAt: detail.updatedAt,
      source: "live",
    },
    receivedAt,
  });

  return detail;
}

export function getLiveChargingDetail(stationId: number): StationChargingDetailDTO | null {
  const statie = getStatieById(stationId);
  if (!statie) return null;

  const reading = liveByStationId.get(stationId);
  if (!reading) return null;

  const age = Date.now() - reading.receivedAt;
  if (age > TELEMETRY_STALE_MS) {
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
      updatedAt: new Date().toISOString(),
      source: "live",
      stale: true,
    };
  }

  return {
    stationId,
    stationName: statie.nume,
    ...reading.payload,
  };
}

export function isLiveStationConnected(stationId: number): boolean {
  const detail = getLiveChargingDetail(stationId);
  return detail?.connected === true && detail.stale !== true;
}
