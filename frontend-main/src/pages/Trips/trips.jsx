import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './trips.css';
import fetchWithAuth from '../../utils/fetchWihAuth';

const API_BASE = 'https://splitmate-zqda.onrender.com';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/trips/my-trips`);
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        setTrips([]);
      }
      setLoading(false);
    }
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(trip => trip.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <div className="trips-header-row">
          <h1 className="trips-heading">All Trips</h1>
        </div>
        <div className="trips-search-row">
          <input
            className="trips-search-input"
            type="text"
            placeholder="Search trip name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="trips-create-btn" onClick={() => navigate('/trips/create')}>
            <span className="trips-create-icon">+</span> Create Trip
          </button>
        </div>
        <div className="trips-list">
          {loading ? <div className="trips-loading">Loading...</div> :
            filteredTrips.length === 0 ? <div className="trips-empty">No trips found.</div> :
            filteredTrips.map(trip => (
              <div className="trip-card" key={trip._id} onClick={() => navigate(`/trips/${trip._id}`)} style={{ cursor: 'pointer' }}>
                <div className="trip-title-row">{trip.title}</div>
                <div className="trip-members-row">
                  <span className="trip-label">Members:</span>
                  <span className="trip-members">{trip.members.map(m => m.name).join(', ')}</span>
                </div>
                <div className="trip-created-by">Created by: {trip.members[0]?.name || 'Unknown'}</div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Trips;
