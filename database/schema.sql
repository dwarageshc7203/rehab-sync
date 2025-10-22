-- Rehab Sync Database Schema

-- Patients Table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    specialization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES doctors(id),
    exercise_type VARCHAR(100) DEFAULT 'bicep_curls',
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER
);

-- IoT Readings Table
CREATE TABLE iot_readings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    fsr_value INTEGER NOT NULL,
    activation_percent FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CV Analysis Table
CREATE TABLE cv_analysis (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    frame_number INTEGER,
    rep_count INTEGER DEFAULT 0,
    current_angle FLOAT,
    accuracy_score FLOAT,
    issues_detected TEXT[],
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) UNIQUE,
    total_reps INTEGER,
    avg_accuracy FLOAT,
    avg_muscle_activation FLOAT,
    peak_muscle_activation FLOAT,
    issues_detected TEXT[],
    recommendations TEXT[],
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO patients (name, email, phone) VALUES 
    ('John Doe', 'john@example.com', '+1234567890'),
    ('Jane Smith', 'jane@example.com', '+0987654321');

INSERT INTO doctors (name, email, specialization) VALUES 
    ('Dr. Sarah Wilson', 'sarah@clinic.com', 'Physical Therapy'),
    ('Dr. Mike Johnson', 'mike@clinic.com', 'Sports Medicine');

-- Indexes
CREATE INDEX idx_sessions_patient ON sessions(patient_id);
CREATE INDEX idx_sessions_doctor ON sessions(doctor_id);
CREATE INDEX idx_iot_session ON iot_readings(session_id);
CREATE INDEX idx_cv_session ON cv_analysis(session_id);
CREATE INDEX idx_reports_session ON reports(session_id);
