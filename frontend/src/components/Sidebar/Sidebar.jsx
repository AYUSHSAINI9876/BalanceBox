import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const handleSignout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-top">
        <div className="sidebar-logo-box">
          <img
            src="/SplitMate_logo.svg"
            alt="Logo"
            className="sidebar-logo"
          />
          <div className="sidebar-logo-title">SplitMate</div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} end>
            Home
          </NavLink>
          <NavLink to="/trips" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            Trips
          </NavLink>
          <NavLink to="/friends" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            Friends
          </NavLink>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <button className="sidebar-signout-btn" onClick={handleSignout}>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
