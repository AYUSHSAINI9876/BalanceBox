import React, { useEffect, useState } from 'react';
import './HomeCards.css';

const HomeCards = () => {
  const [totalTrips, setTotalTrips] = useState(null);
  const [totalFriends, setTotalFriends] = useState(null);
  const [totalExpense, setTotalExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const tripsRes = await fetch('/api/users/totalTrips', { headers: { Authorization: `Bearer ${token}` } });
        const tripsData = await tripsRes.json();
        setTotalTrips(tripsData.totalTrips);

        const friendsRes = await fetch('/api/users/totalFriends', { headers: { Authorization: `Bearer ${token}` } });
        const friendsData = await friendsRes.json();
        setTotalFriends(friendsData.totalFriends);

        const expenseRes = await fetch('/api/users/totalExpense', { headers: { Authorization: `Bearer ${token}` } });
        const expenseData = await expenseRes.json();
        setTotalExpense(expenseData.totalExpense);
      } catch (err) {
        setTotalTrips('N/A');
        setTotalFriends('N/A');
        setTotalExpense('N/A');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="home-cards-container">
      <div className="home-card">
        <div className="home-card-title">Total Trips</div>
        <div className="home-card-value">{loading ? '...' : totalTrips}</div>
      </div>
      <div className="home-card">
        <div className="home-card-title">Total Expense</div>
        <div className="home-card-value">{loading ? '...' : (totalExpense !== null ? `₹${Number(totalExpense).toLocaleString()}` : 'N/A')}</div>
      </div>
      <div className="home-card">
        <div className="home-card-title">Total Friends</div>
        <div className="home-card-value">{loading ? '...' : totalFriends}</div>
      </div>
    </div>
  );
};

export default HomeCards;
