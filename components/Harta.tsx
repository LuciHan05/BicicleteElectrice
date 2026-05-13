"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Statie } from "@/lib/stations";
import { STATII_BICICLETE } from "@/lib/stations";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserIconHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="white" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="12" cy="12" r="6" fill="#3b82f6"/>
  </svg>
`;

const UserIcon = L.divIcon({
  html: UserIconHTML,
  className: "custom-user-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

function RobotLocatie() {
  const [pozitie, setPozitie] = useState<[number, number] | null>(null);
  const isFirstLocationFound = useRef(true);
  const harta = useMap();

  useEffect(() => {
    if (!harta) return;

    harta.locate({ watch: true, enableHighAccuracy: true });

    function onLocationFound(eveniment: L.LocationEvent) {
      const { lat, lng } = eveniment.latlng;
      console.log("Noua locație:", lat, lng);
      setPozitie([lat, lng]);

      if (isFirstLocationFound.current) {
        harta.flyTo(eveniment.latlng, 15);
        isFirstLocationFound.current = false;
      }
    }

    harta.on("locationfound", onLocationFound);

    return () => {
      harta.stopLocate();
      harta.off("locationfound", onLocationFound);
    };
  }, [harta]);

  return pozitie === null ? null : (
    <Marker position={pozitie} icon={UserIcon}>
      <Popup>
        <strong>📍 Tu ești aici!</strong> <br />
        Harta se va actualiza în timp ce te miști.
      </Popup>
    </Marker>
  );
}

function StationMarker({ statie }: { statie: Statie }) {
  return (
    <Marker position={statie.coordonate}>
      <Popup>
        <div className="min-w-[220px] max-w-[280px] font-sans text-sm text-zinc-900">
          <p className="text-base font-semibold text-zinc-950">{statie.nume}</p>
          <p className="mt-2 text-zinc-700">
            🚲 Disponibile: <strong>{statie.biciclete}</strong>
          </p>
          <p className="text-zinc-700">
            🅿️ Locuri goale: <strong>{statie.locuriGoale}</strong>
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Status încărcare:{" "}
            <strong>{statie.chargingConnected ? "conectat (demo)" : "deconectat"}</strong>
          </p>
          <Link
            href={`/dashboard-statii/${statie.id}`}
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Deschide în dashboard
          </Link>
          <Link
            href="/dashboard-statii"
            className="mt-2 block text-center text-xs font-medium text-emerald-700 underline-offset-2 hover:underline"
          >
            Toate stațiile
          </Link>
          <Link
            href={`/rapoarte?statie=${statie.id}`}
            className="mt-2 block text-center text-xs font-semibold text-amber-800 underline-offset-2 hover:underline"
          >
            Raportează defecțiune
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}

export default function Harta() {
  return (
    <MapContainer
      center={[46.7712, 23.5966]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <RobotLocatie />

      {STATII_BICICLETE.map((statie) => (
        <StationMarker key={statie.id} statie={statie} />
      ))}
    </MapContainer>
  );
}
