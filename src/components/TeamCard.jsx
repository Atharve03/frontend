import React from 'react';

const TeamCard = ({ team, onEdit, onDelete }) => {
  return (
    <div className="team-card">
      <div className="team-header">
        <h3>{team.name}</h3>
        <span className="team-short">{team.shortName}</span>
      </div>

      <div className="team-details">
        {team.captain && <p><strong>Captain:</strong> {team.captain}</p>}
        {team.coach && <p><strong>Coach:</strong> {team.coach}</p>}
        {team.homeGround && <p><strong>Home:</strong> {team.homeGround}</p>}
        <p><strong>Players:</strong> {team.playerCount || 0}</p>
      </div>

      <div className="team-stats">
        <div className="stat">
          <span className="label">Played</span>
          <span className="value">{team.stats?.matchesPlayed || 0}</span>
        </div>
        <div className="stat">
          <span className="label">Won</span>
          <span className="value">{team.stats?.matchesWon || 0}</span>
        </div>
        <div className="stat">
          <span className="label">Lost</span>
          <span className="value">{team.stats?.matchesLost || 0}</span>
        </div>
      </div>

      <div className="team-actions">
        <button onClick={() => onEdit(team)} className="btn btn-secondary">
          Edit
        </button>
        <button onClick={() => onDelete(team._id)} className="btn btn-danger">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TeamCard;
