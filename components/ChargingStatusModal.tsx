"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { ChargingStatusResponse } from "@/lib/charging-types";

type Props = {
  open: boolean;
  onClose: () => void;
  stationId: number | null;
  stationName: string;
};

function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function BatteryRing({ percent }: { percent: number }) {
  const gradId = useId().replace(/:/g, "");
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clampPercent(percent) / 100);

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg
        className="h-full w-full -rotate-90 text-zinc-800"
        viewBox="0 0 112 112"
        aria-hidden
      >
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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-semibold tabular-nums text-white">
          {clampPercent(percent).toFixed(0)}%
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          baterie
        </span>
      </div>
    </div>
  );
}

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, n));
}

export default function ChargingStatusModal({
  open,
  onClose,
  stationId,
  stationName,
}: Props) {
  const titleId = useId();
  const [data, setData] = useState<ChargingStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (stationId == null) return;
      const silent = opts?.silent === true;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stations/${stationId}/charging`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `Eroare HTTP ${res.status}`);
        }
        const json = (await res.json()) as ChargingStatusResponse;
        setData(json);
      } catch (e) {
        if (!silent) {
          setData(null);
          setError(
            e instanceof Error ? e.message : "Nu s-au putut încărca datele.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [stationId],
  );

  useEffect(() => {
    if (!open || stationId == null) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [open, stationId, load]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => void load({ silent: true }), 5000);
    return () => window.clearInterval(id);
  }, [open, load]);

  useEffect(() => {
    if (open) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (!cancelled) {
        setData(null);
        setError(null);
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || stationId == null) return null;

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Închide"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/90">
              Monitorizare încărcare
            </p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-white">
              {stationName}
            </h2>
            {data && (
              <p className="mt-0.5 font-mono text-xs text-zinc-500">
                Bicicletă: <span className="text-zinc-400">{data.bikeId}</span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              Reîmprospătare
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Închide panoul"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && !data && (
            <div className="space-y-4 animate-pulse">
              <div className="mx-auto h-36 w-36 rounded-full bg-white/5" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 rounded-xl bg-white/5" />
                <div className="h-20 rounded-xl bg-white/5" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 rounded-xl bg-white/5" />
                <div className="h-16 rounded-xl bg-white/5" />
                <div className="h-16 rounded-xl bg-white/5" />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative">
                  <BatteryRing percent={data.batteryPercent} />
                  <span
                    className="pointer-events-none absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/10"
                    aria-hidden
                  >
                    <span className="text-xs animate-pulse">⚡</span>
                  </span>
                </div>
                <div className="w-full flex-1 space-y-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Timp estimat până la încărcare completă
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                      {formatEta(data.etaMinutesToFull)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Putere instantanee
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300">
                      {data.powerWatts}{" "}
                      <span className="text-base font-medium text-zinc-500">W</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Detalii tehnice
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">Tensiune</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                      {data.voltageVolts}
                      <span className="text-xs font-normal text-zinc-500"> V</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">Curent</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                      {data.currentAmps}
                      <span className="text-xs font-normal text-zinc-500"> A</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">Temp. acum.</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                      {data.batteryTempCelsius}
                      <span className="text-xs font-normal text-zinc-500"> °C</span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-[11px] text-zinc-600">
                Date simulate pentru demonstrație · actualizat{" "}
                {new Date(data.updatedAt).toLocaleTimeString("ro-RO", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
