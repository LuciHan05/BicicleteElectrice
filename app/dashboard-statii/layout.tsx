import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardStatiiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/90">
              Monitorizare
            </p>
            <h1 className="text-lg font-semibold text-white">Dashboard stații de încărcare</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              ← Pagina principală
            </Link>
            <Link
              href="/harta"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
            >
              Hartă
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
