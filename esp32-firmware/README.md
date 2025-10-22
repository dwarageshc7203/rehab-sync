# ESP32 Firmware Setup

## Hardware Requirements
- ESP32 Development Board
- FSR (Force Sensitive Resistor)
- 10kΩ resistor (for voltage divider)
- Jumper wires

## Wiring Diagram
```
FSR -------- ESP32 GPIO 34 (Analog)
    |
    +------ 10kΩ Resistor ------ GND
```

## Arduino IDE Setup

1. **Install ESP32 Board Support**
   - Open Arduino IDE
   - File → Preferences
   - Add to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Tools → Board → Boards Manager
   - Search "ESP32" and install

2. **Install Required Libraries**
   - Sketch → Include Library → Manage Libraries
   - Install: `ArduinoJson` (version 6.x)

3. **Configure the Code**
   - Open `esp32-rehab.ino`
   - Update WiFi credentials:
     ```cpp
     const char* WIFI_SSID = "your-wifi-name";
     const char* WIFI_PASSWORD = "your-wifi-password";
     ```
   - Update backend URL (use your computer's local IP):
     ```cpp
     const char* BACKEND_URL = "http://192.168.1.XXX:3000/iot/reading";
     ```

4. **Upload to ESP32**
   - Tools → Board → ESP32 Dev Module
   - Tools → Port → (Select your ESP32 port)
   - Click Upload

## Usage

1. Open Serial Monitor (115200 baud)
2. When patient starts a session, note the session ID
3. Send command via Serial Monitor:
   ```
   SESSION=<session_id>
   ```
4. ESP32 will start sending FSR readings automatically

## Troubleshooting

- **WiFi won't connect**: Check SSID/password, ensure 2.4GHz network
- **Backend unreachable**: Verify IP address, check firewall
- **No FSR readings**: Check wiring, test FSR with multimeter
