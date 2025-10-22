from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np

app = Flask(__name__)
CORS(app)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

reps = 0
stage = None
angle = 0
last_analysis = {}  # store last results

@app.route('/analyze', methods=['POST'])
def analyze_frame():
    global reps, stage, angle, last_analysis

    file = request.files['frame']
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        # Just an example: compute angle
        shoulder = [landmarks[11].x, landmarks[11].y]
        elbow = [landmarks[13].x, landmarks[13].y]
        wrist = [landmarks[15].x, landmarks[15].y]

        a = np.array(shoulder)
        b = np.array(elbow)
        c = np.array(wrist)
        radians = np.arccos(np.clip(np.dot(a-b, c-b) / (np.linalg.norm(a-b)*np.linalg.norm(c-b)), -1.0, 1.0))
        angle = np.degrees(radians)

        if angle > 160:
            stage = "down"
        if angle < 30 and stage == 'down':
            stage = "up"
            reps += 1

    last_analysis = {"angle": angle, "stage": stage, "reps": reps}
    return jsonify(last_analysis)

@app.route('/get_analysis', methods=['GET'])
def get_analysis():
    return jsonify(last_analysis)
