import React, { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Friendnavbar from '../../../components/Navbar/Friendnavbar';
import './outgoing_req.css';

const OutgoingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/friends/outgoing', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Could not fetch requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <Friendnavbar />
        <div className="outgoing-req-container">
          <h2 className="outgoing-req-title">Outgoing Friend Requests</h2>
          {error && <div className="outgoing-req-error">{error}</div>}
          {loading ? <div className="outgoing-req-loading">Loading...</div> :
            requests.length === 0 ? <div className="outgoing-req-empty">No outgoing requests</div> :
            <ul className="outgoing-req-list">
              {requests.map(req => (
                <li key={req._id} className="outgoing-req-item">
                  <span className="outgoing-req-receiver">{req.receiver.name} <span className="outgoing-req-username">({req.receiver.username})</span></span>
                  <span className="outgoing-req-status">Pending</span>
                </li>
              ))}
            </ul>
          }
        </div>
      </main>
    </div>
  );
};

export default OutgoingRequests;
