import React, { useState, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ScoreControls = ({ matchId, currentInnings }) => {
  const { updateScore } = useMatch();
  const [battingPlayers, setBattingPlayers] = useState([]);
  const [bowlingPlayers, setBowlingPlayers] = useState([]);
  const [selectedStriker, setSelectedStriker] = useState('');
  const [selectedNonStriker, setSelectedNonStriker] = useState('');
  const [selectedBowler, setSelectedBowler] = useState('');
  const [showPlayerSelection, setShowPlayerSelection] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ FIXED - loadPlayers is now inside useEffect
  useEffect(() => {
    const loadPlayers = async () => {
      if (
        !currentInnings ||
        !currentInnings.battingTeam ||
        !currentInnings.battingTeam._id ||
        !currentInnings.bowlingTeam ||
        !currentInnings.bowlingTeam._id
      ) {
        console.warn('Innings or teams not fully loaded yet');
        return;
      }

      try {
        const battingResponse = await api.get(
          `/players/team/${currentInnings.battingTeam._id}`
        );
        setBattingPlayers(battingResponse.data.data || []);

        const bowlingResponse = await api.get(
          `/players/team/${currentInnings.bowlingTeam._id}`
        );
        setBowlingPlayers(bowlingResponse.data.data || []);

        if (currentInnings.currentBatsmen?.length > 0 && currentInnings.currentBowler) {
          setShowPlayerSelection(false);
        }
      } catch (error) {
        console.error('Error loading players:', error);
        toast.error('Failed to load players');
      }
    };

    loadPlayers();
  }, [currentInnings]); // ✅ Only currentInnings as dependency

  const handleSetPlayers = async () => {
    if (!selectedStriker || !selectedNonStriker || !selectedBowler) {
      toast.error('Please select both batsmen and bowler');
      return;
    }

    if (selectedStriker === selectedNonStriker) {
      toast.error('Striker and non-striker must be different');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/innings/${currentInnings._id}`, {
        currentBatsmen: [
          {
            player: selectedStriker,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOnStrike: true,
            isOut: false
          },
          {
            player: selectedNonStriker,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            isOnStrike: false,
            isOut: false
          }
        ],
        currentBowler: {
          player: selectedBowler,
          balls: 0,
          runs: 0,
          wickets: 0
        }
      });

      toast.success('Players set successfully!');
      setShowPlayerSelection(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to set players');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = async (runs) => {
    const striker = currentInnings.currentBatsmen?.find(b => b.isOnStrike)?.player?._id;
    const nonStriker = currentInnings.currentBatsmen?.find(b => !b.isOnStrike)?.player?._id;
    const bowler = currentInnings.currentBowler?.player?._id;

    if (!striker || !bowler) {
      toast.error('Please set striker and bowler first');
      return;
    }

    try {
      await updateScore(matchId, {
        inningsId: currentInnings._id,
        striker,
        nonStriker,
        bowler,
        runs,
        extras: 0,
        extraType: null,
        wicket: false,
        dismissalType: null
      });

      toast.success(`${runs} run${runs !== 1 ? 's' : ''} added`);
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Error updating score');
    }
  };

  const handleWicket = async () => {
    const striker = currentInnings.currentBatsmen?.find(b => b.isOnStrike)?.player?._id;
    const nonStriker = currentInnings.currentBatsmen?.find(b => !b.isOnStrike)?.player?._id;
    const bowler = currentInnings.currentBowler?.player?._id;

    if (!striker || !bowler) {
      toast.error('Please set striker and bowler first');
      return;
    }

    try {
      await updateScore(matchId, {
        inningsId: currentInnings._id,
        striker,
        nonStriker,
        bowler,
        runs: 0,
        extras: 0,
        extraType: null,
        wicket: true,
        dismissalType: 'bowled'
      });

      toast.success('Wicket! 🏏');
    } catch (error) {
      console.error('Error recording wicket:', error);
      toast.error('Error recording wicket');
    }
  };

  const handleExtra = async (type, runs) => {
    const striker = currentInnings.currentBatsmen?.find(b => b.isOnStrike)?.player?._id;
    const nonStriker = currentInnings.currentBatsmen?.find(b => !b.isOnStrike)?.player?._id;
    const bowler = currentInnings.currentBowler?.player?._id;

    if (!striker || !bowler) {
      toast.error('Please set striker and bowler first');
      return;
    }

    try {
      await updateScore(matchId, {
        inningsId: currentInnings._id,
        striker,
        nonStriker,
        bowler,
        runs: 0,
        extras: runs,
        extraType: type,
        wicket: false,
        dismissalType: null
      });

      toast.success(`${runs} ${type} added`);
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Error updating score');
    }
  };

  if (!currentInnings) {
    return <div className="no-data">No innings data available</div>;
  }

  if (!currentInnings.battingTeam || !currentInnings.bowlingTeam) {
    return <div className="loading">Loading teams...</div>;
  }

  // CHECK IF INNINGS IS OVER (10 WICKETS)
  if (currentInnings.totalWickets >= 10) {
    return (
      <div className="innings-over-message">
        <h3>🏏 Innings Over</h3>
        <p>All 10 wickets have fallen!</p>
        <p className="final-score">
          <strong>Final Score: {currentInnings.totalRuns}/{currentInnings.totalWickets}</strong>
        </p>
        <p className="overs-played">
          Overs: {Math.floor(currentInnings.totalBalls / 6)}.{currentInnings.totalBalls % 6}
        </p>
      </div>
    );
  }

  return (
    <div className="score-controls">
      {showPlayerSelection ? (
        <div className="player-selection">
          <h3>⚙️ Set Opening Players</h3>

          <div className="form-group">
            <label>Striker (On Strike) *</label>
            <select
              value={selectedStriker}
              onChange={(e) => setSelectedStriker(e.target.value)}
              className="form-control"
              disabled={loading}
            >
              <option value="">Select Striker</option>
              {battingPlayers.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.name} ({player.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Non-Striker *</label>
            <select
              value={selectedNonStriker}
              onChange={(e) => setSelectedNonStriker(e.target.value)}
              className="form-control"
              disabled={loading}
            >
              <option value="">Select Non-Striker</option>
              {battingPlayers.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.name} ({player.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Opening Bowler *</label>
            <select
              value={selectedBowler}
              onChange={(e) => setSelectedBowler(e.target.value)}
              className="form-control"
              disabled={loading}
            >
              <option value="">Select Bowler</option>
              {bowlingPlayers.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.name} ({player.role})
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handleSetPlayers}
            disabled={loading}
          >
            {loading ? 'Setting Players...' : 'Start Scoring'}
          </button>
        </div>
      ) : (
        <>
          <div className="control-section">
            <h4>📊 Runs</h4>
            <div className="score-buttons">
              {[0, 1, 2, 3, 4, 6].map((run) => (
                <button
                  key={run}
                  className={`score-btn ${run === 4 ? 'four' : run === 6 ? 'six' : ''}`}
                  onClick={() => handleScoreUpdate(run)}
                  title={`Add ${run} run${run !== 1 ? 's' : ''}`}
                >
                  {run}
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h4>➕ Extras</h4>
            <div className="score-buttons">
              <button
                className="score-btn extra wide"
                onClick={() => handleExtra('wide', 1)}
                title="Add 1 Wide"
              >
                Wide
              </button>
              <button
                className="score-btn extra noball"
                onClick={() => handleExtra('noball', 1)}
                title="Add 1 No Ball"
              >
                No Ball
              </button>
              <button
                className="score-btn extra bye"
                onClick={() => handleExtra('bye', 1)}
                title="Add 1 Bye"
              >
                Bye
              </button>
              <button
                className="score-btn extra legbye"
                onClick={() => handleExtra('legbye', 1)}
                title="Add 1 Leg Bye"
              >
                Leg Bye
              </button>
            </div>
          </div>

          <div className="control-section">
            <h4>💀 Wicket</h4>
            <button
              className="score-btn wicket"
              onClick={handleWicket}
              title="Record a Wicket"
            >
              Wicket
            </button>
          </div>

          <button
            className="btn btn-secondary btn-block"
            onClick={() => setShowPlayerSelection(true)}
            style={{ marginTop: '20px' }}
          >
            Change Players
          </button>
        </>
      )}
    </div>
  );
};

export default ScoreControls;
