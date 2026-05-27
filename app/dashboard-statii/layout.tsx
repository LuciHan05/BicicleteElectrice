"use client";

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
          <nav className="hidden flex-wrap items-center gap-2 sm:flex">
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
            <Link
              href="/rapoarte"
              className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20"
            >
              Raport defecțiune
            </Link>
          </nav>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white sm:hidden"
            aria-label="Meniu"
            onClick={() => {
              const menu = document.getElementById('mobile-menu-statii');
              if (menu) menu.classList.toggle('hidden');
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav id="mobile-menu-statii" className="hidden border-t border-white/10 bg-zinc-950/95 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white text-center"
            >
              ← Pagina principală
            </Link>
            <Link
              href="/harta"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 text-center"
            >
              Hartă
            </Link>
            <Link
              href="/rapoarte"
              className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20 text-center"
            >
              Raport defecțiune
            </Link>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
