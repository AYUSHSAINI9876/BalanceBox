import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../utils/fetchWihAuth';
import '../../styles/authForm.css';
import './Register.css';

const TAGLINES = [
  "No math. No stress. Just BalanceBox.",
  "Keep every trip fair and easy.",
  "Split easily. Travel happily.",
  "Your go‑to for hassle‑free splits.",
  "Sharing made simple, with BalanceBox."
];

const DESCRIPTION = `BalanceBox simplifies expense sharing across trips and friends.\nCreate trips, add expenses, track who owes whom, and view category-wise summaries — all in one intuitive dashboard.\nWith real-time balances and clear charts, BalanceBox keeps everyone fair and stress-free so you can focus on making memories.`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx(idx => (idx + 1) % TAGLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !name.trim() || !password) {
      setError('Please fill all fields.');
      return;
    }
    // Mirrors the server-side rules so users get feedback without a round trip.
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      setError('Username must be 3-30 characters, letters/numbers/underscores only.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
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
            src="/BalanceBox.svg"
            alt=""
            aria-hidden="true"
            className="login-logo"
          />
          <span className="login-logo-wordmark">BalanceBox</span>
        </div>
        <h2 className="login-title">Register</h2>
        {success ? (
          <div className="login-success">
            Registration successful! <br />
            <Link to="/login" className="signup-link-btn" style={{marginTop: '18px', display: 'inline-block'}}>Go to Login</Link>
          </div>
        ) : (
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-label" htmlFor="register-username">Username</label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            className="login-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <label className="login-label" htmlFor="register-name">Name</label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Name"
            className="login-input"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
          <label className="login-label" htmlFor="register-password">Password</label>
          <div className="login-password-wrap">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              aria-describedby="register-password-hint"
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="login-hint" id="register-password-hint">At least 8 characters.</div>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        )}
        {!success && (
        <div className="login-signup-link">
          <span>Already have an account?</span>
          <Link to="/login" className="signup-link-btn">Login</Link>
        </div>
        )}
      </div>
      <div className="login-right login-info-box">
        <div className="login-info-title">BalanceBox</div>
        <div className="login-info-tagline">{TAGLINES[taglineIdx]}</div>
        <div className="login-info-desc">
          {DESCRIPTION.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </div>
      </div>
    </div>
  );
};

export default Register;
