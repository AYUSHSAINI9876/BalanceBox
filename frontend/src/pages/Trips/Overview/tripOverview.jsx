import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import TripNavbar from '../../../components/Navbar/TripNavbar';
import TripOverviewPieChart from '../../../components/Charts/TripOverviewPieChart';
import TripOverviewBarChart from '../../../components/Charts/TripOverviewBarChart';
import './tripOverview.css';

const TripOverview = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [totalExpense, setTotalExpense] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        // Trip details
        const tripRes = await fetch(`/api/trips/${tripId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!tripRes.ok) throw new Error('Trip not found');
        const tripJson = await tripRes.json();
        setTrip(tripJson);
        // Total expense
        const totalRes = await fetch(`/api/trips/${tripId}/totalExpense`, { headers: { Authorization: `Bearer ${token}` } });
        const totalJson = await totalRes.json();
        setTotalExpense(totalJson.totalExpense || 0);
        // Category pie chart
        const catRes = await fetch(`/api/trips/${tripId}/category-expenses`, { headers: { Authorization: `Bearer ${token}` } });
        const catJson = await catRes.json();
        setCategoryData(catJson.categories || []);
        // Member bar chart
        const memRes = await fetch(`/api/trips/${tripId}/membersExpenseSummary`, { headers: { Authorization: `Bearer ${token}` } });
        const memJson = await memRes.json();
        setMemberData(memJson.summary || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchAll();
  }, [tripId]);

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <TripNavbar />
        {loading ? <div className="trips-loading">Loading...</div> :
          error ? <div className="trips-empty">{error}</div> :
          trip && (
            <div className="trip-overview-box">
              <div className="trip-overview-header-row">
                <div>
                  <h2 className="trip-overview-title">{trip.title}</h2>
                  <div className="trip-overview-section">
                    <span className="trip-label">Members:</span>
                    <span className="trip-members">{trip.members.map(m => m.name).join(', ')}</span>
                  </div>
                </div>
                <div className="trip-overview-total-box">
                  <div className="trip-label">Total Expense</div>
                  <div className="trip-overview-total">₹{totalExpense !== null ? totalExpense.toLocaleString() : '0'}</div>
                </div>
              </div>
              <div className="trip-overview-charts-row">
                <TripOverviewPieChart data={categoryData} />
                <TripOverviewBarChart data={memberData} />
              </div>
            </div>
          )}
      </main>
    </div>
  );
};

export default TripOverview;
