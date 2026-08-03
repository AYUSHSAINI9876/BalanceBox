import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_BASE } from '../../utils/fetchWihAuth';
import '../../styles/authForm.css';
import './Login.css';

const TAGLINES = [
  "No math. No stress. Just BalanceBox.",
  "Keep every trip fair and easy.",
  "Split easily. Travel happily.",
  "Your go‑to for hassle‑free splits.",
  "Sharing made simple, with BalanceBox."
];

const DESCRIPTION = `BalanceBox simplifies expense sharing across trips and friends.\nCreate trips, add expenses, track who owes whom, and view category-wise summaries — all in one intuitive dashboard.\nWith real-time balances and clear charts, BalanceBox keeps everyone fair and stress-free so you can focus on making memories.`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx(idx => (idx + 1) % TAGLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

 useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      setSessionExpired(true);
    } else {
      setSessionExpired(false);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      navigate(location.state?.from || '/', { replace: true });
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
        <h2 className="login-title">Login</h2>
         {sessionExpired && (
          <div className="login-error" style={{marginBottom: '1rem', color: '#e53935'}}>Session expired. Please login again.</div>
        )}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-label" htmlFor="login-username">Username</label>
          <input
            id="login-username"
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
          <label className="login-label" htmlFor="login-password">Password</label>
          <div className="login-password-wrap">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
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
          {error && <div className="login-error" role="alert">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="login-signup-link">
          <span>Don't have an account?</span>
          <Link to="/register" className="signup-link-btn">Register</Link>
        </div>
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

export default Login;
