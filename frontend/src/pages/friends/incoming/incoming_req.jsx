import React, { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Friendnavbar from '../../../components/Navbar/Friendnavbar';
import fetchWithAuth from '../../../utils/fetchWihAuth';
import './incoming_req.css';

const API_BASE = 'https://splitmate-zqda.onrender.com';

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/friends/incoming`);
      if (!res.ok) throw new Error('Could not fetch requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleRespond(requestId, action) {
    setMsg('');
    setError('');
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/friends/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to respond');
      setMsg(`Request ${action === 'accepted' ? 'accepted' : 'declined'}!`);
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <Friendnavbar />
        <div className="incoming-req-container">
          <h2 className="incoming-req-title">Incoming Friend Requests</h2>
          {msg && <div className="incoming-req-msg">{msg}</div>}
          {error && <div className="incoming-req-error">{error}</div>}
          {loading ? <div className="incoming-req-loading">Loading...</div> :
            requests.length === 0 ? <div className="incoming-req-empty">No incoming requests</div> :
            <ul className="incoming-req-list">
              {requests.map(req => (
                <li key={req._id} className="incoming-req-item">
                  <span className="incoming-req-sender">{req.sender.name} <span className="incoming-req-username">({req.sender.username})</span></span>
                  <div className="incoming-req-actions">
                    <button className="incoming-req-accept" onClick={() => handleRespond(req._id, 'accepted')}>Accept</button>
                    <button className="incoming-req-reject" onClick={() => handleRespond(req._id, 'declined')}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          }
        </div>
      </main>
    </div>
  );
};

export default IncomingRequests;
