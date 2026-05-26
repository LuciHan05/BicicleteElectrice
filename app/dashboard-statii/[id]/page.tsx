"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { StationChargingDetailDTO } from "@/lib/charging-types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function voltageToPercent(voltage: number | null) {
  if (voltage == null) return null;
  return Math.round(clamp(((voltage - 3.0) / 1.2) * 100, 0, 100));
}

function chargingPhase(percent: number | null) {
  if (percent == null) return "Fara date baterie";
  if (percent < 20) return "Pre-incarcare";
  if (percent < 80) return "Incarcare rapida";
  if (percent < 100) return "Incarcare finala";
  return "Complet";
}

function BikePulse({ active }: { active: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-black/30 p-3 sm:p-5 backdrop-blur">
      <svg viewBox="0 0 560 170" className="h-24 w-full sm:h-36 text-cyan-300/85">
        <circle cx="122" cy="120" r="38" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="332" cy="120" r="38" fill="none" stroke="currentColor" strokeWidth="3" />
        <path
          d="M122 120 L178 72 L232 120 L280 120 L332 120 M178 72 L210 72 M226 56 L210 72 M246 60 L232 120 M196 92 L268 92"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="395" y="76" width="18" height="54" rx="4" fill="none" stroke="#22d3ee" strokeWidth="3" />
        <path d="M414 104 H468" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
        <circle cx="468" cy="104" r="8" fill="none" stroke="#22d3ee" strokeWidth="3" />
        {active && (
          <>
            <circle className="charge-dot" cx="414" cy="104" r="4" fill="#34d399" />
            <circle className="charge-dot charge-delay" cx="414" cy="104" r="4" fill="#22d3ee" />
          </>
        )}
      </svg>
      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-cyan-200/80 sm:text-xs sm:tracking-[0.22em]">
        Flux energie dock - bicicleta
      </p>
    </div>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] p-4 sm:p-5 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/10 via-transparent to-emerald-300/10" />
      <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300 sm:text-[11px] sm:tracking-[0.22em]">{title}</p>
      <div className="relative mt-4">{children}</div>
    </section>
  );
}

export default function DashboardStatieDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const stationId = typeof rawId === "string" ? Number.parseInt(rawId, 10) : Number.NaN;

  const [data, setData] = useState<StationChargingDetailDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [powerHistory, setPowerHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!Number.isFinite(stationId) || stationId < 1) {
      const frame = requestAnimationFrame(() => {
        setLoading(false);
        setError("ID statie invalid.");
      });
      return () => cancelAnimationFrame(frame);
    }

    let cancelled = false;

    async function loadCharging(isInitial: boolean) {
      if (isInitial) {
        setLoading(true);
        setError(null);
      }
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
        if (!cancelled) {
          const next = body as StationChargingDetailDTO;
          setData(next);
          if (next.powerWatts != null) {
            setPowerHistory((prev) => [...prev.slice(-19), next.powerWatts!]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : "Eroare la incarcare.");
        }
      } finally {
        if (!cancelled && isInitial) setLoading(false);
      }
    }

    void loadCharging(true);
    const interval = window.setInterval(() => {
      void loadCharging(false);
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [stationId]);

  const batteryPercent = useMemo(() => {
    if (!data) return null;
    if (data.batteryPercent != null) return Math.round(data.batteryPercent);
    return voltageToPercent(data.voltageVolts);
  }, [data]);

  const peakPower = powerHistory.length > 0 ? Math.max(...powerHistory) : 0;
  const powerPoints =
    powerHistory.length > 1
      ? powerHistory
          .map((v, i) => {
            const x = (i / (powerHistory.length - 1)) * 260;
            const y = 72 - clamp((v / Math.max(peakPower, 1)) * 62, 4, 62);
            return `${x},${y}`;
          })
          .join(" ")
      : "";

  return (
    <main className="relative mx-auto w-full max-w-6xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-900 px-3 py-6 sm:rounded-3xl sm:px-6 sm:py-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-[110px]" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <Link
        href="/dashboard-statii"
        className="relative z-10 text-sm font-medium text-emerald-300/90 hover:text-emerald-200"
      >
        ← Inapoi la lista
      </Link>

      {loading && (
        <div className="mt-8 space-y-4 animate-pulse">
          <div className="h-10 w-2/3 rounded-lg bg-white/10" />
          <div className="h-24 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="h-56 rounded-xl bg-white/5" />
            <div className="h-56 rounded-xl bg-white/5" />
            <div className="h-56 rounded-xl bg-white/5" />
          </div>
        </div>
      )}

      {error && !loading && (
        <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {data && !loading && (
        <div className="relative z-10 mt-8 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{data.stationName}</h2>
              <p className="mt-1 text-sm text-zinc-400">Statie #{data.stationId} · Mircea Eliade 45</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 sm:px-4 sm:text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              LIVE ESP
            </div>
          </div>

          <BikePulse active={data.connected} />

          <div className="grid w-full gap-2 sm:flex sm:flex-wrap">
            <Link
              href={`/rapoarte?statie=${data.stationId}`}
              className="min-h-11 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-100 transition hover:bg-amber-500/20"
            >
              Raporteaza: statie
            </Link>
            <Link
              href={`/rapoarte?statie=${data.stationId}&tip=bicicleta`}
              className="min-h-11 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-xs font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Raporteaza: bicicleta (aici)
            </Link>
          </div>

          {data.connected && data.voltageVolts != null && data.currentAmps != null && data.powerWatts != null && (
            <>
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
                <GlassCard title="Tensiune">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/5 sm:h-40 sm:w-40">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/50 sm:h-32 sm:w-32">
                      <svg className="absolute -rotate-90" width="128" height="128" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.12)" strokeWidth="8" fill="none" />
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="#22d3ee"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(clamp(data.voltageVolts / 5, 0, 1) * 364).toFixed(2)} 364`}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="text-center">
                        <p className="text-2xl font-semibold tabular-nums text-cyan-200 sm:text-3xl">{data.voltageVolts}</p>
                        <p className="text-xs text-zinc-400">V</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm text-zinc-300">
                    Baterie estimata: <span className="font-semibold text-emerald-300">{batteryPercent ?? "-"}%</span>
                  </p>
                </GlassCard>

                <GlassCard title="Curent">
                  <div className="relative h-32 overflow-hidden rounded-xl border border-emerald-400/30 bg-black/25 sm:h-40">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-400/50 via-emerald-300/25 to-transparent transition-all duration-700"
                      style={{ height: `${clamp((data.currentAmps / 2.5) * 100, 8, 100)}%` }}
                    />
                    <div className="wave wave1" />
                    <div className="wave wave2" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-2xl font-semibold tabular-nums text-emerald-200 sm:text-3xl">{data.currentAmps} A</p>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm text-zinc-300">Flux live in timp real</p>
                </GlassCard>

                <GlassCard title="Putere">
                  <div className="rounded-xl border border-amber-300/25 bg-black/25 p-3">
                    <svg viewBox="0 0 260 80" className="h-24 w-full sm:h-32">
                      <defs>
                        <linearGradient id="powerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(250,204,21,0.55)" />
                          <stop offset="100%" stopColor="rgba(250,204,21,0.05)" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="72" x2="260" y2="72" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                      {powerPoints && (
                        <>
                          <polyline fill="none" stroke="#facc15" strokeWidth="3" points={powerPoints} />
                          <polygon points={`0,72 ${powerPoints} 260,72`} fill="url(#powerGradient)" />
                        </>
                      )}
                    </svg>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Curent</span>
                      <span className="font-semibold tabular-nums text-amber-200">{data.powerWatts} W</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Varf</span>
                      <span className="font-semibold tabular-nums text-amber-300">{peakPower} W</span>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Status incarcare</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-zinc-400">Conectat</p>
                    <p className="mt-1 text-xl font-semibold text-emerald-300">{data.connected ? "DA" : "NU"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-zinc-400">Faza</p>
                    <p className="mt-1 text-xl font-semibold text-cyan-200">{chargingPhase(batteryPercent)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-zinc-400">Bike ID</p>
                    <p className="mt-1 truncate font-mono text-sm text-zinc-200">{data.bikeId ?? "-"}</p>
                  </div>
                </div>
                {data.etaMinutesToFull != null && (
                  <p className="mt-4 text-sm text-zinc-300">
                    ETA 100%: <span className="font-semibold text-white">{data.etaMinutesToFull} min</span>
                  </p>
                )}
              </div>
            </>
          )}

          {!data.connected && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-300 backdrop-blur">
              {data.source === "live" && data.stale
                ? "Nu s-au primit date de la ESP in ultimul minut. Verifica alimentarea si conexiunea Wi-Fi."
                : data.source === "live"
                  ? "Asteptam primele masuratori de la ESP (tensiune, curent, putere)."
                  : "Nu este conectata nicio bicicleta la dock-ul de incarcare."}
            </div>
          )}

          <p className="text-center text-xs text-zinc-500">
            {data.source === "live" ? "Date live de la ESP" : "Date simulate"} · actualizat la{" "}
            {new Date(data.updatedAt).toLocaleString("ro-RO", {
              dateStyle: "short",
              timeStyle: "medium",
            })}
          </p>
        </div>
      )}

      <style jsx>{`
        .charge-dot {
          animation: travel 2s linear infinite;
        }

        .charge-delay {
          animation-delay: 1s;
        }

        .wave {
          position: absolute;
          left: -20%;
          width: 140%;
          height: 38%;
          border-radius: 43%;
          background: rgba(16, 185, 129, 0.35);
        }

        .wave1 {
          bottom: 20%;
          animation: waveMove 4s linear infinite;
        }

        .wave2 {
          bottom: 14%;
          opacity: 0.6;
          animation: waveMove 6s linear infinite reverse;
        }

        @keyframes travel {
          0% {
            transform: translate(0px, 0px);
            opacity: 0.2;
          }
          30% {
            transform: translate(-20px, 0px);
            opacity: 1;
          }
          60% {
            transform: translate(-130px, -20px);
            opacity: 1;
          }
          100% {
            transform: translate(-230px, -34px);
            opacity: 0;
          }
        }

        @keyframes waveMove {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(20%);
          }
        }
      `}</style>
    </main>
  );
}
