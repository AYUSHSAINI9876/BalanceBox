import React from 'react';
import { NavLink } from 'react-router-dom';
import './Friendnavbar.css';

const Friendnavbar = () => (
  <nav className="friend-navbar">
    <NavLink to="/friends" end className={({ isActive }) => isActive ? 'friend-navbar-link active' : 'friend-navbar-link'}>Friends</NavLink>
    <NavLink to="/friends/requests-incoming" className={({ isActive }) => isActive ? 'friend-navbar-link active' : 'friend-navbar-link'}>Incoming Requests</NavLink>
    <NavLink to="/friends/requests-pending" className={({ isActive }) => isActive ? 'friend-navbar-link active' : 'friend-navbar-link'}>Outgoing Requests</NavLink>
  </nav>
);

export default Friendnavbar;
