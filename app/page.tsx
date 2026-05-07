"use client";
import dynamic from "next/dynamic";

// Aducem harta în aplicație. Folosim funcția 'dynamic' pentru a spune
// aplicației să încarce harta doar pe calculatorul utilizatorului (client-side), 
// altfel ne-ar da eroare.
const HartaNoastra = dynamic(() => import("../components/Harta"), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ margin: 0, padding: 0 }}>
      <HartaNoastra />
    </main>
  );
}