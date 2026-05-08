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
      <div className="absolute top-4 right-4 z-[1000]">
        <Link
          href="/"
          className="bg-white text-blue-600 font-extrabold py-3 px-6 rounded-full shadow-lg border-2 border-blue-600 hover:bg-blue-50 transition transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          ⬅ Acasă
        </Link>
      </div>

      <HartaNoastra />
    </main>
  );
}