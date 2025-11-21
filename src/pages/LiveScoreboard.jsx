import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';
import ScoreControls from '../components/ScoreControls';
import { useAuth } from '../context/AuthContext';

const LiveScoreboard = () => {
  const { id } = useParams();
  const { liveMatch, fetchLiveMatch } = useMatch();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const canScore = user?.role === 'admin' || user?.role === 'scorer';

  useEffect(() => {
    const loadMatch = async () => {
      try {
        await fetchLiveMatch(id);
      } catch (error) {
        console.error('Error loading match:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [id, fetchLiveMatch]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading match...</div>
      </div>
    );
  }

  if (!liveMatch) {
    return <div className="error-container">Match not found</div>;
  }

  const match = liveMatch.match || liveMatch;
  const currentInnings = liveMatch.currentInnings;
  const recentBalls = liveMatch.recentBalls || [];

  if (!match || !match.team1 || !match.team2) {
    return <div className="error-container">Invalid match data</div>;
  }

  // ✅ If no innings data yet, show waiting message
  if (!currentInnings) {
    return (
      <div className="live-scoreboard">
        <div className="scoreboard-header">
          <h1>
            {match.team1?.shortName || match.team1?.name || 'Team 1'} vs{' '}
            {match.team2?.shortName || match.team2?.name || 'Team 2'}
          </h1>
          {match.status === 'live' && <span className="live-badge">● LIVE</span>}
        </div>

        <div className="match-info">
          <p>📍 {match.venue || 'Venue TBD'}</p>
          <p>
            🏏 {match.matchType || 'Match'} • {match.oversPerInnings || 20} Overs
          </p>
        </div>

        <div className="no-innings">
          <p>⏳ Match has not started yet. Waiting for match to begin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-scoreboard">
      {/* HEADER */}
      <div className="scoreboard-header">
        <h1>
          {match.team1?.shortName || match.team1?.name || 'Team 1'} vs{' '}
          {match.team2?.shortName || match.team2?.name || 'Team 2'}
        </h1>
        {match.status === 'live' && <span className="live-badge">● LIVE</span>}
        {match.status === 'completed' && <span className="live-badge completed">✅ COMPLETED</span>}
      </div>

      {/* MATCH INFO */}
      <div className="match-info">
        <p>📍 {match.venue || 'Venue TBD'}</p>
        <p>
          🏏 {match.matchType || 'Match'} • {match.oversPerInnings || 20} Overs
        </p>
      </div>

      {/* ✅ SHOW MATCH COMPLETION FIRST IF STATUS IS COMPLETED */}
      {match.status === 'completed' && (
        <MatchResult match={match} />
      )}

      {/* INNINGS DATA */}
      <InningsDisplay
        innings={currentInnings}
        recentBalls={recentBalls}
        matchId={id}
        canScore={canScore}
        matchStatus={match.status}
      />
    </div>
  );
};

// ✅ MATCH RESULT COMPONENT
const MatchResult = ({ match }) => {
  return (
    <div className="match-result-container">
      <div className="match-result-header">
        <h2>🏆 MATCH COMPLETED</h2>
      </div>

      <div className="match-result-content">
        <div className="winner-section">
          <h3>🎉 Winner</h3>
          <div className="winner-name">{match.winner?.name || 'TBD'}</div>
        </div>

        <div className="result-section">
          <h3>📊 Result</h3>
          <p className="result-text">{match.result || 'Match completed'}</p>
        </div>

        <div className="final-scores">
          <h3>📋 Final Scores</h3>
          <div className="scores-grid">
            <div className="team-score">
              <span className="team-name">{match.team1?.name}</span>
              <span className="score-value">
                {match.team1FinalScore || 'N/A'}
              </span>
            </div>
            <div className="team-score">
              <span className="team-name">{match.team2?.name}</span>
              <span className="score-value">
                {match.team2FinalScore || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {match.manOfTheMatch && (
          <div className="mom-section">
            <h3>⭐ Man of the Match</h3>
            <p className="mom-name">{match.manOfTheMatch.name || match.manOfTheMatch}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ INNINGS DISPLAY COMPONENT
const InningsDisplay = ({ innings, recentBalls, matchId, canScore, matchStatus }) => {
  if (!innings) {
    return <div className="no-innings">⏳ Innings not available</div>;
  }

  // ✅ CHECK IF INNINGS IS OVER (10 WICKETS OR ALL OVERS COMPLETED)
  const maxOvers = 20; // You can make this dynamic based on match type
  const totalOvers = Math.floor((innings.totalBalls || 0) / 6);
  const isInningsOver = innings.totalWickets >= 10 || totalOvers >= maxOvers;

  if (isInningsOver) {
    return (
      <div className="innings-over-alert">
        <h2>⚠️ INNINGS OVER</h2>
        <div className="innings-over-reason">
          {innings.totalWickets >= 10 ? (
            <p>🏏 All Out - 10 Wickets Down</p>
          ) : (
            <p>⏱️ Overs Completed - {maxOvers} Overs</p>
          )}
        </div>

        <div className="final-innings-stats">
          <div className="stat-card">
            <span className="stat-label">Team</span>
            <span className="stat-value">{innings.battingTeam?.name || 'Team'}</span>
          </div>

          <div className="stat-card highlight">
            <span className="stat-label">Final Score</span>
            <span className="stat-value big">
              {innings.totalRuns}/{innings.totalWickets}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Overs</span>
            <span className="stat-value">
              {Math.floor((innings.totalBalls || 0) / 6)}.{(innings.totalBalls || 0) % 6}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Run Rate</span>
            <span className="stat-value">{(innings.currentRunRate || 0).toFixed(2)}</span>
          </div>
        </div>

        {matchStatus === 'completed' && (
          <div className="innings-complete-message">
            <p>✅ Match has ended. Check the final result above.</p>
          </div>
        )}

        {matchStatus === 'live' && (
          <div className="innings-complete-message">
            <p>⏳ Waiting for second innings to complete...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* SCORE DISPLAY */}
      <div className="score-display">
        <div className="batting-team">
          <h2>🏏 {innings.battingTeam?.name || 'Batting Team'}</h2>
          <div className="score">
            <span className="runs">{innings.totalRuns || 0}</span>
            <span className="separator">/</span>
            <span className="wickets">{innings.totalWickets || 0}</span>
          </div>
          <div className="overs">
            📊 Overs: {Math.floor((innings.totalBalls || 0) / 6)}.
            {(innings.totalBalls || 0) % 6} / {maxOvers}
          </div>
          <div className="run-rate">
            ⚡ CRR: {(innings.currentRunRate || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* CURRENT BATSMEN */}
      {innings.currentBatsmen && innings.currentBatsmen.length > 0 && (
        <div className="batsmen-info">
          <h3>👥 Current Batsmen</h3>
          {innings.currentBatsmen.map((batsman, index) => (
            <div key={index} className={`batsman ${batsman.isOnStrike ? 'on-strike' : ''}`}>
              <span className="name">
                {batsman.player?.name || 'Unknown'}
                {batsman.isOnStrike && <span className="strike-indicator">⭐ (Strike)</span>}
              </span>
              <span className="stats">
                {batsman.runs || 0} ({batsman.balls || 0})
                {(batsman.fours && batsman.fours > 0) && ` | 4s: ${batsman.fours}`}
                {(batsman.sixes && batsman.sixes > 0) && ` | 6s: ${batsman.sixes}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CURRENT BOWLER */}
      {innings.currentBowler && innings.currentBowler.player && (
        <div className="bowler-info">
          <h3>🎯 Current Bowler</h3>
          <div className="bowler">
            <span className="name">{innings.currentBowler.player.name}</span>
            <span className="stats">
              {Math.floor((innings.currentBowler.balls || 0) / 6)}.
              {(innings.currentBowler.balls || 0) % 6} -
              {innings.currentBowler.runs || 0} runs /
              {innings.currentBowler.wickets || 0} wickets
            </span>
          </div>
        </div>
      )}

      {/* RECENT BALLS */}
      {recentBalls && recentBalls.length > 0 && (
        <div className="recent-balls">
          <h3>🔄 This Over</h3>
          <div className="balls">
            {recentBalls.map((ball, index) => (
              <div
                key={index}
                className={`ball ${ball.wicketTaken ? 'wicket' : ''}`}
                title={
                  ball.wicketTaken ? 'Wicket' : `${(ball.runsScored || 0) + (ball.extras || 0)} runs`
                }
              >
                {ball.wicketTaken ? 'W' : (ball.runsScored || 0) + (ball.extras || 0)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCORE CONTROLS */}
      {canScore && innings && matchStatus === 'live' && <ScoreControls matchId={matchId} currentInnings={innings} />}
    </>
  );
};

export default LiveScoreboard;