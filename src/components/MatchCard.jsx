import React from 'react';
import { Link } from 'react-router-dom';

const MatchCard = ({ match, onEdit, onDelete, onStart }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'live':
        return 'status-live';
      case 'completed':
        return 'status-completed';
      case 'upcoming':
        return 'status-upcoming';
      case 'abandoned':
        return 'status-abandoned';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live':
        return '● LIVE';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      case 'abandoned':
        return 'Abandoned';
      default:
        return status;
    }
  };

  return (
    <div className={`match-card ${getStatusClass(match.status)}`}>
      <div className="match-card-header">
        <span className={`match-status ${getStatusClass(match.status)}`}>
          {getStatusText(match.status)}
        </span>
        <span className="match-type">{match.matchType}</span>
      </div>

      <div className="match-teams">
        <div className="team">
          <h3 className="team-name">
            {match.team1?.name || 'Team 1'}
          </h3>
          <span className="team-short">{match.team1?.shortName || 'T1'}</span>
        </div>

        <div className="vs-divider">
          <span>VS</span>
        </div>

        <div className="team">
          <h3 className="team-name">
            {match.team2?.name || 'Team 2'}
          </h3>
          <span className="team-short">{match.team2?.shortName || 'T2'}</span>
        </div>
      </div>

      <div className="match-details">
        <div className="detail-item">
          <i className="icon-location">📍</i>
          <span>{match.venue}</span>
        </div>
        <div className="detail-item">
          <i className="icon-calendar">📅</i>
          <span>{formatDate(match.matchDate)}</span>
        </div>
        <div className="detail-item">
          <i className="icon-clock">🕐</i>
          <span>{formatTime(match.matchDate)}</span>
        </div>
        <div className="detail-item">
          <i className="icon-overs">🏏</i>
          <span>{match.oversPerInnings} Overs</span>
        </div>
      </div>

      {match.winner && match.status === 'completed' && (
        <div className="match-result">
          <strong>Winner: </strong>
          {match.winner.name}
          {match.resultType && match.resultMargin && (
            <span> by {match.resultMargin} {match.resultType}</span>
          )}
        </div>
      )}

      {match.tossWinner && (
        <div className="match-toss">
          <strong>Toss: </strong>
          {match.tossWinner.name} won and chose to {match.tossDecision}
        </div>
      )}

      <div className="match-card-actions">
        {match.status === 'upcoming' && onStart && (
          <button 
            onClick={() => onStart(match)} 
            className="btn btn-success"
          >
            Start Match
          </button>
        )}
        
        {match.status === 'live' && (
          <Link 
            to={`/match/${match._id}/live`} 
            className="btn btn-primary"
          >
            View Live Score
          </Link>
        )}

        {match.status === 'completed' && (
          <Link 
            to={`/match/${match._id}/scorecard`} 
            className="btn btn-secondary"
          >
            View Scorecard
          </Link>
        )}

        {onEdit && match.status === 'upcoming' && (
          <button 
            onClick={() => onEdit(match)} 
            className="btn btn-secondary"
          >
            Edit
          </button>
        )}

        {onDelete && match.status !== 'live' && (
          <button 
            onClick={() => onDelete(match._id)} 
            className="btn btn-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
