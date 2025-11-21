import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">Cricket Scoreboard</Link>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/teams" className={isActive('/teams')}>
            Teams
          </Link>
        </li>
        <li>
  <Link to="/ai-insights" className={isActive('/ai-insights')}>
    🤖 AI Insights
  </Link>
</li>

        <li>
          <Link to="/players" className={isActive('/players')}>
            Players
          </Link>
        </li>
        <li>
          <Link to="/matches" className={isActive('/matches')}>
            Matches
          </Link>
        </li>
        <li>
          <Link to="/statistics" className={isActive('/statistics')}>
            Statistics
          </Link>
        </li>
      </ul>

      <div className="nav-user">
        <span className="user-name">{user?.username}</span>
        <span className="user-role">{user?.role}</span>
        <button onClick={logout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
