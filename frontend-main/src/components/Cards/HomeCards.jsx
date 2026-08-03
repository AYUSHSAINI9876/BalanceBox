import React from 'react';
import './HomeCards.css';

const formatCurrency = (value) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `₹${Math.round(value).toLocaleString('en-IN')}`
    : '—';

const formatCount = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value : '—';

const HomeCards = ({ loading, totalTrips, totalExpense, totalFriends }) => (
  <div className="home-cards-container">
    <div className="home-card">
      <div className="home-card-title">Total Trips</div>
      <div className="home-card-value">{loading ? '…' : formatCount(totalTrips)}</div>
    </div>
    <div className="home-card">
      <div className="home-card-title">Total Expense</div>
      <div className="home-card-value">{loading ? '…' : formatCurrency(totalExpense)}</div>
    </div>
    <div className="home-card">
      <div className="home-card-title">Total Friends</div>
      <div className="home-card-value">{loading ? '…' : formatCount(totalFriends)}</div>
    </div>
  </div>
);

export default HomeCards;
