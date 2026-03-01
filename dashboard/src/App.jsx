import React, { useState, useCallback, useEffect } from 'react';
import CameraFeed from './components/CameraFeed';
import ThreatPanel from './components/ThreatPanel';

function App() {
  const [threatData, setThreatData] = useState({ score: 0.12, reasons: [] });
  const [mode, setMode] = useState('Campus');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Backend WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/inference');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setThreatData(data);
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleFrame = useCallback((payload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // socket.send(JSON.stringify({ ...payload, mode }));
    }
  }, [socket, mode]);

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo">SENTINEL•EDGE AI</div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span className="badge badge-privacy">NO FACE RECOGNITION</span>
          <span className="badge badge-privacy">ON-DEVICE PROCESSING</span>
          <span className="badge badge-privacy" style={{ background: 'rgba(0, 230, 118, 0.2)', color: 'var(--accent-green)' }}>ENCRYPTED</span>
        </div>
      </header>

      <main className="main-view">
        <CameraFeed onFrame={handleFrame} />
        <div className="card" style={{ height: '120px' }}>
          <h3>Audio Activity (Waveform)</h3>
          <canvas id="audio-waveform" style={{ width: '100%', height: '60px', marginTop: '10px' }}></canvas>
        </div>
      </main>

      <aside>
        <ThreatPanel
          score={threatData.score}
          reasons={threatData.reasons}
          mode={mode}
          onModeChange={setMode}
        />
      </aside>

      <footer style={{ gridColumn: '1/3', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        SentinelEdge v1.0 • Privacy Secured • Manual Threat Confirmation Required
      </footer>
    </div>
  );
}

export default App;
