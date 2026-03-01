import cv2
import base64
import numpy as np
from fastapi import FastAPI, WebSocket
from detector import ThreatDetector
from pose_audio import PoseAudioAnalyzer
from scoring import ThreatFusionEngine
from emotion import EmotionAnalyzer

app = FastAPI()
detector = ThreatDetector()
analyzer = PoseAudioAnalyzer()
fusion = ThreatFusionEngine()
emotions_engine = EmotionAnalyzer()

@app.websocket("/ws/inference")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 1. Receive data
            data = await websocket.receive_json()
            frame_data = data.get('frame')
            audio_data = data.get('audio', [])
            
            if frame_data:
                # Decode image
                header, encoded = frame_data.split(",", 1)
                img_bytes = base64.b64decode(encoded)
                nparr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    # 2. Anonymize/Blur
                    frame = analyzer.blur_faces(frame)
                    
                    # 3. Detect
                    detections = detector.detect(frame)
                    
                    # 4. Analyze Pose
                    pose = analyzer.analyze_pose(frame)
                    
                    # 5. Analyze Audio
                    audio_signals = analyzer.analyze_audio(np.array(audio_data))
                    
                    # 6. Analyze Emotion (Optional: only if face is visible and not too blurred yet)
                    emotions = emotions_engine.analyze(frame)
                    
                    # 7. Fusion & Scoring
                    score, reasons, auto_alert = fusion.calculate_score(detections, pose, audio_signals)
                    
                    # 8. Send processed data back
                    await websocket.send_json({
                        "score": score,
                        "reasons": reasons if reasons else ["Normal Activity"],
                        "detections": detections,
                        "pose": pose,
                        "emotions": emotions,
                        "auto_alert": auto_alert
                    })
            
    except Exception as e:
        print(f"WS error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
