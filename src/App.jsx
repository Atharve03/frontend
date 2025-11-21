import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Matches from './pages/Matches';
import LiveScoreboard from './pages/LiveScoreboard';
import Statistics from './pages/Statistics';

// Protected Route Component
import { useAuth } from './context/AuthContext';
import AIInsights from './pages/AIInsights';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <MatchProvider>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <div className="main-content">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/teams" element={<Teams />} />
                          <Route path="/players" element={<Players />} />
                          <Route path="/matches" element={<Matches />} />
                          <Route path="/match/:id/live" element={<LiveScoreboard />} />
                          <Route path="/statistics" element={<Statistics />} />
                          <Route path="/ai-insights" element={<AIInsights />} />
                        </Routes>
                      </div>
                    </>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </MatchProvider>
    </AuthProvider>
  );
}

export default App;
