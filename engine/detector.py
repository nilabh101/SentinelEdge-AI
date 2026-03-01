from ultralytics import YOLO
import cv2
import numpy as np

class ThreatDetector:
    def __init__(self):
        # Load YOLOv8 model (using 'yolov8n.pt' for real-time speed)
        self.model = YOLO('yolov8n.pt')
        # Target classes: None means detect all 80+ COCO classes
        self.target_classes = None 
        
    def detect(self, frame):
        # Detect all objects
        results = self.model.track(frame, persist=True, verbose=False)
        detections = []
        
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
            ids = results[0].boxes.id.cpu().numpy().astype(int)
            cls = results[0].boxes.cls.cpu().numpy().astype(int)
            conf = results[0].boxes.conf.cpu().numpy()
            
            for box, id, c, cf in zip(boxes, ids, cls, conf):
                detections.append({
                    "id": int(id),
                    "class": int(c),
                    "className": self.model.names[int(c)],
                    "confidence": float(cf),
                    "box": box.tolist()
                })
        
        return detections
