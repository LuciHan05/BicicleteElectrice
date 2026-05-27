"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORII_BICICLETA, CATEGORII_STATIE } from "@/lib/defect-categories";
import type { DefectReportRecord, DefectTarget } from "@/lib/report-types";
import type { StationListItemDTO } from "@/lib/charging-types";

function RaportFormInner() {
  const searchParams = useSearchParams();
  const [stations, setStations] = useState<StationListItemDTO[] | null>(null);
  const [recent, setRecent] = useState<DefectReportRecord[]>([]);
  const [target, setTarget] = useState<DefectTarget>("station");
  const [stationId, setStationId] = useState("");
  const [bikeIdentifier, setBikeIdentifier] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const categories = useMemo(
    () => (target === "station" ? CATEGORII_STATIE : CATEGORII_BICICLETA),
    [target],
  );

  const loadStations = useCallback(async () => {
    try {
      const res = await fetch("/api/stations", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as { stations: StationListItemDTO[] };
      setStations(body.stations);
    } catch {
      setStations([]);
    }
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/reports?limit=8", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as { reports: DefectReportRecord[] };
      setRecent(body.reports);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStations();
    void loadRecent();
  }, [loadStations, loadRecent]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const s = searchParams.get("statie");
      const tip = searchParams.get("tip");
      if (tip === "bicicleta" || tip === "bike") setTarget("bike");
      if (s) {
        const n = Number.parseInt(s, 10);
        if (Number.isFinite(n) && n > 0) setStationId(String(n));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessId(null);
    setSubmitting(true);
    try {
      const sid = stationId === "" ? null : Number.parseInt(stationId, 10);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          stationId: sid,
          bikeIdentifier: bikeIdentifier.trim() || null,
          category,
          description,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body === "object" && body && "error" in body
            ? String((body as { error: string }).error)
            : `Eroare ${res.status}`,
        );
      }
      const id = (body as { report?: { id: string } }).report?.id;
      if (id) setSuccessId(id);
      setDescription("");
      setBikeIdentifier("");
      void loadRecent();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Trimiterea a eșuat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm leading-relaxed text-zinc-400">
        Descrie problema la o stație de încărcare sau la o bicicletă. Raportul este salvat
        temporar pe server (demo) — în producție se leagă de ticketing sau bază de date.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
          <legend className="text-sm font-semibold text-white">Tip raport</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="target"
                checked={target === "station"}
                onChange={() => {
                  setTarget("station");
                  setCategory("");
                }}
                className="border-zinc-600 text-emerald-500 focus:ring-emerald-500/50"
              />
              Stație de încărcare
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="target"
                checked={target === "bike"}
                onChange={() => {
                  setTarget("bike");
                  setCategory("");
                }}
                className="border-zinc-600 text-emerald-500 focus:ring-emerald-500/50"
              />
              Bicicletă
            </label>
          </div>
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="station" className="block text-sm font-medium text-zinc-300">
            Stație {target === "station" ? "(obligatoriu)" : "(opțional, ajută la localizare)"}
          </label>
          <select
            id="station"
            required={target === "station"}
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{target === "station" ? "— Alege stația —" : "— Fără stație —"}</option>
            {stations?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nume}
              </option>
            ))}
          </select>
          {!stations?.length && (
            <p className="text-xs text-amber-200/80">Lista de stații nu s-a putut încărca.</p>
          )}
        </div>

        {target === "bike" && (
          <div className="space-y-2">
            <label htmlFor="bikeId" className="block text-sm font-medium text-zinc-300">
              Cod / ID bicicletă (opțional)
            </label>
            <input
              id="bikeId"
              type="text"
              value={bikeIdentifier}
              onChange={(e) => setBikeIdentifier(e.target.value)}
              placeholder="ex. CBE-3-ABC sau număr cadru"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              maxLength={120}
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-zinc-300">
            Categorie
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">— Alege categoria —</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="desc" className="block text-sm font-medium text-zinc-300">
            Descriere (min. 12 caractere)
          </label>
          <textarea
            id="desc"
            required
            minLength={12}
            maxLength={4000}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ce s-a întâmplat, când, ce ai încercat deja…"
            className="w-full resize-y rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {formError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {formError}
          </div>
        )}

        {successId && (
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Raport înregistrat. Număr referință:{" "}
            <span className="font-mono font-semibold text-white">{successId}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "Se trimite…" : "Trimite raportul"}
        </button>
      </form>

      <section className="mt-12 border-t border-white/10 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Rapoarte recente (demo, memorie server)
        </h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">Niciun raport încă în această sesiune.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm"
              >
                <p className="font-mono text-xs text-zinc-500">{r.id}</p>
                <p className="mt-1 text-zinc-200">
                  <span className="text-amber-200/90">
                    {r.target === "station" ? "Stație" : "Bicicletă"}
                  </span>
                  {" · "}
                  {r.stationName ?? "fără stație"}
                  {r.bikeIdentifier ? ` · ${r.bikeIdentifier}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">{r.categoryLabel}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-zinc-600">
          Pentru urgențe reale folosește canalele operatorului public de bike-sharing.
        </p>
      </section>
    </main>
  );
}

function RaportFormFallback() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-zinc-500">
      Se încarcă formularul…
    </main>
  );
}

export default function RapoartePage() {
  return (
    <Suspense fallback={<RaportFormFallback />}>
      <RaportFormInner />
    </Suspense>
  );
}
