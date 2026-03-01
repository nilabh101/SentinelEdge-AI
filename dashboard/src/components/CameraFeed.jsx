import React, { useRef, useEffect } from 'react';

const CameraFeed = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    setupCamera();
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/inference');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const canvas = document.getElementById('overlay-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas.parentElement.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Detections (HUD)
        if (data.detections) {
          data.detections.forEach(det => {
            const [x1, y1, x2, y2] = det.box;
            const rx = (x1 / 640) * width;
            const ry = (y1 / 360) * height;
            const rw = ((x2 - x1) / 640) * width;
            const rh = ((y2 - y1) / 360) * height;

            let color = det.className === 'person' ? '#00d2ff' : '#ff4b5c';
            if (det.isHeld) color = '#ffeb3b';

            ctx.strokeStyle = color;
            ctx.lineWidth = det.isHeld ? 3 : 2;
            ctx.strokeRect(rx, ry, rw, rh);

            ctx.fillStyle = color;
            const label = det.isHeld ? `HELD: ${det.className.toUpperCase()}` : det.className.toUpperCase();
            ctx.fillRect(rx, ry - 25, ctx.measureText(label).width + 20, 25);
            ctx.fillStyle = 'black';
            ctx.font = 'bold 14px Inter';
            ctx.fillText(`${label} [ID #${det.id}]`, rx + 5, ry - 8);
          });
        }

        // 2. Draw Emotions
        if (data.emotions) {
          data.emotions.forEach(emo => {
            const { x, y } = emo.region;
            const rx = (x / 640) * width;
            const ry = (y / 360) * height;
            ctx.fillStyle = '#00e676';
            ctx.font = 'bold 16px Inter';
            ctx.fillText(`EMOTION: ${emo.emotion.toUpperCase()}`, rx, ry - 35);
          });
        }

        // 3. Draw Auto Alert Overlay
        if (data.auto_alert) {
          ctx.fillStyle = 'rgba(255, 75, 92, 0.2)';
          ctx.fillRect(0, 0, width, height);
          ctx.strokeStyle = '#ff4b5c';
          ctx.lineWidth = 10;
          ctx.strokeRect(0, 0, width, height);

          ctx.fillStyle = '#ff4b5c';
          ctx.font = 'bold 32px Inter';
          ctx.textAlign = 'center';
          ctx.fillText("CRITICAL ALERT: CALLING FOR HELP", width / 2, 80);
          ctx.textAlign = 'left';
        }
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    // 150ms interval for AI processing frame rate
    const interval = setInterval(() => {
      // 1. Draw video to the hidden canvas for processing
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const vw = videoRef.current.videoWidth || 640;
        const vh = videoRef.current.videoHeight || 360;

        // Ensure hidden canvas matches video dimensions
        if (canvasRef.current.width !== vw) canvasRef.current.width = vw;
        if (canvasRef.current.height !== vh) canvasRef.current.height = vh;

        ctx.drawImage(videoRef.current, 0, 0, vw, vh);

        // 2. Process Audio
        const dataArray = new Uint8Array(analyserRef.current ? analyserRef.current.frequencyBinCount : 0);
        if (analyserRef.current) analyserRef.current.getByteTimeDomainData(dataArray);

        // Draw Audio Waveform
        const waveCanvas = document.getElementById('audio-waveform');
        if (waveCanvas) {
          const wctx = waveCanvas.getContext('2d');
          const ww = waveCanvas.width;
          const wh = waveCanvas.height;
          wctx.clearRect(0, 0, ww, wh);
          wctx.strokeStyle = '#00e676';
          wctx.lineWidth = 2;
          wctx.beginPath();
          const sliceWidth = ww * 1.0 / dataArray.length;
          let x = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * wh / 2;
            if (i === 0) wctx.moveTo(x, y);
            else wctx.lineTo(x, y);
            x += sliceWidth;
          }
          wctx.stroke();
        }

        // 3. Send Frame to Backend
        const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.4);
        onFrame({ frame: frameBase64, audio: Array.from(dataArray) });
      }

      // 4. Force video stream to be visible in the UI container
      // (The user couldn't see the feed because the video element was display:none,
      // and the visible canvas wasn't drawing the video, only the overlay)
    }, 150);
    return () => clearInterval(interval);
  }, [onFrame]);

  return (
    <div className="camera-panel" style={{ maxHeight: 'calc(100vh - 350px)', position: 'relative' }}>
      <div className="recording-indicator" style={{ zIndex: 10, position: 'absolute', top: 20, left: 20 }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-red)' }}></div>
        LIVE SECURE FEED
      </div>

      {/* Hidden canvas for extracting frames to send to AI */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Visible Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
          />

          {/* AI HUD Overlay positioned exactly over the video container */}
          <canvas
            id="overlay-canvas"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CameraFeed;
