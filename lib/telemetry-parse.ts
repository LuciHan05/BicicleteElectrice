import type { TelemetryIngestBody } from "./charging-types";

function firstNumber(o: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    if (o[key] == null) continue;
    const n = Number(o[key]);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Acceptă JSON de la ESP:
 * - `voltageVolts`, `currentAmps`, `powerWatts` (app)
 * - `tensiune`, `curent`, `putere` (Arduino → Serial)
 */
export function parseTelemetryIngestBody(raw: unknown): TelemetryIngestBody | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const voltageVolts = firstNumber(o, ["voltageVolts", "tensiune", "voltage"]);
  const currentAmps = firstNumber(o, ["currentAmps", "curent", "current"]);
  if (voltageVolts == null || currentAmps == null) return null;

  const powerRaw = firstNumber(o, ["powerWatts", "putere", "power"]);
  const powerWatts = powerRaw ?? undefined;

  const connected = o.connected === undefined ? undefined : Boolean(o.connected);
  const batteryPercent =
    o.batteryPercent == null
      ? null
      : Number.isFinite(Number(o.batteryPercent))
        ? Number(o.batteryPercent)
        : null;
  const bikeId = typeof o.bikeId === "string" ? o.bikeId : null;

  return {
    voltageVolts,
    currentAmps,
    powerWatts,
    connected,
    batteryPercent,
    bikeId,
  };
}
