import React, { useRef, useEffect, useState } from 'react';

const CameraFeed = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    async function setupStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup Audio Context for Waveform
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    }
    setupStream();
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/inference');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (canvasRef.current) {
        const ctx = document.getElementById('overlay-canvas').getContext('2d');
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        document.getElementById('overlay-canvas').width = width;
        document.getElementById('overlay-canvas').height = height;
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Detections (HUD)
        if (data.detections) {
          data.detections.forEach(det => {
            const [x1, y1, x2, y2] = det.box;
            const rx = (x1 / 640) * width;
            const ry = (y1 / 360) * height;
            const rw = ((x2 - x1) / 640) * width;
            const rh = ((y2 - y1) / 360) * height;

            ctx.strokeStyle = det.className === 'person' ? '#00d2ff' : '#ff4b5c';
            ctx.lineWidth = 2;
            ctx.strokeRect(rx, ry, rw, rh);

            // Label Background
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillRect(rx, ry - 25, ctx.measureText(det.className).width + 20, 25);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Inter';
            ctx.fillText(`${det.className.toUpperCase()} [ID #${det.id}]`, rx + 5, ry - 8);
          });
        }

        // 2. Draw Emotions
        if (data.emotions) {
          data.emotions.forEach(emo => {
            const { x, y, w, h } = emo.region;
            const rx = (x / 640) * width;
            const ry = (y / 360) * height;

            ctx.fillStyle = '#00e676';
            ctx.font = 'bold 16px Inter';
            ctx.fillText(`EMOTION: ${emo.emotion.toUpperCase()}`, rx, ry - 35);
          });
        }
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, 640, 360);

        // Get Audio Data
        const dataArray = new Uint8Array(analyserRef.current ? analyserRef.current.frequencyBinCount : 0);
        if (analyserRef.current) analyserRef.current.getByteTimeDomainData(dataArray);

        const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.4); // Lower quality for speed
        onFrame({ frame: frameBase64, audio: Array.from(dataArray) });
      }
    }, 150); // ~7 FPS for stability with heavy AI
    return () => clearInterval(interval);
  }, [onFrame]);

  return (
    <div className="camera-panel">
      <div className="recording-indicator">
        <span style={{ width: '10px', height: '10px', background: 'red', borderRadius: '50%' }}></span>
        LIVE SECURE FEED
      </div>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} width="640" height="360" style={{ display: 'none' }} />

      {/* Overlay Canvas for Bounding Boxes / Face Blur */}
      <canvas id="overlay-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
    </div>
  );
};

export default CameraFeed;
