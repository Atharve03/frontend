import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast';

const MatchContext = createContext();

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within MatchProvider');
  }
  return context;
};

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  // Socket setup
  useEffect(() => {
    connectSocket();

    return () => {
      if (socket) {
        socket.off('score-update');
        socket.off('wicket-fall');
        socket.off('innings-end');
      }
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('score-update', (data) => {
      setLiveMatch((prev) => {
        if (prev && prev.match && prev.match._id === data.match._id) {
          return data;
        }
        return prev;
      });
    });

    socket.on('wicket-fall', (data) => {
      console.log('Wicket fallen:', data);
      toast.success('Wicket!');
    });

    socket.on('innings-end', (data) => {
      console.log('Innings ended:', data);
      toast.info('Innings ended');
    });

    return () => {
      if (socket) {
        socket.off('score-update');
        socket.off('wicket-fall');
        socket.off('innings-end');
      }
    };
  }, []);

  // Fetch all matches
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches');
      setMatches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single live match - MEMOIZED
// Fetch single live match - MEMOIZED
const fetchLiveMatch = useCallback(async (matchId) => {
    try {
      setLoading(true);
      // ✅ Change this to use /live endpoint
      const response = await api.get(`/matches/${matchId}/live`);
      setLiveMatch(response.data.data);
      
      // Join the match room for real-time updates
      if (socket) {
        socket.emit('join-match', matchId);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching live match:', error);
      toast.error('Failed to load match');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  

  // Create match
  const createMatch = async (matchData) => {
    try {
      const response = await api.post('/matches', matchData);
      toast.success('Match created successfully');
      fetchMatches(); // Refresh list
      return response.data.data;
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error(error.response?.data?.message || 'Failed to create match');
      throw error;
    }
  };

  // Start match
  const startMatch = async (matchId, tossData) => {
    try {
      const response = await api.post(`/matches/${matchId}/start`, tossData);
      toast.success('Match started successfully');
      fetchMatches(); // Refresh list
      return response.data.data;
    } catch (error) {
      console.error('Error starting match:', error);
      toast.error(error.response?.data?.message || 'Failed to start match');
      throw error;
    }
  };

  // Update score - MEMOIZED
  const updateScore = useCallback(async (matchId, scoreData) => {
    try {
      const response = await api.post(`/matches/${matchId}/score`, scoreData);
      toast.success('Score updated');
      // Refresh match data
      await fetchLiveMatch(matchId);
      return response.data.data;
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error(error.response?.data?.message || 'Failed to update score');
      throw error;
    }
  }, [fetchLiveMatch]);

  // Export all functions
  const value = {
    matches,
    liveMatch,
    loading,
    fetchMatches,
    fetchLiveMatch,
    createMatch,
    startMatch,
    updateScore,
    setLiveMatch
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};
