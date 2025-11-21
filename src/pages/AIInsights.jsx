import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await api.get('/ai/insights');
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading AI Insights...</div>;

  return (
    <div className="ai-insights-page">
      <div className="page-header">
        <h1>🤖 AI Insights Dashboard</h1>
        <button className="btn btn-primary" onClick={fetchInsights}>
          🔄 Refresh
        </button>
      </div>
      {insights && (
        <div className="ai-grid">
          <div className="ai-card"><div className="ai-card-title">📊 Total Players</div><div className="ai-card-value">{insights.totalPlayers}</div></div>
          <div className="ai-card"><div className="ai-card-title">🏆 Total Teams</div><div className="ai-card-value">{insights.totalTeams}</div></div>
          <div className="ai-card"><div className="ai-card-title">🎯 Total Matches</div><div className="ai-card-value">{insights.totalMatches}</div></div>
          <div className="ai-card full-width">
            <div className="ai-card-title">⭐ Top Performers</div>
            <div className="performers-list">
              {insights.topPerformers && insights.topPerformers.map((player, idx) => (
                <div key={idx} className="performer-item">
                  <span className="rank">{idx + 1}</span>
                  <span className="name">{player.name}</span>
                  <span className="role">{player.role}</span>
                  <span className="runs">{player.runs} runs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIInsights;
