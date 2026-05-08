"use client";

import dynamic from "next/dynamic";

const HartaNoastra = dynamic(() => import("../../components/Harta"), {
  ssr: false,
});

export default function PaginaHarta() {
  return (
    <main style={{ margin: 0, padding: 0 }}>
      <HartaNoastra />
    </main>
  );
}