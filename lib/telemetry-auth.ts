const DEV_DEFAULT_KEY = "dev-telemetry-key";

export function getTelemetryApiKey(): string {
  return process.env.TELEMETRY_API_KEY?.trim() || DEV_DEFAULT_KEY;
}

export function isTelemetryAuthorized(request: Request): boolean {
  const expected = getTelemetryApiKey();
  const header = request.headers.get("x-telemetry-key")?.trim();
  const url = new URL(request.url);
  const query = url.searchParams.get("key")?.trim();
  const provided = header || query;
  return provided === expected;
}
