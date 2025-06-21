import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import TripNavbar from '../../../components/Navbar/TripNavbar';
import TripUserPieChart from '../../../components/Charts/TripUserPieChart';
import fetchWithAuth from '../../../utils/fetchWihAuth';
import './TripUser.css';

const API_BASE = 'https://splitmate-zqda.onrender.com';

const TripUser = () => {
  const { tripId } = useParams();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBalances() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/trips/${tripId}/my-balances`);
        if (!res.ok) throw new Error('Could not fetch balances');
        const data = await res.json();
        setBalances(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchBalances();
  }, [tripId]);

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <TripNavbar />
        <div className="trip-user-content-row">
          <div className="trip-user-balances-box">
            <h2 className="trip-user-section-title">Your Balances</h2>
            {loading ? <div className="trip-user-loading">Loading...</div> :
              error ? <div className="trip-user-error">{error}</div> :
              balances.length === 0 ? <div className="trip-user-empty">No balances</div> :
              <ul className="trip-user-balance-list">
                {balances.map(bal => (
                  <li key={bal.userId} className={bal.balance > 0 ? 'owe' : bal.balance < 0 ? 'get' : 'settled'}>
                    <span className="trip-user-balance-name">{bal.name}</span>
                    <span className="trip-user-balance-amount">
                      {bal.balance > 0 ? `You owe ₹${bal.balance.toFixed(2)}` :
                        bal.balance < 0 ? `You get ₹${Math.abs(bal.balance).toFixed(2)}` :
                        'Settled'}
                    </span>
                  </li>
                ))}
              </ul>
            }
          </div>
          <TripUserPieChart />
        </div>
      </main>
    </div>
  );
};

export default TripUser;
