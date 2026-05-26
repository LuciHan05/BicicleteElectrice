/**
 * ESP8266 — pod între Arduino (SoftwareSerial JSON) și aplicația Next.js
 *
 * Cablare (Arduino Uno → ESP8266, 3.3V obligatoriu pe liniile de date):
 *   Arduino pin 5 (TX)  →  ESP RX (GPIO3)
 *   Arduino pin 6 (RX)  →  ESP TX (GPIO1)  + divizor 5V→3.3V pe TX Arduino
 *   GND comun
 *
 * Librării (Arduino IDE → Manager): ESP8266, ArduinoJson by Benoit Blanchon
 *
 * Înainte de upload: deconectează firul de la ESP RX (conflict la programare).
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// --- Wi-Fi (aceeași rețea ca PC-ul cu npm run dev) ---
const char* WIFI_SSID = "NUMELE_RETELEI";
const char* WIFI_PASSWORD = "PAROLA_WIFI";

// --- Server aplicație (IP-ul PC-ului, nu localhost) ---
const char* TELEMETRY_HOST = "192.168.1.10";
const uint16_t TELEMETRY_PORT = 3000;
const int STATION_ID = 7;
const char* TELEMETRY_KEY = "dev-telemetry-key";

// Serial = legătura cu Arduino (9600, ca în sketch-ul tău)
String lineBuffer;

void connectWifi() {
  WiFi.disconnect(true);
  delay(500);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP ESP: ");
  Serial.println(WiFi.localIP());
}

/** O celulă LiPo ~3.0–4.2 V → procent orientativ pentru dashboard */
float batteryPercentFromVoltage(float v) {
  if (v < 3.0f) return 0.0f;
  if (v > 4.2f) return 100.0f;
  return ((v - 3.0f) / (4.2f - 3.0f)) * 100.0f;
}

bool sendToApp(float tensiune, float curent, float putere) {
  if (WiFi.status() != WL_CONNECTED) return false;

  const bool incarcare = curent > 0.01f;
  const bool conectat = incarcare || tensiune >= 3.0f;

  WiFiClient client;
  HTTPClient http;
  String url = String("http://") + TELEMETRY_HOST + ":" + TELEMETRY_PORT
    + "/api/stations/" + String(STATION_ID) + "/charging/ingest";

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Telemetry-Key", TELEMETRY_KEY);

  StaticJsonDocument<256> doc;
  doc["tensiune"] = tensiune;
  doc["curent"] = curent;
  doc["putere"] = putere;
  doc["connected"] = conectat;
  if (tensiune >= 3.0f) {
    doc["batteryPercent"] = batteryPercentFromVoltage(tensiune);
  }

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  http.end();

  Serial.print("HTTP ");
  Serial.println(code);
  return code == 200;
}

void handleArduinoLine(const String& line) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, line);
  if (err) {
    Serial.print("JSON err: ");
    Serial.println(err.c_str());
    return;
  }

  if (!doc.containsKey("tensiune") || !doc.containsKey("curent")) {
    Serial.println("Lipseste tensiune/curent");
    return;
  }

  float tensiune = doc["tensiune"];
  float curent = doc["curent"];
  float putere = doc["putere"].isNull() ? tensiune * curent : doc["putere"].as<float>();

  sendToApp(tensiune, curent, putere);
}

void setup() {
  Serial.begin(9600);
  delay(200);
  connectWifi();
  Serial.println("Astept JSON de la Arduino...");
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (lineBuffer.length() > 0) {
        handleArduinoLine(lineBuffer);
        lineBuffer = "";
      }
    } else {
      lineBuffer += c;
      if (lineBuffer.length() > 200) lineBuffer = "";
    }
  }
}
