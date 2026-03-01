class ThreatFusionEngine:
    def __init__(self, mode="Campus"):
        self.mode = mode # Campus, Bank, City
        # Weights for visual and audio signals based on mode
        self.weights = {
            "Campus": {"weapon": 0.8, "pose": 0.5, "audio": 0.4, "motion": 0.3},
            "Bank": {"weapon": 0.9, "pose": 0.7, "audio": 0.6, "motion": 0.5},
            "City": {"weapon": 0.7, "pose": 0.4, "audio": 0.5, "motion": 0.4}
        }
    
    def calculate_score(self, detections, pose_data, audio_signals):
        score = 0
        reasons = []
        w = self.weights[self.mode]
        
        # 1. Object Signal (e.g., weapons)
        for d in detections:
            if d['className'] in ['knife', 'gun']: # Assuming YOLO names
                score += w['weapon'] * d['confidence']
                reasons.append(f"Weapon-like object detected ({d['confidence']:.2f})")
        
        # 2. Audio Signal
        if "loud_event" in audio_signals:
            score += w['audio']
            reasons.append("Sudden loud impulse sound detected")
        
        # 3. Pose/Behavior (e.g., Aggressive gestures)
        # Simplified: if pose visibility is high but movement is rapid (placeholder)
        if len(pose_data) > 0:
            # Placeholder for actual pose-based threat logic
            pass
            
        final_score = min(score, 1.0)
        return round(final_score, 2), reasons
