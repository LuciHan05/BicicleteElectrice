"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// REPARARE ICONIȚE STANDARD (pentru stațiile de biciclete)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// Setăm iconița implicită doar pentru pionezele stațiilor
L.Marker.prototype.options.icon = DefaultIcon;


// --- MODIFICARE 1: Definirea Iconiței de Utilizator (User Dot) ---
// Folosim o imagine SVG direct în cod pentru o iconiță modernă, albastră, care iese în evidență.
const UserIconHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="white" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="12" cy="12" r="6" fill="#3b82f6"/>
  </svg>
`;

const UserIcon = L.divIcon({
  html: UserIconHTML,
  className: "custom-user-icon", // O clasă golă ca să nu pună Leaflet stilurile lui
  iconSize: [24, 24],
  iconAnchor: [12, 12], // Centrat perfect
  popupAnchor: [0, -10],
});


// DATELE DE TEST (Stațiile)
const statiiBiciclete = [
  { id: 1, nume: "Piața Unirii", coordonate: [46.7693, 23.5899], biciclete: 5, locuriGoale: 2 },
  { id: 2, nume: "Parcul Central", coordonate: [46.7698, 23.5783], biciclete: 0, locuriGoale: 10 },
  { id: 3, nume: "Iulius Mall", coordonate: [46.7715, 23.6268], biciclete: 12, locuriGoale: 0 },
];


// --- MODIFICARE 2: Robotul de Urmărire în timp real ---
function RobotLocatie() {
  const [pozitie, setPozitie] = useState<[number, number] | null>(null);
  const isFirstLocationFound = useRef(true); // Folosim un 'ref' ca să facem zborul inițial doar o dată
  const harta = useMap(); // Ne conectăm la harta Leaflet

  useEffect(() => {
    if (!harta) return;

    // --- MAGIA ACTUALIZĂRII: Pornim urmărirea continuă ---
    // watch: true - spune hărții să asculte constant GPS-ul.
    // enableHighAccuracy: true - cere date GPS cât mai precise (consumă mai multă baterie).
    harta.locate({ watch: true, enableHighAccuracy: true });

    // Când GPS-ul detectează o locație nouă (prima dată sau în mișcare)
    function onLocationFound(eveniment: L.LocationEvent) {
      const { lat, lng } = eveniment.latlng;
      console.log("Noua locație:", lat, lng); // Ca să vezi în consolă că se mișcă
      setPozitie([lat, lng]);

      // Dacă este prima dată când te găsește, zboară către tine
      if (isFirstLocationFound.current) {
        harta.flyTo(eveniment.latlng, 15);
        isFirstLocationFound.current = false; // Setăm pe false ca să nu mai zboare la fiecare pas
      }
    }

    // Înregistrăm ascultătorul
    harta.on("locationfound", onLocationFound);

    // FUNCȚIA DE CURĂȚENIE: Este obligatoriu să oprim urmărirea când 
1.      // ieșim de pe pagină, altfel telefonul continuă să consume baterie în fundal.
    return () => {
      harta.stopLocate();
      harta.off("locationfound", onLocationFound);
    };
  }, [harta]);

  // Afișăm iconița utilizatorului doar dacă am găsit locația
  return pozitie === null ? null : (
    <Marker position={pozitie} icon={UserIcon}>
      <Popup>
        <strong>📍 Tu ești aici!</strong> <br />
        Harta se va actualiza în timp ce te miști.
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
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Chemăm robotul de urmărire pe hartă */}
      <RobotLocatie />

      {/* Desenăm stațiile standard */}
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