"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import GhidAI from "@/components/GhidAI";

const HartaNoastra = dynamic(() => import("../../components/Harta"), {
  ssr: false,
});

export default function PaginaHarta() {
  return (
    <main style={{ margin: 0, padding: 0, position: "relative" }}>
      
      <div className="absolute inset-x-4 top-4 z-[1000] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-auto sm:flex-row sm:items-start">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-zinc-950/90 px-5 py-2.5 text-sm font-semibold text-zinc-100 shadow-lg shadow-black/40 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-zinc-900/95 active:scale-[0.98] sm:w-auto"
        >
          ← Acasă
        </Link>
        <Link
          href="/rapoarte"
          className="w-full rounded-full border border-amber-500/40 bg-zinc-950/90 px-5 py-2.5 text-center text-sm font-semibold text-amber-100 shadow-lg shadow-black/40 backdrop-blur-md transition hover:border-amber-400/60 hover:bg-zinc-900/95 active:scale-[0.98] sm:w-auto"
        >
          Raport defecțiune
        </Link>
      </div>

      <HartaNoastra />
      <GhidAI />
    </main>
  );
}