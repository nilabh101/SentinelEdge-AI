import React from 'react';

const ThreatPanel = ({ score, reasons, mode, onModeChange }) => {
  const getScoreColor = (s) => {
    if (s < 0.3) return 'var(--accent-green)';
    if (s < 0.7) return 'orange';
    return 'var(--accent-red)';
  };

  return (
    <div className="side-panel">
      <div className="card">
        <h3>Environment Mode</h3>
        <select value={mode} onChange={(e) => onModeChange(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#1c1f26', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
          <option value="Campus">Campus Security</option>
          <option value="Bank">Bank High-Alert</option>
          <option value="City">Smart City Public Safety</option>
        </select>
      </div>

      <div className="card">
        <h3>Threat Score</h3>
        <div className="threat-score-ring">
          {/* Simple circle display for now */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            border: `8px solid ${getScoreColor(score)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${getScoreColor(score)}33`
          }}>
            <span className="score-value">{Math.round(score * 100)}</span>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '10px' }}>
          {score > 0.7 ? "CRITICAL THREAT" : score > 0.3 ? "ELEVATED RISK" : "NORMAL"}
        </p>
      </div>

      <div className="card" style={{ flex: 1 }}>
        <h3>Signal Breakdown</h3>
        <ul className="signal-list">
          {reasons.length > 0 ? reasons.map((r, i) => (
            <li key={i} className="signal-item">
              <span style={{ color: 'var(--accent-blue)' }}>●</span> {r}
            </li>
          )) : (
            <li className="signal-item">Monitoring for anomalies...</li>
          )}
        </ul>
      </div>

      <div className="card">
        <button className="btn-confirm" onClick={() => alert("Threat Confirmed. Notifying internal security...")}>CONFIRM THREAT</button>
        <button className="btn-dismiss" onClick={() => alert("False positive dismissed.")}>DISMISS ALERT</button>
      </div>
    </div >
  );
};

export default ThreatPanel;
