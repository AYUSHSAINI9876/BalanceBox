import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import TripNavbar from '../../../components/Navbar/TripNavbar';
import TripOverviewPieChart from '../../../components/Charts/TripOverviewPieChart';
import TripOverviewBarChart from '../../../components/Charts/TripOverviewBarChart';
import fetchWithAuth, { API_BASE } from '../../../utils/fetchWihAuth';
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
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError('');
      try {
        // All four are independent — request them concurrently, not as a waterfall.
        const [tripRes, totalRes, catRes, memRes] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/trips/${tripId}`),
          fetchWithAuth(`${API_BASE}/api/trips/${tripId}/totalExpense`),
          fetchWithAuth(`${API_BASE}/api/trips/${tripId}/category-expenses`),
          fetchWithAuth(`${API_BASE}/api/trips/${tripId}/membersExpenseSummary`),
        ]);

        if (!tripRes.ok) throw new Error('Trip not found');

        const [tripJson, totalJson, catJson, memJson] = await Promise.all([
          tripRes.json(),
          totalRes.ok ? totalRes.json() : Promise.resolve({}),
          catRes.ok ? catRes.json() : Promise.resolve({}),
          memRes.ok ? memRes.json() : Promise.resolve({}),
        ]);

        if (cancelled) return;
        setTrip(tripJson);
        setTotalExpense(totalJson.totalExpense || 0);
        setCategoryData(catJson.categories || []);
        setMemberData(memJson.summary || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
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
