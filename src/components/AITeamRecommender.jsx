import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/AIComponents.css';

const AITeamRecommender = ({ teamId, teamName }) => {
  const [format, setFormat] = useState('T20');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const getRecommendation = async () => {
    if (!teamId) {
      toast.error('Team not found');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/ai/recommend-team-xi', {
        teamId,
        matchFormat: format
      });
      setRecommendation(response.data.recommendation);
      setShowRecommendation(true);
      toast.success('🤖 Team recommended!');
    } catch (error) {
      toast.error('Failed to get recommendation');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="ai-recommender-container">
      <div className="format-selector">
        <label>Select Format:</label>
        <div className="format-buttons">
          {['T20', 'ODI', 'Test'].map(fmt => (
            <button
              key={fmt}
              className={`format-btn ${format === fmt ? 'active' : ''}`}
              onClick={() => setFormat(fmt)}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <button 
        className="ai-btn ai-recommend-btn"
        onClick={getRecommendation}
        disabled={loading}
      >
        {loading ? '🤖 Generating...' : '🤖 Get AI Playing XI'}
      </button>

      {showRecommendation && recommendation && (
        <div className="ai-recommendation-card">
          <div className="ai-card-header">
            <h3>🎯 Recommended Playing XI - {recommendation.format}</h3>
            <button 
              className="ai-close-btn"
              onClick={() => setShowRecommendation(false)}
            >
              ✕
            </button>
          </div>

          <div className="ai-card-content">
            {/* Captain Info */}
            <div className="captain-info">
              <div className="captain-box">
                <span>👑 Captain:</span>
                <span className="captain-name">{recommendation.captainSuggestion}</span>
              </div>
              <div className="captain-box">
                <span>🎖️ Vice-Captain:</span>
                <span className="captain-name">{recommendation.viceCaptainSuggestion}</span>
              </div>
            </div>

            {/* Playing XI List */}
            <div className="playing-xi-list">
              <h4>XI Players ({recommendation.totalPlayers})</h4>
              <div className="xi-grid">
                {recommendation.playingXI.map((player, idx) => (
                  <div key={idx} className={`player-card ${player.position <= 6 ? 'batsman' : 'bowler'}`}>
                    <div className="player-position">{player.position}</div>
                    <div className="player-name">{player.name}</div>
                    <div className="player-role">{player.role}</div>
                    <div className="player-jersey">#{player.jerseyNumber}</div>
                    <div className="player-ai-score">
                      <span className="score-label">AI Score:</span>
                      <span className="score-value">{player.aiScore.toFixed(1)}</span>
                    </div>
                    <div className="player-stats">
                      {player.stats.average && (
                        <>
                          <div className="stat">Avg: {player.stats.average}</div>
                          <div className="stat">SR: {player.stats.strikeRate}</div>
                          <div className="stat">Runs: {player.stats.runs}</div>
                        </>
                      )}
                      {player.stats.wickets !== undefined && (
                        <>
                          <div className="stat">Wkts: {player.stats.wickets}</div>
                          <div className="stat">Eco: {player.stats.economy}</div>
                          <div className="stat">Avg: {player.stats.bowlingAverage}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="ai-insights-box">
              <h4>💡 AI Insights</h4>
              <div className="insight-content">
                <div className="insight-item">
                  <span className="insight-label">Strategy:</span>
                  <span className="insight-value">{recommendation.aiInsights.strategy}</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Strengths:</span>
                  <span className="insight-value">{recommendation.aiInsights.strengths}</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">Considerations:</span>
                  <span className="insight-value">{recommendation.aiInsights.considerations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITeamRecommender;
