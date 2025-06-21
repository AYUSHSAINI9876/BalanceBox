import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import './TripNavbar.css';

const TripNavbar = () => {
  const { tripId } = useParams();
  return (
    <nav className="trip-navbar">
      <NavLink to={`/trips/${tripId}`} className={({isActive}) => isActive ? 'trip-nav-link active' : 'trip-nav-link'} end>Overview</NavLink>
      <NavLink to={`/trips/${tripId}/user`} className="trip-nav-link">User</NavLink>
      <NavLink to={`/trips/${tripId}/split-matrix`} className="trip-nav-link">Split Matrix</NavLink>
      <NavLink to={`/trips/${tripId}/expense-log`} className="trip-nav-link">Expense Log</NavLink>
    </nav>
  );
};

export default TripNavbar;
