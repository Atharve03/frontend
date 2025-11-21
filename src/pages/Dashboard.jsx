import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    liveMatches: 0
  });
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [teamsRes, playersRes, matchesRes] = await Promise.all([
        api.get('/teams'),
        api.get('/players'),
        api.get('/matches')
      ]);

      const matches = matchesRes.data.data;
      const live = matches.filter(m => m.status === 'live');

      setStats({
        totalTeams: teamsRes.data.count,
        totalPlayers: playersRes.data.count,
        totalMatches: matches.length,
        liveMatches: live.length
      });

      setLiveMatches(live);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.fullName || user?.username}!</h1>
        <p>Cricket Scoreboard Dashboard</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Teams</h3>
          <p className="stat-number">{stats.totalTeams}</p>
          <Link to="/teams" className="stat-link">View All Teams →</Link>
        </div>

        <div className="stat-card">
          <h3>Players</h3>
          <p className="stat-number">{stats.totalPlayers}</p>
          <Link to="/players" className="stat-link">View All Players →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Matches</h3>
          <p className="stat-number">{stats.totalMatches}</p>
          <Link to="/matches" className="stat-link">View Matches →</Link>
        </div>

        <div className="stat-card live">
          <h3>Live Matches</h3>
          <p className="stat-number">{stats.liveMatches}</p>
          <span className="live-indicator">● LIVE</span>
        </div>
      </div>

      {liveMatches.length > 0 && (
        <div className="live-matches-section">
          <h2>Live Matches</h2>
          <div className="matches-list">
            {liveMatches.map(match => (
              <div key={match._id} className="match-card live">
                <div className="match-header">
                  <span className="live-badge">● LIVE</span>
                  <span className="match-type">{match.matchType}</span>
                </div>
                <div className="match-teams">
                  <div className="team">
                    <h3>{match.team1.shortName}</h3>
                  </div>
                  <span className="vs">VS</span>
                  <div className="team">
                    <h3>{match.team2.shortName}</h3>
                  </div>
                </div>
                <div className="match-venue">{match.venue}</div>
                <Link to={`/match/${match._id}/live`} className="btn btn-primary">
                  View Live Score
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
