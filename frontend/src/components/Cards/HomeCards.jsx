import React, { useEffect, useState } from 'react';
import './HomeCards.css';
import fetchWithAuth from '../../utils/fetchWihAuth';

const API_BASE = 'https://splitmate-zqda.onrender.com';

const HomeCards = () => {
  const [totalTrips, setTotalTrips] = useState(null);
  const [totalFriends, setTotalFriends] = useState(null);
  const [totalExpense, setTotalExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const tripsRes = await fetchWithAuth(`${API_BASE}/api/users/totalTrips`);
        const tripsData = await tripsRes.json();
        setTotalTrips(tripsData.totalTrips);

        const friendsRes = await fetchWithAuth(`${API_BASE}/api/users/totalFriends`);
        const friendsData = await friendsRes.json();
        setTotalFriends(friendsData.totalFriends);

        const expenseRes = await fetchWithAuth(`${API_BASE}/api/users/totalExpense`);
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
