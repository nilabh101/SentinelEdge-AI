import cv2
from deepface import DeepFace
import numpy as np

class EmotionAnalyzer:
    def __init__(self):
        # We'll use the 'opencv' backend for fast face detection
        self.backend = 'opencv'
        
    def analyze(self, frame):
        try:
            # DeepFace.analyze returns a list of dictionaries (one for each face)
            # We enforce_detection=False to avoid crashing if no face is found
            results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False, detector_backend=self.backend)
            emotions = []
            for res in results:
                # Get the strongest emotion
                emotions.append({
                    "emotion": res['dominant_emotion'],
                    "confidence": res['emotion'][res['dominant_emotion']],
                    "region": res['region'] # [x, y, w, h]
                })
            return emotions
        except Exception as e:
            # print(f"Emotion analysis error: {e}")
            return []
