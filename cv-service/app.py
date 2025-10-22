from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
import math

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# State tracking
rep_state = {}

def calculate_angle(a, b, c):
    """Calculate angle between three points"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360-angle
        
    return angle

def analyze_bicep_curl(landmarks, session_id):
    """Analyze bicep curl form and count reps"""
    
    # Get key landmarks
    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
             landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
             landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
    
    # Calculate elbow angle
    angle = calculate_angle(shoulder, elbow, wrist)
    
    # Initialize session state if needed
    if session_id not in rep_state:
        rep_state[session_id] = {
            'rep_count': 0,
            'stage': 'down',
            'prev_angle': angle
        }
    
    state = rep_state[session_id]
    issues = []
    accuracy = 100.0
    
    # Rep counting logic
    if angle > 160:  # Extended
        if state['stage'] == 'up':
            state['rep_count'] += 1
        state['stage'] = 'down'
    elif angle < 50:  # Flexed
        state['stage'] = 'up'
    
    # Form analysis
    # Check shoulder stability (should stay relatively still)
    shoulder_hip_y_diff = abs(shoulder[1] - landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y)
    if shoulder_hip_y_diff < 0.15:  # Shoulder moving too much
        issues.append('shoulder_movement')
        accuracy -= 15
    
    # Check extension completeness
    if state['stage'] == 'down' and angle < 150:
        issues.append('incomplete_extension')
        accuracy -= 10
    
    # Check flexion completeness
    if state['stage'] == 'up' and angle > 60:
        issues.append('incomplete_flexion')
        accuracy -= 10
    
    # Check wrist alignment
    wrist_elbow_x_diff = abs(wrist[0] - elbow[0])
    if wrist_elbow_x_diff > 0.1:
        issues.append('wrist_alignment')
        accuracy -= 10
    
    accuracy = max(0, min(100, accuracy))
    
    return {
        'angle': round(angle, 2),
        'rep_count': state['rep_count'],
        'stage': state['stage'],
        'accuracy': round(accuracy, 2),
        'issues': issues
    }

@app.route('/analyze', methods=['POST'])
def analyze_frame():
    """Analyze a video frame for bicep curl form"""
    try:
        data = request.json
        session_id = data.get('session_id')
        frame_data = data.get('frame')  # Base64 encoded image
        
        # Decode image
        img_data = base64.b64decode(frame_data.split(',')[1] if ',' in frame_data else frame_data)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = pose.process(frame_rgb)
        
        if not results.pose_landmarks:
            return jsonify({
                'success': False,
                'message': 'No person detected'
            })
        
        # Analyze form
        analysis = analyze_bicep_curl(results.pose_landmarks.landmark, session_id)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/reset/<session_id>', methods=['POST'])
def reset_session(session_id):
    """Reset rep counter for a session"""
    if session_id in rep_state:
        del rep_state[session_id]
    return jsonify({'success': True})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    print('🎥 CV Service running on http://localhost:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
