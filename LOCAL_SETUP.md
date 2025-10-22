# Rehab Sync - Local Setup Guide

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Arduino IDE (for ESP32)
- Python 3.8+ (for CV microservice)

## Project Structure
```
rehab-sync/
├── backend/              # NestJS backend
├── frontend/             # HTML frontend
├── cv-service/           # Python CV microservice
├── esp32-firmware/       # ESP32 code
└── database/             # SQL schemas
```

## Setup Instructions

### 1. Database Setup
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE rehab_sync;
\c rehab_sync

# Run schema
psql -U postgres -d rehab_sync -f database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

Backend runs on: http://localhost:3000

### 3. CV Service Setup
```bash
cd cv-service
pip install -r requirements.txt
python app.py
```

CV Service runs on: http://localhost:5000

### 4. Frontend Setup
```bash
cd frontend
# Open index.html in browser or use:
python -m http.server 8080
```

Frontend runs on: http://localhost:8080

### 5. ESP32 Setup
1. Open `esp32-firmware/esp32-rehab.ino` in Arduino IDE
2. Install ESP32 board support
3. Update WiFi credentials and backend URL
4. Upload to ESP32

## API Endpoints

### Sessions
- POST `/sessions/start` - Start new session
- POST `/sessions/:id/end` - End session
- GET `/sessions/:id` - Get session details

### IoT
- POST `/iot/reading` - Submit sensor reading
- WS `/iot/stream` - Real-time IoT data stream

### CV Analysis
- POST `/cv/analyze` - Submit frame for analysis
- WS `/cv/stream` - Real-time CV analysis stream

### Reports
- POST `/reports/generate/:sessionId` - Generate session report
- GET `/reports/:id` - Get report details

## WebSocket Events

### Patient Side
- `session:started` - Session initiated
- `iot:data` - Sensor data update

### Doctor Side
- `video:frame` - Receive video frame
- `cv:analysis` - CV analysis results
- `iot:data` - Sensor data
- `report:ready` - Report generation complete

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/rehab_sync
CV_SERVICE_URL=http://localhost:5000
PORT=3000
```

### ESP32 (config.h)
```cpp
const char* WIFI_SSID = "your-wifi";
const char* WIFI_PASSWORD = "your-password";
const char* BACKEND_URL = "http://192.168.1.100:3000";
```
