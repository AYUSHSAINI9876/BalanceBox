import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './trips.css';
import fetchWithAuth, { API_BASE } from '../../utils/fetchWihAuth';
import { PlusIcon } from '../../components/Icons/Icons';


const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchTrips() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/trips/my-trips`);
        if (!res.ok) throw new Error('Could not load your trips');
        const data = await res.json();
        if (!cancelled) setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setTrips([]);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTrips();
    return () => { cancelled = true; };
  }, []);

  const query = search.trim().toLowerCase();
  const filteredTrips = query
    ? trips.filter(trip => trip.title.toLowerCase().includes(query))
    : trips;

  const openTrip = (tripId) => navigate(`/trips/${tripId}`);

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
            type="search"
            aria-label="Search trips by name"
            placeholder="Search trip name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="trips-create-btn" onClick={() => navigate('/trips/create')}>
            <PlusIcon className="trips-create-icon" /> Create Trip
          </button>
        </div>
        <div className="trips-list">
          {loading ? <div className="trips-loading">Loading…</div> :
            error ? <div className="trips-empty" role="alert">{error}</div> :
            filteredTrips.length === 0 ? (
              <div className="trips-empty">
                {trips.length === 0 ? 'No trips yet — create your first one.' : 'No trips match your search.'}
              </div>
            ) :
            filteredTrips.map(trip => (
              <div
                className="trip-card"
                key={trip._id}
                role="button"
                tabIndex={0}
                onClick={() => openTrip(trip._id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openTrip(trip._id);
                  }
                }}
              >
                <div className="trip-title-row">{trip.title}</div>
                <div className="trip-members-row">
                  <span className="trip-label">Members:</span>
                  <span className="trip-members">{trip.members.map(m => m.name).join(', ')}</span>
                </div>
                <div className="trip-created-by">Created by: {trip.createdBy?.name || 'Unknown'}</div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Trips;
