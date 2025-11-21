import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/AIComponents.css';

const AIAnomalyDetector = ({ matchId, inningsId }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [inningsSnapshot, setInningsSnapshot] = useState(null);

  // Fetch anomalies
  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/ai/detect-anomalies/${matchId}/${inningsId}`);
      setAnomalies(response.data.anomalyReport.anomalies);
      setInningsSnapshot(response.data.anomalyReport.inningsSnapshot);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    }
    setLoading(false);
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    fetchAnomalies(); // Initial fetch
    const interval = setInterval(fetchAnomalies, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [matchId, inningsId, autoRefresh]);

  // Get severity color and icon
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'HIGH':
        return { color: '#ef4444', icon: '🚨', bg: '#fee2e2' };
      case 'WARNING':
        return { color: '#f59e0b', icon: '⚠️', bg: '#fef3c7' };
      case 'INFO':
        return { color: '#3b82f6', icon: 'ℹ️', bg: '#dbeafe' };
      default:
        return { color: '#6b7280', icon: '📌', bg: '#f3f4f6' };
    }
  };

  return (
    <div className="ai-anomaly-detector-container">
      <div className="detector-header">
        <h3>🤖 Live Match Anomaly Detector</h3>
        <div className="detector-controls">
          <button 
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchAnomalies}
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Innings Snapshot */}
      {inningsSnapshot && (
        <div className="innings-snapshot">
          <div className="snapshot-stat">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{inningsSnapshot.runs}/{inningsSnapshot.wickets}</span>
          </div>
          <div className="snapshot-stat">
            <span className="stat-label">Overs:</span>
            <span className="stat-value">{inningsSnapshot.overs}</span>
          </div>
          <div className="snapshot-stat">
            <span className="stat-label">Run Rate:</span>
            <span className="stat-value">{inningsSnapshot.runRate}</span>
          </div>
          <div className="snapshot-stat">
            <span className="stat-label">Batting Team:</span>
            <span className="stat-value">{inningsSnapshot.battingTeam}</span>
          </div>
        </div>
      )}

      {/* Anomalies List */}
      <div className="anomalies-list">
        {anomalies.length === 0 ? (
          <div className="no-anomalies">
            <p>✨ No anomalies detected - Match proceeding normally</p>
          </div>
        ) : (
          anomalies.map((anomaly, idx) => {
            const { color, icon, bg } = getSeverityStyle(anomaly.severity);
            return (
              <div 
                key={idx} 
                className="anomaly-item"
                style={{ borderLeft: `4px solid ${color}`, backgroundColor: bg }}
              >
                <div className="anomaly-header">
                  <span className="anomaly-icon">{icon}</span>
                  <span className="anomaly-type">{anomaly.type}</span>
                  <span 
                    className="anomaly-severity"
                    style={{ color, backgroundColor: 'white', border: `1px solid ${color}` }}
                  >
                    {anomaly.severity}
                  </span>
                </div>

                <div className="anomaly-message">
                  <p><strong>{anomaly.message}</strong></p>
                </div>

                <div className="anomaly-details">
                  <p><strong>💡 Suggestion:</strong> {anomaly.suggestion}</p>
                </div>

                <div className="anomaly-confidence">
                  <span>🎯 Confidence: {anomaly.confidence}%</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{
                        width: `${anomaly.confidence}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                </div>

                <div className="anomaly-timestamp">
                  <small>🕐 {new Date(anomaly.timestamp).toLocaleTimeString()}</small>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AIAnomalyDetector;
