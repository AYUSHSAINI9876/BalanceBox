import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_BASE } from '../../utils/fetchWihAuth';
import AuthBrand from '../../components/AuthBrand/AuthBrand';
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
  const [email, setEmail] = useState('');
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
    setSessionExpired(params.get('session') === 'expired');
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json().catch(() => ({}));
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
        <AuthBrand />

        <h1 className="auth-heading">Login</h1>
        <p className="auth-subheading auth-subheading-muted">
          Welcome back — sign in to pick up where you left off.
        </p>

        {sessionExpired && (
          <div className="login-error" role="status">
            Your session expired. Please log in again.
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-label" htmlFor="login-email">Email Id</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className={`login-input${error ? ' has-error' : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
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
              placeholder="Your password"
              className={`login-input${error ? ' has-error' : ''}`}
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>

          {error && <div className="login-error" role="alert">{error}</div>}
        </form>

        <div className="login-signup-link">
          <span>Don't have an account?</span>
          <Link to="/register" className="signup-link-btn">Sign-Up</Link>
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
