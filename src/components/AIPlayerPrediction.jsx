import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/AIComponents.css';

const AIPlayerPrediction = ({ playerId, playerName }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  const getPrediction = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/ai/predict-player/${playerId}`);
      setPrediction(response.data.prediction);
      setShowPrediction(true);
      toast.success('🤖 Prediction generated!');
    } catch (error) {
      toast.error('Failed to generate prediction');
      console.error(error);
    }
    setLoading(false);
  };

  // Get form color based on confidence
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981'; // Green
    if (confidence >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  // Get form status emoji
  const getFormEmoji = (status) => {
    if (status.includes('Excellent')) return '🔥';
    if (status.includes('Good')) return '✨';
    if (status.includes('Average')) return '📊';
    return '⚠️';
  };

  return (
    <div className="ai-prediction-container">
      <button 
        className="ai-btn ai-predict-btn"
        onClick={getPrediction}
        disabled={loading}
      >
        {loading ? '🤖 Analyzing...' : '🤖 Predict Performance'}
      </button>

      {showPrediction && prediction && (
        <div className="ai-prediction-card">
          <div className="ai-card-header">
            <h3>🎯 Performance Prediction</h3>
            <button 
              className="ai-close-btn"
              onClick={() => setShowPrediction(false)}
            >
              ✕
            </button>
          </div>

          <div className="ai-card-content">
            {/* Player Info */}
            <div className="ai-player-info">
              <div className="info-row">
                <span className="label">Player:</span>
                <span className="value">{prediction.playerName}</span>
              </div>
              <div className="info-row">
                <span className="label">Role:</span>
                <span className="value badge">{prediction.role}</span>
              </div>
              <div className="info-row">
                <span className="label">Team:</span>
                <span className="value">{prediction.team}</span>
              </div>
            </div>

            {/* Main Predictions */}
            <div className="ai-predictions-grid">
              <div className="prediction-box">
                <div className="prediction-label">Expected Score</div>
                <div className="prediction-value">{prediction.expectedScore} Runs</div>
              </div>

              <div className="prediction-box">
                <div className="prediction-label">Performance Rating</div>
                <div className="prediction-value">{prediction.performanceRating}/100</div>
              </div>

              <div className="prediction-box">
                <div className="prediction-label">Confidence</div>
                <div className="prediction-value" style={{color: getConfidenceColor(prediction.confidence)}}>
                  {prediction.confidence}%
                </div>
              </div>

              <div className="prediction-box">
                <div className="prediction-label">Form Status</div>
                <div className="prediction-value">
                  {getFormEmoji(prediction.formStatus)} {prediction.formStatus}
                </div>
              </div>
            </div>

            {/* Form Trend */}
            <div className="ai-form-trend">
              <span className="trend-label">Current Trend:</span>
              <span className="trend-value">{prediction.formTrend}</span>
            </div>

            {/* Stats Breakdown */}
            <div className="ai-stats-breakdown">
              <h4>📊 Stats Breakdown</h4>
              <div className="stats-table">
                <div className="stat-row">
                  <span className="stat-name">Matches Played:</span>
                  <span className="stat-value">{prediction.statsBreakdown.matchesPlayed}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Total Runs:</span>
                  <span className="stat-value">{prediction.statsBreakdown.totalRuns}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Batting Average:</span>
                  <span className="stat-value">{prediction.statsBreakdown.battingAverage}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Strike Rate:</span>
                  <span className="stat-value">{prediction.statsBreakdown.strikeRate}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Fours:</span>
                  <span className="stat-value">{prediction.statsBreakdown.fours}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Sixes:</span>
                  <span className="stat-value">{prediction.statsBreakdown.sixes}</span>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="ai-recommendation">
              <h4>💡 Recommendation</h4>
              <p className="recommendation-text">{prediction.recommendation}</p>
            </div>

            {/* Reasoning */}
            <div className="ai-reasoning">
              <p className="reasoning-text">📌 {prediction.reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlayerPrediction;
