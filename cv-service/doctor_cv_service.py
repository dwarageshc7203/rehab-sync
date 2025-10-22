from flask import Flask, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import threading

app = Flask(__name__)
CORS(app)

# MediaPipe pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Shared state
latest_analysis = {
    'rep_count': 0,
    'stage': 'down',
    'accuracy': 100.0,
    'issues': [],
    'angle': 0
}

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

def analyze_bicep_curl(landmarks):
    global latest_analysis
    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
             landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
             landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

    angle = calculate_angle(shoulder, elbow, wrist)
    state = latest_analysis
    issues = []
    accuracy = 100.0

    # Rep counting
    if angle > 160:
        if state['stage'] == 'up':
            state['rep_count'] += 1
        state['stage'] = 'down'
    elif angle < 50:
        state['stage'] = 'up'

    # Form checks
    shoulder_hip_y_diff = abs(shoulder[1] - landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y)
    if shoulder_hip_y_diff > 0.15:
        issues.append('shoulder_movement')
        accuracy -= 15
    if state['stage'] == 'down' and angle < 150:
        issues.append('incomplete_extension')
        accuracy -= 10
    if state['stage'] == 'up' and angle > 60:
        issues.append('incomplete_flexion')
        accuracy -= 10
    wrist_elbow_x_diff = abs(wrist[0] - elbow[0])
    if wrist_elbow_x_diff > 0.1:
        issues.append('wrist_alignment')
        accuracy -= 10

    accuracy = max(0, min(100, accuracy))
    latest_analysis.update({
        'angle': round(angle, 2),
        'rep_count': state['rep_count'],
        'stage': state['stage'],
        'accuracy': round(accuracy, 2),
        'issues': issues
    })

def cv_loop():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Cannot open webcam")
        return
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)
        if results.pose_landmarks:
            analyze_bicep_curl(results.pose_landmarks.landmark)
        cv2.putText(frame, f"Reps: {latest_analysis['rep_count']}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow('Doctor CV Feed', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()

# Start CV loop
threading.Thread(target=cv_loop, daemon=True).start()

@app.route('/doctor_analysis', methods=['GET'])
def get_latest_analysis():
    return jsonify(latest_analysis)

@app.route('/reset', methods=['POST'])
def reset_analysis():
    latest_analysis.update({
        'rep_count': 0,
        'stage': 'down',
        'accuracy': 100.0,
        'issues': [],
        'angle': 0
    })
    return jsonify({'success': True})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    threading.Thread(target=cv_loop, daemon=True).start()
    print("🎥 Doctor CV Service running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)

