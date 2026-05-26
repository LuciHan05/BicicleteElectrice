import Link from "next/link";
import { STATII_BICICLETE } from "@/lib/stations";

const features = [
  {
    title: "Hartă live",
    description: "OpenStreetMap cu zoom fluid și pioneze clare pentru fiecare stație.",
    icon: "◉",
  },
  {
    title: "Locația ta",
    description: "GPS continuu: harta te urmărește la prima fixare, apoi se actualizează discret.",
    icon: "⌖",
  },
  {
    title: "Disponibilitate",
    description: "Vezi rapid câte biciclete sunt libere și câte locuri de parcare rămân.",
    icon: "⚡",
  },
];

export default function Home() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-zinc-950">
      {/* fundal: grilă + glow-uri */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-[24rem] w-[32rem] rounded-full bg-sky-500/15 blur-[110px]"
        aria-hidden
      />

      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg"
              aria-hidden
            >
              🚲
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-white">
                Cluj Bike Explorer
              </p>
              <p className="text-xs text-zinc-500">Stații · Hartă · Timp real</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/dashboard-statii"
              className="min-h-11 rounded-full border border-sky-400/35 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-400/55 hover:bg-sky-500/25"
            >
              Dashboard încărcări
            </Link>
            <Link
              href="/harta"
              className="min-h-11 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/20"
            >
              Deschide harta
            </Link>
            <Link
              href="/rapoarte"
              className="min-h-11 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-400/60 hover:bg-amber-500/25"
            >
              Raport defecțiune
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid flex-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <section className="flex flex-col gap-8">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              Cluj-Napoca
            </p>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Pedalează inteligent prin oraș, cu o hartă{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
                  gândită pentru mobilitate
                </span>
                .
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
                Găsește stația cea mai apropiată, verifică disponibilitatea și lasă harta să te
                ghideze — totul într-un singur ecran, optimizat pentru citire rapidă pe telefon.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/harta"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.98] sm:px-6 sm:py-3.5"
              >
                Pornește explorarea
                <span
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                >
                  →
                </span>
              </Link>
              <Link
                href="/dashboard-statii"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:px-6 sm:py-3.5"
              >
                Dashboard încărcări
              </Link>
              <p className="text-sm text-zinc-500">
                Fără cont · Date demo pe hartă · Permisiune locație opțională
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:max-w-lg">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Stații demo
                </dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
                  {STATII_BICICLETE.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Hartă
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">OSM</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Framework
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">Next</dd>
              </div>
            </dl>
          </section>

          <section className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-1 shadow-2xl shadow-black/40 backdrop-blur-sm">
              <div className="rounded-[0.9rem] border border-white/5 bg-zinc-950/80 p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  În interiorul aplicației
                </p>
                <p className="mt-3 text-lg font-medium text-white">Flux rapid</p>
                <ol className="mt-6 space-y-4 text-sm text-zinc-400">
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-emerald-300">
                      1
                    </span>
                    <span>Deschizi harta fullscreen, gata de interacțiune.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-emerald-300">
                      2
                    </span>
                    <span>Acorzi locația ca să vezi punctul tău și stațiile din jur.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-emerald-300">
                      3
                    </span>
                    <span>Alegi stația din popup — disponibilitate la o privire.</span>
                  </li>
                </ol>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3">
              {features.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <span className="text-lg text-emerald-400/90" aria-hidden>
                    {item.icon}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-zinc-950/90 py-6 text-center text-xs text-zinc-600">
        Cluj Bike Explorer — proiect demo pentru explorarea stațiilor de biciclete.
      </footer>
    </div>
  );
}
