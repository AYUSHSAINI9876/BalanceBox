import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTripForm.css';

const CreateTripForm = () => {
  const [title, setTitle] = useState('');
  const [members, setMembers] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !members.trim()) {
      setError('Please enter trip name and at least one member username.');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/trips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          memberUsernames: members.split(',').map(m => m.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create trip');
      navigate('/trips');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="create-trip-form-container">
      <h2 className="create-trip-heading">Create New Trip</h2>
      <form className="create-trip-form" onSubmit={handleSubmit}>
        <label>Trip Name</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter trip name"
          className="create-trip-input"
        />
        <label>Member Usernames (comma separated)</label>
        <input
          type="text"
          value={members}
          onChange={e => setMembers(e.target.value)}
          placeholder="e.g. ram, raju, priya"
          className="create-trip-input"
        />
        {error && <div className="create-trip-error">{error}</div>}
        <button className="create-trip-btn" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Trip'}
        </button>
      </form>
    </div>
  );
};

export default CreateTripForm;
