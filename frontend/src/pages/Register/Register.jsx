import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const TAGLINES = [
  "No math. No stress. Just SplitMate.",
  "Keep every trip fair and easy.",
  "Split easily. Travel happily.",
  "Your go‑to for hassle‑free splits.",
  "Sharing made simple, with SplitMate."
];

const DESCRIPTION = `SplitMate simplifies expense sharing across trips and friends.\nCreate trips, add expenses, track who owes whom, and view category-wise summaries — all in one intuitive dashboard.\nWith real-time balances and clear charts, SplitMate keeps everyone fair and stress-free so you can focus on making memories.`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx(idx => (idx + 1) % TAGLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !name.trim() || !password.trim()) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), name: name.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-main-container">
      <div className="login-left">
        <div className="login-logo-container">
          <img
            src="/SplitMate_logo.svg"
            alt="Logo"
            className="login-logo"
          />
        </div>
        <h2 className="login-title">Register</h2>
        {success ? (
          <div className="login-success">
            Registration successful! <br />
            <a href="/login" className="signup-link-btn" style={{marginTop: '18px', display: 'inline-block'}}>Go to Login</a>
          </div>
        ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" className="login-input" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="text" placeholder="Name" className="login-input" value={name} onChange={e => setName(e.target.value)} />
          <input type="password" placeholder="Password" className="login-input" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        )}
        {!success && (
        <div className="login-signup-link">
          <span>Already have an account?</span>
          <a href="/login" className="signup-link-btn">Login</a>
        </div>
        )}
      </div>
      <div className="login-right login-info-box">
        <div className="login-info-title">SplitMate</div>
        <div className="login-info-tagline">{TAGLINES[taglineIdx]}</div>
        <div className="login-info-desc">
          {DESCRIPTION.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </div>
      </div>
    </div>
  );
};

export default Register;
