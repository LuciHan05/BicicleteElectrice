"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STATII_BICICLETE, type Statie } from "@/lib/stations";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const QUICK_QUESTIONS = [
  "Care e cea mai apropiata statie de mine?",
  "In cat timp se incarca o bicicleta?",
  "Ce statie are cele mai multe biciclete disponibile?",
  "Unde gasesc locuri goale acum?",
  "Ce statie are telemetrie live?",
  "Cum raportez o defectiune?",
  "Care statie are cele mai putine biciclete?",
  "Cate statii sunt in total?",
  "Care sunt statiile conectate la incarcare?",
  "Cum deschid harta rapida?",
  "Imi recomanzi o statie aglomerata?",
  "Care e statia cu disponibilitate buna acum?",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(x));
}

function formatStationsList(stations: Statie[]): string {
  return stations.map((s) => s.nume).join(", ");
}

function findStationInQuestion(question: string): Statie | null {
  const q = normalize(question);
  for (const station of STATII_BICICLETE) {
    const stationName = normalize(station.nume);
    if (q.includes(stationName)) return station;
    const tokens = stationName.split(/[\s-]+/).filter((t) => t.length > 4);
    if (tokens.some((t) => q.includes(t))) return station;
  }
  return null;
}

export default function GhidAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const nextIdRef = useRef(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      role: "assistant",
      text:
        "Salut! Sunt Ghidul tau spre statia de biciclete. Te pot ajuta cu distante, disponibilitate, incarcare si raportare defectiuni.",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [etaByStation, setEtaByStation] = useState<Record<number, number | null>>({});

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationError(null);
      },
      () => {
        setLocationError("Nu am acces la locatie. Activeaza permisiunea pentru raspunsuri mai precise.");
      },
      { enableHighAccuracy: true, timeout: 9000 },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadEtas() {
      const connectedStations = STATII_BICICLETE.filter((s) => s.chargingConnected);
      const results = await Promise.all(
        connectedStations.map(async (station) => {
          try {
            const res = await fetch(`/api/stations/${station.id}/charging`, { cache: "no-store" });
            if (!res.ok) return [station.id, null] as const;
            const data = (await res.json()) as { etaMinutesToFull?: number | null };
            return [station.id, data.etaMinutesToFull ?? null] as const;
          } catch {
            return [station.id, null] as const;
          }
        }),
      );
      if (cancelled) return;
      setEtaByStation(Object.fromEntries(results));
    }
    void loadEtas();
    return () => {
      cancelled = true;
    };
  }, []);

  const domainKeywords = useMemo(
    () => [
      "statie",
      "statii",
      "bicicleta",
      "biciclete",
      "incarcare",
      "incarca",
      "harta",
      "raport",
      "defect",
      "dock",
      "locuri",
      "disponibile",
      "telemetrie",
      "cluj",
    ],
    [],
  );

  function buildAnswer(rawQuestion: string): string {
    const q = normalize(rawQuestion);
    const inDomain = domainKeywords.some((kw) => q.includes(kw));

    if (!inDomain) {
      return "Pot raspunde doar la intrebari despre statiile de biciclete, incarcare, harta si raportare defectiuni. Pentru alte domenii nu sunt configurat.";
    }

    if (q.includes("cea mai aproape") || (q.includes("aproape") && q.includes("statie"))) {
      if (!userLocation) {
        return locationError
          ? `${locationError} Totusi, poti intreba despre disponibilitate sau incarcare.`
          : "Am nevoie de locatia ta pentru a calcula statia cea mai apropiata.";
      }
      const nearest = STATII_BICICLETE.map((s) => ({
        station: s,
        km: haversineKm(userLocation, s.coordonate),
      })).sort((a, b) => a.km - b.km)[0];
      const walkMin = Math.max(2, Math.round(nearest.km * 12));
      return `Cea mai apropiata statie este ${nearest.station.nume}, la ~${nearest.km.toFixed(2)} km de tine (aprox. ${walkMin} minute pe jos).`;
    }

    if ((q.includes("cat timp") || q.includes("cat dureaza")) && q.includes("incarc")) {
      const etaValues = Object.values(etaByStation).filter((v): v is number => typeof v === "number");
      if (etaValues.length > 0) {
        const avg = Math.round(etaValues.reduce((a, b) => a + b, 0) / etaValues.length);
        return `Conform telemetriei/demo curente, o incarcare pana la 100% dureaza in medie ~${avg} minute (poate varia intre aproximativ 45 si 120 minute).`;
      }
      return "In medie, o bicicleta electrica se incarca complet in 60-120 minute, in functie de baterie si statie.";
    }

    if (q.includes("cele mai multe biciclete") || q.includes("unde gasesc biciclete")) {
      const top = [...STATII_BICICLETE].sort((a, b) => b.biciclete - a.biciclete)[0];
      return `Statie recomandata acum: ${top.nume}, cu ${top.biciclete} biciclete disponibile.`;
    }

    if (q.includes("locuri goale") || q.includes("unde pot parca")) {
      const top = [...STATII_BICICLETE].sort((a, b) => b.locuriGoale - a.locuriGoale)[0];
      return `${top.nume} are acum cele mai multe locuri goale: ${top.locuriGoale}.`;
    }

    if (q.includes("telemetrie live") || q.includes("live")) {
      const live = STATII_BICICLETE.filter((s) => s.liveTelemetry);
      if (live.length === 0) return "Momentan nu avem statii cu telemetrie live configurata.";
      return `Statii cu telemetrie live: ${formatStationsList(live)}.`;
    }

    if (q.includes("raport") || q.includes("defect")) {
      return "Pentru defectiuni, intra pe pagina Raport defecțiune si completeaza formularul cu statia, categoria si descrierea problemei.";
    }

    if (q.includes("cate statii")) {
      return `In acest moment sunt ${STATII_BICICLETE.length} statii in aplicatie.`;
    }

    if (q.includes("conectate la incarcare")) {
      const connected = STATII_BICICLETE.filter((s) => s.chargingConnected);
      return connected.length
        ? `Statii conectate la incarcare acum: ${formatStationsList(connected)}.`
        : "Momentan nu exista statii raportate ca fiind conectate la incarcare.";
    }

    if (q.includes("harta")) {
      return "Harta este in timp real pe pagina Harta: vezi toate statiile, disponibilitatea si pozitia ta curenta.";
    }

    if (q.includes("cum ajung") || q.includes("drum") || q.includes("route")) {
      const station = findStationInQuestion(q);
      if (station && userLocation) {
        const km = haversineKm(userLocation, station.coordonate);
        const walkMin = Math.max(2, Math.round(km * 12));
        return `Pana la ${station.nume} ai aproximativ ${km.toFixed(2)} km (${walkMin} minute pe jos).`;
      }
      return "Spune-mi numele statiei si iti calculez estimativ distanta (daca am acces la locatie).";
    }

    if (q.includes("program")) {
      return "Aplicatia demo nu include inca orarul oficial al operatorului, dar pot sa te ajut cu disponibilitate, incarcare si statia cea mai apropiata.";
    }

    return "Pot ajuta cu: statia cea mai apropiata, disponibilitate biciclete/locuri, timp de incarcare, telemetrie live si raportare defectiuni.";
  }

  function pushMessage(role: "assistant" | "user", text: string) {
    const idNum = ++nextIdRef.current;
    const id = `m-${idNum}-${Date.now().toString(36)}`;
    setMessages((prev) => [...prev, { id, role, text }]);
  }

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    pushMessage("user", trimmed);
    setInput("");
    setIsThinking(true);
    window.setTimeout(() => {
      const answer = buildAnswer(trimmed);
      pushMessage("assistant", answer);
      setIsThinking(false);
    }, 250);
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[1200] flex w-[calc(100vw-2rem)] max-w-sm flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="pointer-events-auto w-full rounded-2xl border border-white/15 bg-zinc-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Ghidul tau spre statia de biciclete</p>
              <p className="text-[11px] text-zinc-500">Asistent local: intrebari despre bike-sharing</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/10"
            >
              Inchide
            </button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "assistant"
                    ? "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
                    : "ml-8 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-xs text-sky-100"
                }
              >
                {m.text}
              </div>
            ))}
            {isThinking ? (
              <p className="text-xs text-zinc-500">Analizez intrebarea...</p>
            ) : null}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask(input);
              }}
              placeholder="Intreaba despre statii si incarcare..."
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => ask(input)}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:brightness-110"
            >
              Trimite
            </button>
          </div>

          <div className="mt-3 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => ask(question)}
                className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-zinc-300 transition hover:bg-white/10"
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto rounded-full border border-emerald-400/40 bg-zinc-950/95 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-lg shadow-black/40 backdrop-blur-md transition hover:border-emerald-300/60 hover:bg-zinc-900"
      >
        {open ? "Ascunde ghidul AI" : "Deschide ghidul AI"}
      </button>
    </div>
  );
}
