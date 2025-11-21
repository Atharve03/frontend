import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import MatchCard from '../components/MatchCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTossModal, setShowTossModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    venue: '',
    matchDate: '',
    matchType: 'T20',
    oversPerInnings: 20
  });

  const [tossData, setTossData] = useState({
    tossWinner: '',
    tossDecision: 'bat'
  });

  const canManageMatches = user?.role === 'admin' || user?.role === 'scorer';

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches');
      setMatches(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data);
    } catch (error) {
      console.error('Failed to fetch teams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.team1 === formData.team2) {
      toast.error('Please select different teams');
      return;
    }

    try {
      await api.post('/matches', formData);
      toast.success('Match created successfully');
      setShowModal(false);
      resetForm();
      fetchMatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create match');
    }
  };

  const handleStartMatch = (match) => {
    setSelectedMatch(match);
    setTossData({
      tossWinner: match.team1._id,
      tossDecision: 'bat'
    });
    setShowTossModal(true);
  };

  const handleTossSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/matches/${selectedMatch._id}/start`, tossData);
      toast.success('Match started successfully');
      setShowTossModal(false);
      fetchMatches();
      navigate(`/match/${selectedMatch._id}/live`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start match');
    }
  };

  const handleDelete = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;

    try {
      await api.delete(`/matches/${matchId}`);
      toast.success('Match deleted successfully');
      fetchMatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      team1: '',
      team2: '',
      venue: '',
      matchDate: '',
      matchType: 'T20',
      oversPerInnings: 20
    });
  };

  const handleMatchTypeChange = (type) => {
    const oversMap = {
      'T20': 20,
      'ODI': 50,
      'Test': 90
    };
    setFormData({
      ...formData,
      matchType: type,
      oversPerInnings: oversMap[type]
    });
  };

  const filteredMatches = matches.filter(match => {
    if (filterStatus === 'all') return true;
    return match.status === filterStatus;
  });

  const groupedMatches = {
    live: filteredMatches.filter(m => m.status === 'live'),
    upcoming: filteredMatches.filter(m => m.status === 'upcoming'),
    completed: filteredMatches.filter(m => m.status === 'completed')
  };

  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  return (
    <div className="matches-page">
      <div className="page-header">
        <h1>Matches</h1>
        {canManageMatches && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Create New Match
          </button>
        )}
      </div>

      <div className="filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({matches.length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'live' ? 'active' : ''}`}
            onClick={() => setFilterStatus('live')}
          >
            Live ({groupedMatches.live.length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilterStatus('upcoming')}
          >
            Upcoming ({groupedMatches.upcoming.length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({groupedMatches.completed.length})
          </button>
        </div>
      </div>

      {filterStatus === 'all' && (
        <>
          {groupedMatches.live.length > 0 && (
            <div className="matches-section">
              <h2 className="section-title">Live Matches</h2>
              <div className="matches-grid">
                {groupedMatches.live.map(match => (
                  <MatchCard
                    key={match._id}
                    match={match}
                    onDelete={canManageMatches ? handleDelete : null}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedMatches.upcoming.length > 0 && (
            <div className="matches-section">
              <h2 className="section-title">Upcoming Matches</h2>
              <div className="matches-grid">
                {groupedMatches.upcoming.map(match => (
                  <MatchCard
                    key={match._id}
                    match={match}
                    onStart={canManageMatches ? handleStartMatch : null}
                    onDelete={canManageMatches ? handleDelete : null}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedMatches.completed.length > 0 && (
            <div className="matches-section">
              <h2 className="section-title">Completed Matches</h2>
              <div className="matches-grid">
                {groupedMatches.completed.map(match => (
                  <MatchCard
                    key={match._id}
                    match={match}
                    onDelete={canManageMatches ? handleDelete : null}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {filterStatus !== 'all' && (
        <div className="matches-grid">
          {filteredMatches.map(match => (
            <MatchCard
              key={match._id}
              match={match}
              onStart={canManageMatches && match.status === 'upcoming' ? handleStartMatch : null}
              onDelete={canManageMatches ? handleDelete : null}
            />
          ))}
        </div>
      )}

      {filteredMatches.length === 0 && (
        <div className="empty-state">
          <p>No matches found.</p>
        </div>
      )}

      {/* Create Match Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Create New Match"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team 1 *</label>
            <select
              value={formData.team1}
              onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
              required
            >
              <option value="">Select Team 1</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Team 2 *</label>
            <select
              value={formData.team2}
              onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
              required
            >
              <option value="">Select Team 2</option>
              {teams.filter(t => t._id !== formData.team1).map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Venue *</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Enter venue name"
              required
            />
          </div>

          <div className="form-group">
            <label>Match Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.matchDate}
              onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Match Type *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="matchType"
                  value="T20"
                  checked={formData.matchType === 'T20'}
                  onChange={(e) => handleMatchTypeChange(e.target.value)}
                />
                T20 (20 Overs)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="matchType"
                  value="ODI"
                  checked={formData.matchType === 'ODI'}
                  onChange={(e) => handleMatchTypeChange(e.target.value)}
                />
                ODI (50 Overs)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="matchType"
                  value="Test"
                  checked={formData.matchType === 'Test'}
                  onChange={(e) => handleMatchTypeChange(e.target.value)}
                />
                Test (90 Overs)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Overs Per Innings *</label>
            <input
              type="number"
              value={formData.oversPerInnings}
              onChange={(e) => setFormData({ ...formData, oversPerInnings: e.target.value })}
              min="1"
              max="90"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Match
            </button>
          </div>
        </form>
      </Modal>

      {/* Toss Modal */}
      <Modal
        isOpen={showTossModal}
        onClose={() => setShowTossModal(false)}
        title="Start Match - Toss"
      >
        <form onSubmit={handleTossSubmit}>
          <div className="toss-info">
            <h3>
              {selectedMatch?.team1?.name} vs {selectedMatch?.team2?.name}
            </h3>
            <p className="venue-info">{selectedMatch?.venue}</p>
          </div>

          <div className="form-group">
            <label>Toss Winner *</label>
            <select
              value={tossData.tossWinner}
              onChange={(e) => setTossData({ ...tossData, tossWinner: e.target.value })}
              required
            >
              <option value={selectedMatch?.team1?._id}>
                {selectedMatch?.team1?.name}
              </option>
              <option value={selectedMatch?.team2?._id}>
                {selectedMatch?.team2?.name}
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Toss Decision *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="tossDecision"
                  value="bat"
                  checked={tossData.tossDecision === 'bat'}
                  onChange={(e) => setTossData({ ...tossData, tossDecision: e.target.value })}
                />
                Bat First
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="tossDecision"
                  value="bowl"
                  checked={tossData.tossDecision === 'bowl'}
                  onChange={(e) => setTossData({ ...tossData, tossDecision: e.target.value })}
                />
                Bowl First
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowTossModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Start Match
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Matches;
