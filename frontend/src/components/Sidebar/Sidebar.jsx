import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Hamburger icon
  const Hamburger = (
    <button
      className="sidebar-hamburger"
      aria-label="Open sidebar"
      onClick={() => setMobileOpen(true)}
      style={{ display: mobileOpen ? 'none' : undefined }}
    >
      <span />
    </button>
  );

  // Overlay for mobile sidebar
  const Overlay = (
    <div
      className={`sidebar-overlay${mobileOpen ? ' active' : ''}`}
      onClick={() => setMobileOpen(false)}
      style={{ display: mobileOpen ? 'block' : 'none' }}
    />
  );

  // Sidebar content
  const SidebarContent = (
    <aside className={`sidebar-container${mobileOpen ? ' mobile-active' : ''}`} style={{ display: mobileOpen || window.innerWidth > 900 ? 'flex' : 'none' }}>
      {mobileOpen && (
        <button className="sidebar-close-btn" aria-label="Close sidebar" onClick={() => setMobileOpen(false)}>
          &times;
        </button>
      )}
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
          <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} end onClick={() => setMobileOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/trips" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setMobileOpen(false)}>
            Trips
          </NavLink>
          <NavLink to="/friends" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} onClick={() => setMobileOpen(false)}>
            Friends
          </NavLink>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <button className="sidebar-signout-btn" onClick={() => { setMobileOpen(false); handleSignout(); }}>
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {Hamburger}
      {Overlay}
      {SidebarContent}
    </>
  );
};

export default Sidebar;
