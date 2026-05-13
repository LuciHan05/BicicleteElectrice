"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { StationChargingDetailDTO } from "@/lib/charging-types";

function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
        {unit ? <span className="text-sm font-normal text-zinc-500"> {unit}</span> : null}
      </p>
    </div>
  );
}

function BatteryRingSvg({ gradId, percent }: { gradId: string; percent: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, percent));
  const offset = c * (1 - pct / 100);
  return (
    <svg className="h-full w-full -rotate-90 text-zinc-800" viewBox="0 0 112 112" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        className="text-white/10"
      />
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

export default function DashboardStatieDetailPage() {
  const ringGradId = useId().replace(/:/g, "");
  const params = useParams();
  const rawId = params?.id;
  const stationId =
    typeof rawId === "string" ? Number.parseInt(rawId, 10) : Number.NaN;

  const [data, setData] = useState<StationChargingDetailDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(stationId) || stationId < 1) {
      const frame = requestAnimationFrame(() => {
        setLoading(false);
        setError("ID stație invalid.");
      });
      return () => cancelAnimationFrame(frame);
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stations/${stationId}/charging`, {
          cache: "no-store",
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            typeof body === "object" && body && "error" in body
              ? String((body as { error: string }).error)
              : `Eroare ${res.status}`,
          );
        }
        if (!cancelled) setData(body as StationChargingDetailDTO);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : "Eroare la încărcare.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stationId]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard-statii"
        className="text-sm font-medium text-emerald-400/90 hover:text-emerald-300"
      >
        ← Înapoi la listă
      </Link>

      {loading && (
        <div className="mt-8 space-y-4 animate-pulse">
          <div className="h-10 w-2/3 rounded-lg bg-white/10" />
          <div className="h-24 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-white/5" />
            <div className="h-24 rounded-xl bg-white/5" />
            <div className="h-24 rounded-xl bg-white/5" />
          </div>
        </div>
      )}

      {error && !loading && (
        <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {data && !loading && (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-white">{data.stationName}</h2>
            <p className="mt-1 text-sm text-zinc-500">Stație #{data.stationId}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Bicicletă conectată
            </p>
            <p className="mt-2 flex items-center gap-3">
              <span
                className={
                  data.connected
                    ? "inline-flex items-center rounded-full bg-emerald-500/20 px-4 py-1.5 text-lg font-semibold text-emerald-300"
                    : "inline-flex items-center rounded-full bg-zinc-700/50 px-4 py-1.5 text-lg font-semibold text-zinc-400"
                }
              >
                {data.connected ? "DA" : "NU"}
              </span>
              {data.connected && data.bikeId && (
                <span className="font-mono text-xs text-zinc-500">{data.bikeId}</span>
              )}
            </p>
            {!data.connected && (
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Nu este conectată nicio bicicletă la dock-ul de încărcare. Parametrii de încărcare
                nu sunt disponibili.
              </p>
            )}
          </div>

          {data.connected &&
            data.batteryPercent != null &&
            data.voltageVolts != null &&
            data.currentAmps != null &&
            data.powerWatts != null &&
            data.etaMinutesToFull != null && (
              <>
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent py-8">
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <BatteryRingSvg
                      gradId={ringGradId}
                      percent={data.batteryPercent}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold tabular-nums text-white">
                        {Math.round(data.batteryPercent)}%
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                        baterie
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Parametri încărcare
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard label="Tensiune" value={data.voltageVolts} unit="V" />
                    <StatCard label="Curent" value={data.currentAmps} unit="A" />
                    <StatCard label="Putere instantanee" value={data.powerWatts} unit="W" />
                  </div>
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Timp estimat până la 100%
                    </p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-white sm:text-2xl">
                      {formatEta(data.etaMinutesToFull)}
                    </p>
                  </div>
                </div>
              </>
            )}

          <p className="text-center text-xs text-zinc-600">
            Date simulate · actualizat la{" "}
            {new Date(data.updatedAt).toLocaleString("ro-RO", {
              dateStyle: "short",
              timeStyle: "medium",
            })}
          </p>
        </div>
      )}
    </main>
  );
}
