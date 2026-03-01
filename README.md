# SentinelEdge AI 🛡️

SentinelEdge AI is a real-time, edge-first threat detection platform that transforms standard cameras and microphones into an intelligent, privacy-first security system. 

Designed for **Campus, Bank, and City environments**, the system performs real-time deep-learning inference on video and audio to detect people, motion anomalies, weapon-like objects, unattended items, and audio threats—while inherently protecting privacy by automatically blurring faces and using anonymous tracking.

---

## 🚀 What We Have Built

We have successfully engineered a fully functional, real-time AI security suite operating directly on the edge.

### 1. Multimodal AI Engine
- **Visual Intelligence**: Integrated YOLOv8 for sub-second object and person detection, capable of instantly identifying threatening objects (e.g., weapons, blunt objects) and contextual items (e.g., bags).
- **Proximity & Interaction**: Implemented custom logic to detect when a person is actively holding or interacting with a detected object, drastically reducing false positives for unattended items.
- **Biometric Analysis**: Integrated DeepFace for real-time emotional and behavioral analysis of subjects in the frame to detect distress, aggression, or panic.
- **Pose & Kinetic Tracking**: Embedded MediaPipe to detect high-velocity movements, falling, fighting, and aggressive postures.
- **Audio Threat Analysis**: Built a custom Fast Fourier Transform (FFT) audio pipeline to visualize waveforms and detect impulse noises (gunshots, glass breaking, screams).
- **Threat Fusion Scoring**: Developed an intelligent heuristic fusion engine that ingests visual, audio, kinetic, and emotional signals to output a unified **0-100 Threat Score**, rendering decisions highly explainable.

### 2. Privacy-First Architecture
- **Dynamic Face Blurring**: Before any frame is sent to the dashboard, all detected faces are automatically and irreversibly blurred at the edge.
- **Anonymous Tracking**: System uses randomized IDs (`ID #0`, `ID #12`) to track movement without ever recognizing or logging identities.

### 3. Dynamic Interactive Dashboard
- **React/Vite Frontend**: Built a high-performance, dark-mode 'HUD' interface reminiscent of modern security command centers.
- **Live WebSocket Streams**: Utilizes bidirectional WebSockets to stream sub-150ms latency video frames and audio waveforms between the React dashboard and the Python AI engine.
- **Interactive Simulation**: Added a "Simulate Threat" feature to demonstrate the Fusion Engine's capability to instantly spike the threat score to 95 and trigger critical UI alerts on demand for presentations.

---

## 💻 Technology Stack

**Frontend Layer:**
- **React.js (Vite)**: High-speed, modern component-based UI.
- **Vanilla CSS**: Custom styling for responsive layouts, glowing neons, and glassmorphism.
- **WebSockets API**: For real-time, bidirectional telemetry and video streaming.
- **HTML5 Canvas / MediaDevices API**: For capturing raw webcam feeds and painting AI HUD overlays dynamically at 30+ FPS.

**Backend & AI Layer:**
- **Python 3.11**: Core engine runtime.
- **FastAPI / Uvicorn**: Asynchronous, high-performance web server handling WebSocket traffic.
- **Ultralytics YOLOv8**: State-of-the-art model for real-time object detection (`predict` mode for zero-latency frame evaluation).
- **MediaPipe (Google)**: Used for precise skeletal pose estimation and face detection.
- **DeepFace**: Lightweight facial emotion recognition model.
- **TensorFlow (v2.15.0)**: Deep learning backend powering DeepFace and MediaPipe dependencies.
- **NumPy & OpenCV (`cv2`)**: Matrix math, image processing, and frame manipulation.

---

## 🌟 How SentinelEdge AI is Different (Data for PPT)

Standard CCTV systems are reactive—they merely record crimes for later viewing. Traditional AI systems are cloud-dependent, expensive, and massive privacy liabilities. **SentinelEdge AI solves this.**

### 1. **Edge-First & Cloud-Independent**
- **The Problem**: Other systems send raw, unencrypted video feeds to the cloud, introducing latency, high server costs, and severe data breach risks.
- **Our Edge Differeniator**: SentinelEdge AI runs 100% locally. The inference happens on the device. **Zero video leaves the local network.** This means zero latency and zero cloud costs.

### 2. **Privacy By Design**
- **The Problem**: Law enforcement AI often uses facial recognition, leading to bias, false arrests, and massive public backlash.
- **Our Privacy Differentiator**: We physically blur faces *at the source* before the frame even hits the dashboard. We track "Person A" vs "Person B" using anonymous ID tokens. SentinelEdge detects **behaviors and objects**, not identities, making it instantly legally compliant in strict privacy regions (GDPR, CCPA).

### 3. **Multimodal Fusion (Vision + Audio + Kinetics)**
- **The Problem**: Most AI cameras only look for bounding boxes. If someone is holding a phone, it looks similar to holding a weapon in low resolution. 
- **Our Fusion Differentiator**: We don't just look at objects. We fuse **Audio** (is there screaming?), **Motion** (is the person running/falling?), **Emotion** (is there panic?), and **Proximity** (is the object being held?). This multidimensional context drops false-positive alert rates drastically compared to vision-only competitors.

### 4. **Explainable AI (XAI) Scoring**
- **The Problem**: Security guards ignore AI alerts when the AI acts like a "black box" and says "Alert" without a reason.
- **Our XAI Differentiator**: SentinelEdge doesn't just ring an alarm. It outputs a calculated Threat Score (0-100) and an exact, human-readable reason (e.g., `["Aggressive Gestures Detected", "Held Object: Knife"]`), allowing operators to trust and verify the AI's decision.

---

## 🛠️ Setup & Execution

### 1. Start the AI Backend
```bash
cd engine
.\venv\Scripts\activate
python main.py
```

### 2. Start the Frontend Dashboard
```bash
cd dashboard
npm run dev
```

Visit `http://localhost:5173` in your browser. Allow camera and microphone permissions to start the live feed.