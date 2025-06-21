import React, { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Friendnavbar from '../../../components/Navbar/Friendnavbar';
import './friendsList.css';

const FriendsList = () => {
  const [inputUsername, setInputUsername] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addMsg, setAddMsg] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  async function fetchFriends() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me/friends-balances', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Could not fetch friends');
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleAddFriend() {
    setAddMsg('');
    setError('');
    if (!inputUsername) return setError('Please enter a username');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/friends/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: inputUsername })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send request');
      setAddMsg('Friend request sent!');
      setInputUsername('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="trips-layout">
      <Sidebar />
      <main className="trips-main-content">
        <Friendnavbar />
        <div className="friends-add-row">
          <input
            className="friends-id-input"
            type="text"
            placeholder="Enter username to add friend"
            value={inputUsername}
            onChange={e => setInputUsername(e.target.value)}
          />
          <button className="friends-add-btn" onClick={handleAddFriend}>Add Friend</button>
        </div>
        {addMsg && <div className="friends-add-msg">{addMsg}</div>}
        {error && <div className="friends-error">{error}</div>}
        <div className="friends-list-container">
          {loading ? <div className="friends-loading">Loading...</div> :
            friends.length === 0 ? <div className="friends-empty">No friends yet</div> :
            <ul className="friends-list">
              {friends.map(f => (
                <li key={f.id} className="friends-list-item">
                  <span className="friends-list-name">{f.name}</span>
                  <span className={f.balance > 0 ? 'owe' : f.balance < 0 ? 'get' : 'settled'}>
                    {f.balance > 0 ? `You owe ₹${f.balance.toFixed(2)}` :
                      f.balance < 0 ? `You get ₹${Math.abs(f.balance).toFixed(2)}` :
                      'Settled'}
                  </span>
                </li>
              ))}
            </ul>
          }
        </div>
      </main>
    </div>
  );
};

export default FriendsList;
