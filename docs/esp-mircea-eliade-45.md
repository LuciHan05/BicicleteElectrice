# Telemetrie ESP — Stația Mircea Eliade 45

Stația are **ID 7** în aplicație. ESP-ul trimite tensiune, curent și putere prin HTTP POST.

## 1. Pornește aplicația

```bash
npm run dev
```

Notează IP-ul PC-ului din rețeaua Wi-Fi (ex. `192.168.1.10`). ESP-ul și PC-ul trebuie să fie pe **aceeași rețea**.

## 2. Endpoint ingest

```
POST http://<IP-PC>:3000/api/stations/7/charging/ingest
Content-Type: application/json
X-Telemetry-Key: dev-telemetry-key
```

**Body JSON** (ambele formate sunt acceptate):

```json
{
  "voltageVolts": 4.12,
  "currentAmps": 0.21,
  "powerWatts": 0.87,
  "connected": true
}
```

sau direct din sketch-ul tău Arduino:

```json
{
  "tensiune": 4.12,
  "curent": 0.21,
  "putere": 0.87
}
```

| Câmp | Obligatoriu | Descriere |
|------|-------------|-----------|
| `voltageVolts` / `tensiune` | da | Tensiune (V) |
| `currentAmps` / `curent` | da | Curent (A) |
| `powerWatts` / `putere` | nu | Putere (W); dacă lipsește: V × A |
| `connected` | nu | `false` = stație deconectată |
| `batteryPercent` | nu | Procent baterie (opțional) |

## 3. Setup Arduino Uno + ESP8266 (sketch-ul tău)

Fluxul tău actual este corect:

```
Senzori → Arduino (LCD + LED) → SoftwareSerial JSON → ESP8266 → HTTP → Next.js
```

1. **Păstrezi** sketch-ul Arduino așa cum îl ai (trimite JSON la 1 s).
2. **Încarci pe ESP8266** firmware-ul din `docs/firmware/esp8266-bridge-arduino.ino` (setezi Wi-Fi + IP PC).
3. **Cablare**: Arduino TX (pin 5) → ESP RX; GND comun; folosește **convertor 5V→3.3V** pe linia TX Arduino.

La pornire, ESP afișează în Serial Monitor `HTTP 200` dacă datele ajung în app.

## 4. Exemplu cod direct pe ESP (fără Arduino intermediar)

Adaugă în `loop()` (după ce citești senzorii):

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* TELEMETRY_HOST = "192.168.1.10";  // IP-ul PC-ului cu npm run dev
const int TELEMETRY_PORT = 3000;
const int STATION_ID = 7;
const char* TELEMETRY_KEY = "dev-telemetry-key";

void sendTelemetry(float voltage, float current, float power) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String("http://") + TELEMETRY_HOST + ":" + TELEMETRY_PORT
    + "/api/stations/" + STATION_ID + "/charging/ingest";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Telemetry-Key", TELEMETRY_KEY);

  StaticJsonDocument<256> doc;
  doc["voltageVolts"] = voltage;
  doc["currentAmps"] = current;
  doc["powerWatts"] = power;
  doc["connected"] = true;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  Serial.printf("Telemetrie HTTP %d\n", code);
  http.end();
}
```

Trimite la fiecare 2–5 secunde (ex. `delay(3000)` în `loop`).

## 5. Vezi datele în aplicație

1. Deschide [Dashboard stații](/dashboard-statii)
2. Intră la **Mircea Eliade 45**
3. Valorile se actualizează automat la ~3 secunde

Dacă nu apar date: verifică Serial Monitor (cod HTTP 200), firewall Windows pentru portul 3000, și că `TELEMETRY_HOST` este IP-ul corect.

## 6. Producție

Setează în `.env.local`:

```
TELEMETRY_API_KEY=o-cheie-lunga-sigura
```

Folosește aceeași cheie în firmware ESP.
