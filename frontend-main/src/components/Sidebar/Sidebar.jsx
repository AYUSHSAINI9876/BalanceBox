import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Hamburger icon
  const Hamburger = (
    <button
      className="sidebar-hamburger"
      aria-label="Open navigation menu"
      aria-expanded={mobileOpen}
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

  // Sidebar content — visibility across breakpoints is handled entirely in CSS.
  const SidebarContent = (
    <aside className={`sidebar-container${mobileOpen ? ' mobile-active' : ''}`}>
      {mobileOpen && (
        <button className="sidebar-close-btn" aria-label="Close sidebar" onClick={() => setMobileOpen(false)}>
          &times;
        </button>
      )}
      <div className="sidebar-top">
        <div className="sidebar-logo-box">
          <img
            src="/BalanceBox.svg"
            alt=""
            aria-hidden="true"
            className="sidebar-logo"
          />
          <div className="sidebar-logo-title">BalanceBox</div>
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
