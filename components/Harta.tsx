"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// REPARARE BUG VIZUAL: Folosim linkuri directe de pe internet pentru pozele cu pioneze
// Acest cod previne eroarea "iconUrl not set" din Next.js
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

// DATELE NOASTRE: O listă cu 3 stații din Cluj-Napoca
const statiiBiciclete = [
  { id: 1, nume: "Piața Unirii", coordonate: [46.7693, 23.5899], biciclete: 5, locuriGoale: 2 },
  { id: 2, nume: "Parcul Central", coordonate: [46.7698, 23.5783], biciclete: 0, locuriGoale: 10 },
  { id: 3, nume: "Iulius Mall", coordonate: [46.7715, 23.6268], biciclete: 12, locuriGoale: 0 },
];

export default function Harta() {
  return (
    <MapContainer
      center={[46.7712, 23.5966]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* MAGIA: Parcurgem lista de stații și punem câte o pioneză pentru fiecare */}
      {statiiBiciclete.map((statie) => (
        <Marker key={statie.id} position={statie.coordonate as [number, number]}>
          <Popup>
            <strong>{statie.nume}</strong> <br />
            🚲 Disponibile: {statie.biciclete} <br />
            🅿️ Locuri goale: {statie.locuriGoale}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}