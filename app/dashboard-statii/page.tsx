"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StationListItemDTO } from "@/lib/charging-types";

export default function DashboardStatiiPage() {
  const [stations, setStations] = useState<StationListItemDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stations", { cache: "no-store" });
        if (!res.ok) throw new Error(`Eroare ${res.status}`);
        const body = (await res.json()) as { stations: StationListItemDTO[] };
        if (!cancelled) setStations(body.stations);
      } catch {
        if (!cancelled) setError("Nu s-a putut încărca lista de stații.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
        Selectează o stație pentru a vedea dacă există o bicicletă conectată la încărcare și
        parametrii de încărcare (tensiune, curent, putere). Stația{" "}
        <span className="text-cyan-300/90">Mircea Eliade 45</span> primește date live de la ESP.
        Ai o problemă?{" "}
        <Link
          href="/rapoarte"
          className="font-medium text-amber-200/90 underline-offset-2 hover:underline"
        >
          Raportează o defecțiune
        </Link>
        .
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!error && stations === null && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]"
            />
          ))}
        </div>
      )}

      {stations && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((s) => (
            <li key={s.id}>
              <Link
                href={`/dashboard-statii/${s.id}`}
                className="group flex h-full min-h-40 flex-col rounded-2xl border border-white/10 bg-zinc-900/40 p-4 shadow-lg shadow-black/20 transition hover:border-emerald-500/35 hover:bg-zinc-900/70 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-white group-hover:text-emerald-100 sm:text-base">
                    {s.nume}
                  </h2>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    {s.liveTelemetry ? (
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                        ESP live
                      </span>
                    ) : null}
                    <span
                      className={
                        s.chargingConnected
                          ? "rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
                          : "rounded-full bg-zinc-600/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
                      }
                    >
                      {s.chargingConnected ? "Conectat" : "Deconectat"}
                    </span>
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-500">
                  🚲 {s.biciclete} disponibile · 🅿️ {s.locuriGoale} locuri libere
                </p>
                <span className="mt-4 text-sm font-medium text-emerald-400/90">
                  Vezi detalii →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
