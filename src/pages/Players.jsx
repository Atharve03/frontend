import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PlayerCard from '../components/PlayerCard';
import Modal from '../components/Modal';
import AIPlayerPrediction from '../components/AIPlayerPrediction'; // ✅ ADD THIS

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedPlayerForAI, setSelectedPlayerForAI] = useState(null); // ✅ ADD THIS
  
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    jerseyNumber: '',
    role: 'batsman',
    battingStyle: 'right_hand',
    bowlingStyle: '',
    dateOfBirth: ''
  });

  // ✅ FETCH PLAYERS WITH AUTO-REFRESH
  useEffect(() => {
    fetchPlayers();
    fetchTeams();

    // ✅ AUTO-REFRESH EVERY 3 SECONDS TO SHOW UPDATED STATS
    const refreshInterval = setInterval(() => {
      fetchPlayers();
    }, 3000);

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/players');
      setPlayers(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to fetch players');
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch teams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.team) {
      toast.error('Please select a team');
      return;
    }

    try {
      if (editingPlayer) {
        await api.put(`/players/${editingPlayer._id}`, formData);
        toast.success('Player updated successfully');
      } else {
        await api.post('/players', formData);
        toast.success('Player created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchPlayers(); // ✅ Refresh after update
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      team: player.team?._id || '',
      jerseyNumber: player.jerseyNumber || '',
      role: player.role,
      battingStyle: player.battingStyle || 'right_hand',
      bowlingStyle: player.bowlingStyle || '',
      dateOfBirth: player.dateOfBirth 
        ? player.dateOfBirth.split('T')[0]
        : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;

    try {
      await api.delete(`/players/${playerId}`);
      toast.success('Player deleted successfully');
      fetchPlayers(); // ✅ Refresh after delete
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      team: '',
      jerseyNumber: '',
      role: 'batsman',
      battingStyle: 'right_hand',
      bowlingStyle: '',
      dateOfBirth: ''
    });
    setEditingPlayer(null);
  };

  const filteredPlayers = players.filter(player => {
    const teamMatch = filterTeam === 'all' || player.team?._id === filterTeam;
    const roleMatch = filterRole === 'all' || player.role === filterRole;
    return teamMatch && roleMatch;
  });

  if (loading) {
    return <div className="loading">Loading players...</div>;
  }

  return (
    <div className="players-page">
      <div className="page-header">
        <h1>🏏 Players Management</h1>
        <div className="header-actions">
          <span className="player-count">Total: {players.length}</span>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Add New Player
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Team:</label>
          <select 
            value={filterTeam} 
            onChange={(e) => setFilterTeam(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Teams ({teams.length})</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Role:</label>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="batsman">Batsman</option>
            <option value="bowler">Bowler</option>
            <option value="all_rounder">All Rounder</option>
            <option value="wicket_keeper">Wicket Keeper</option>
          </select>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={fetchPlayers}
          title="Refresh players list"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ✅ AI SECTION - SHOW PREDICTION FOR SELECTED PLAYER */}
      {selectedPlayerForAI && (
        <div className="ai-section">
          <div className="ai-section-header">
            <h2>🤖 AI Performance Analysis</h2>
            <button 
              className="close-ai"
              onClick={() => setSelectedPlayerForAI(null)}
            >
              ✕
            </button>
          </div>
          <AIPlayerPrediction 
            playerId={selectedPlayerForAI._id} 
            playerName={selectedPlayerForAI.name} 
          />
        </div>
      )}

      {filteredPlayers.length === 0 ? (
        <div className="empty-state">
          <p>❌ No players found.</p>
          <p>Create your first player!</p>
        </div>
      ) : (
        <div className="players-grid">
          {filteredPlayers.map(player => (
            <div key={player._id} className="player-card-wrapper">
              <PlayerCard
                player={player}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              {/* ✅ ADD AI BUTTON ON EACH PLAYER CARD */}
              <button 
                className="ai-predict-btn"
                onClick={() => setSelectedPlayerForAI(player)}
                title="Get AI prediction for this player"
              >
                🤖 Predict
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingPlayer ? 'Edit Player' : 'Add New Player'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Player Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter player name"
              required
            />
          </div>

          <div className="form-group">
            <label>Team *</label>
            <select
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              required
            >
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Jersey Number</label>
              <input
                type="number"
                value={formData.jerseyNumber}
                onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                placeholder="e.g., 18"
                min="1"
                max="999"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="all_rounder">All Rounder</option>
              <option value="wicket_keeper">Wicket Keeper</option>
            </select>
          </div>

          <div className="form-group">
            <label>Batting Style *</label>
            <select
              value={formData.battingStyle}
              onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
              required
            >
              <option value="right_hand">Right Hand</option>
              <option value="left_hand">Left Hand</option>
            </select>
          </div>

          {(formData.role === 'bowler' || formData.role === 'all_rounder') && (
            <div className="form-group">
              <label>Bowling Style</label>
              <input
                type="text"
                value={formData.bowlingStyle}
                onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                placeholder="e.g., Right-arm fast, Left-arm spin"
              />
            </div>
          )}

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
              {editingPlayer ? 'Update Player' : 'Create Player'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


export default Players ;