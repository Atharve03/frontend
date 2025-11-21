import React from 'react';

const PlayerCard = ({ player, onEdit, onDelete }) => {
  const getRoleBadge = (role) => {
    const roleStyles = {
      batsman: 'badge-batsman',
      bowler: 'badge-bowler',
      all_rounder: 'badge-all-rounder',
      wicket_keeper: 'badge-keeper'
    };
    return roleStyles[role] || 'badge-default';
  };

  const formatRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="player-card">
      <div className="player-card-header">
        <div className="player-avatar">
          <span className="avatar-text">
            {player.name.split(' ').map(n => n).join('').toUpperCase()}
          </span>
        </div>
        <div className="player-info">
          <h3 className="player-name">{player.name}</h3>
          <p className="player-team">{player.team?.name || 'No Team'}</p>
        </div>
        {player.jerseyNumber && (
          <div className="jersey-number">
            #{player.jerseyNumber}
          </div>
        )}
      </div>

      <div className="player-role-badge">
        <span className={`badge ${getRoleBadge(player.role)}`}>
          {formatRole(player.role)}
        </span>
      </div>

      <div className="player-details">
        <div className="detail-row">
          <span className="detail-label">Batting Style:</span>
          <span className="detail-value">
            {player.battingStyle === 'right_hand' ? 'Right Hand' : 'Left Hand'}
          </span>
        </div>
        
        {player.bowlingStyle && (
          <div className="detail-row">
            <span className="detail-label">Bowling Style:</span>
            <span className="detail-value">{player.bowlingStyle}</span>
          </div>
        )}

        {player.dateOfBirth && (
          <div className="detail-row">
            <span className="detail-label">Age:</span>
            <span className="detail-value">{calculateAge(player.dateOfBirth)} years</span>
          </div>
        )}
      </div>

      {player.stats && (
        <div className="player-stats">
          <div className="stat-group">
            <h4>Batting</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Matches</span>
                <span className="stat-value">{player.stats.matchesPlayed || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Runs</span>
                <span className="stat-value">{player.stats.totalRuns || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average</span>
                <span className="stat-value">{player.stats.battingAverage?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Strike Rate</span>
                <span className="stat-value">{player.stats.strikeRate?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {(player.role === 'bowler' || player.role === 'all_rounder') && (
            <div className="stat-group">
              <h4>Bowling</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Wickets</span>
                  <span className="stat-value">{player.stats.totalWickets || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average</span>
                  <span className="stat-value">{player.stats.bowlingAverage?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Economy</span>
                  <span className="stat-value">{player.stats.economyRate?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="player-card-actions">
        <button 
          onClick={() => onEdit(player)} 
          className="btn btn-secondary"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(player._id)} 
          className="btn btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PlayerCard;
