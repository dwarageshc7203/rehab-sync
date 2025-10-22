/**
 * ESP32 Rehab Sync - IoT Sensor Module
 * Reads FSR (Force Sensitive Resistor) and sends data to backend
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuration
const char* WIFI_SSID = "Airtel_CNL";
const char* WIFI_PASSWORD = "dwarageshdc";
const char* BACKEND_URL = "http://192.168.1.100:3000/iot/reading";

// Hardware pins
const int FSR_PIN = 34;  // Analog pin for FSR

// Session configuration
int sessionId = 0;  // Set this via Serial or hardcode

// Calibration values
const int FSR_MIN = 0;      // Minimum FSR reading (no pressure)
const int FSR_MAX = 4095;   // Maximum FSR reading (full pressure)

void setup() {
  Serial.begin(115200);
  
  // Initialize FSR pin
  pinMode(FSR_PIN, INPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("ESP32 Rehab Sync Ready!");
  Serial.println("Commands: SESSION=<id> to set session ID");
}

void loop() {
  // Check for serial commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command.startsWith("SESSION=")) {
      sessionId = command.substring(8).toInt();
      Serial.print("Session ID set to: ");
      Serial.println(sessionId);
    }
  }
  
  // Only send data if session is active
  if (sessionId > 0 && WiFi.status() == WL_CONNECTED) {
    // Read FSR
    int fsrValue = analogRead(FSR_PIN);
    float activationPercent = mapToPercent(fsrValue);
    
    // Send to backend
    sendReading(sessionId, fsrValue, activationPercent);
    
    // Debug output
    Serial.print("FSR: ");
    Serial.print(fsrValue);
    Serial.print(" | Activation: ");
    Serial.print(activationPercent);
    Serial.println("%");
  }
  
  delay(100);  // 10Hz sampling rate
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

float mapToPercent(int fsrValue) {
  // Map FSR value to 0-100% range
  float percent = ((float)(fsrValue - FSR_MIN) / (FSR_MAX - FSR_MIN)) * 100.0;
  
  // Clamp to 0-100
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;
  
  return percent;
}

void sendReading(int sessionId, int fsrValue, float activationPercent) {
  HTTPClient http;
  
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["session_id"] = sessionId;
  doc["fsr_value"] = fsrValue;
  doc["activation_percent"] = activationPercent;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    // Success
    if (httpResponseCode != 200 && httpResponseCode != 201) {
      Serial.print("HTTP Error: ");
      Serial.println(httpResponseCode);
    }
  } else {
    Serial.print("Connection Error: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
