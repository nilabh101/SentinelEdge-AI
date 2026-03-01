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
        # Use predict instead of track for instant identification
        results = self.model.predict(frame, verbose=False)
        detections = []
        
        boxes = results[0].boxes
        if len(boxes) > 0:
            xyxys = boxes.xyxy.cpu().numpy().astype(int)
            cls = boxes.cls.cpu().numpy().astype(int)
            conf = boxes.conf.cpu().numpy()
            ids = [0] * len(boxes) # Predict doesn't track IDs, fallback to 0
            
            people = []
            objects = []
            
            for box, obj_id, c, cf in zip(xyxys, ids, cls, conf):
                det = {
                    "id": int(obj_id),
                    "class": int(c),
                    "className": self.model.names[int(c)],
                    "confidence": float(cf),
                    "box": box.tolist(),
                    "isHeld": False
                }
                if det['className'] == 'person':
                    people.append(det)
                else:
                    objects.append(det)
            
            # Simple proximity check: Is object box inside or very close to person box?
            for obj in objects:
                ox1, oy1, ox2, oy2 = obj['box']
                for p in people:
                    px1, py1, px2, py2 = p['box']
                    # Check for intersection or containment
                    if not (ox2 < px1 or ox1 > px2 or oy2 < py1 or oy1 > py2):
                        obj['isHeld'] = True
                        break
            
            return people + objects
        
        return detections
