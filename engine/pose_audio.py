import mediapipe as mp
import numpy as np
import cv2

class PoseAudioAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5)
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)
    
    def analyze_pose(self, frame):
        results = self.pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        pose_landmarks = []
        if results.pose_landmarks:
            for landmark in results.pose_landmarks.landmark:
                pose_landmarks.append({
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z,
                    "visibility": landmark.visibility
                })
        return pose_landmarks

    def blur_faces(self, frame):
        results = self.face_detection.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if results.detections:
            for detection in results.detections:
                bbox = detection.location_data.relative_bounding_box
                ih, iw, _ = frame.shape
                x, y, w, h = int(bbox.xmin * iw), int(bbox.ymin * ih), int(bbox.width * iw), int(bbox.height * ih)
                # Expand box slightly
                x, y = max(0, x), max(0, y)
                face_roi = frame[y:y+h, x:x+w]
                if face_roi.size > 0:
                    blurred_face = cv2.GaussianBlur(face_roi, (99, 99), 30)
                    frame[y:y+h, x:x+w] = blurred_face
        return frame

    def analyze_audio(self, audio_data):
        # Placeholder for audio threat detection (screams, gunshots)
        # Using RMS to detect 'loud' events initially
        rms = np.sqrt(np.mean(audio_data**2))
        signals = []
        if rms > 0.05:
            signals.append("loud_event")
        return signals
