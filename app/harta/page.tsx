"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const HartaNoastra = dynamic(() => import("../../components/Harta"), {
  ssr: false,
});

export default function PaginaHarta() {
  return (
    <main style={{ margin: 0, padding: 0, position: "relative" }}>
      
      {/* Butonul de Întoarcere "Plutitor" */}
      {/* Folosim z-[1000] ca să fim siguri că stă deasupra hărții */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/90 px-5 py-2.5 text-sm font-semibold text-zinc-100 shadow-lg shadow-black/40 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-zinc-900/95 active:scale-[0.98]"
        >
          ← Acasă
        </Link>
        <Link
          href="/rapoarte"
          className="rounded-full border border-amber-500/40 bg-zinc-950/90 px-5 py-2.5 text-sm font-semibold text-amber-100 shadow-lg shadow-black/40 backdrop-blur-md transition hover:border-amber-400/60 hover:bg-zinc-900/95 active:scale-[0.98]"
        >
          Raport defecțiune
        </Link>
      </div>

      <HartaNoastra />
    </main>
  );
}