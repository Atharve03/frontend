import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import TeamCard from '../components/TeamCard';
import Modal from '../components/Modal';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    captain: '',
    coach: '',
    homeGround: ''
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, formData);
        toast.success('Team updated successfully');
      } else {
        await api.post('/teams', formData);
        toast.success('Team created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      shortName: team.shortName,
      captain: team.captain || '',
      coach: team.coach || '',
      homeGround: team.homeGround || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      captain: '',
      coach: '',
      homeGround: ''
    });
    setEditingTeam(null);
  };

  if (loading) {
    return <div className="loading">Loading teams...</div>;
  }

  return (
    <div className="teams-page">
      <div className="page-header">
        <h1>Teams Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add New Team
        </button>
      </div>

      <div className="teams-grid">
        {teams.map(team => (
          <TeamCard
            key={team._id}
            team={team}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {teams.length === 0 && (
        <div className="empty-state">
          <p>No teams found. Create your first team!</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingTeam ? 'Edit Team' : 'Add New Team'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label >Short Name (Max 10 chars) *</label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({...formData, shortName: e.target.value})}
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label>Captain</label>
            <input
              type="text"
              value={formData.captain}
              onChange={(e) => setFormData({...formData, captain: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Coach</label>
            <input
              type="text"
              value={formData.coach}
              onChange={(e) => setFormData({...formData, coach: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Home Ground</label>
            <input
              type="text"
              value={formData.homeGround}
              onChange={(e) => setFormData({...formData, homeGround: e.target.value})}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => {
              setShowModal(false);
              resetForm();
            }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTeam ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
