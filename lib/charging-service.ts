import { buildMockChargingDetail } from "./charging-mock";
import { getLiveChargingDetail, isLiveStationConnected } from "./charging-store";
import type { StationChargingDetailDTO } from "./charging-types";
import { getStatieById, STATII_BICICLETE } from "./stations";

export function getChargingDetail(stationId: number): StationChargingDetailDTO | null {
  const statie = getStatieById(stationId);
  if (!statie) return null;

  if (statie.liveTelemetry) {
    const live = getLiveChargingDetail(stationId);
    if (live) return live;
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
    };
  }

  const mock = buildMockChargingDetail(stationId);
  if (mock) return { ...mock, source: "mock" };
  return null;
}

export function listStationChargingSummariesForApi() {
  return STATII_BICICLETE.map((s) => ({
    id: s.id,
    nume: s.nume,
    chargingConnected: s.liveTelemetry
      ? isLiveStationConnected(s.id)
      : s.chargingConnected,
    liveTelemetry: s.liveTelemetry === true,
    biciclete: s.biciclete,
    locuriGoale: s.locuriGoale,
  }));
}
