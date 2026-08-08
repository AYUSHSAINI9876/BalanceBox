import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/fetchWihAuth';
import AuthBrand from '../../components/AuthBrand/AuthBrand';
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

const STEP_EMAIL = 0;
const STEP_OTP = 1;
const STEP_PROFILE = 2;

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_EMAIL);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [taglineIdx, setTaglineIdx] = useState(0);

  const otpRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx(idx => (idx + 1) % TAGLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Countdown that gates the "Resend" control.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === STEP_OTP) otpRef.current?.focus();
    if (step === STEP_PROFILE) nameRef.current?.focus();
  }, [step]);

  async function post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
    return data;
  }

  async function handleSendOtp(e) {
    e?.preventDefault();
    setError('');
    setNotice('');
    if (!email.trim()) return setError('Please enter your email address.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');

    setLoading(true);
    try {
      const data = await post('/api/users/send-otp', { email: email.trim() });
      setStep(STEP_OTP);
      setCooldown(data.resendAfterSeconds || 60);
      setNotice(`We sent a 6-digit code to ${email.trim()}.`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleResend() {
    if (cooldown > 0 || loading) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const data = await post('/api/users/send-otp', { email: email.trim() });
      setCooldown(data.resendAfterSeconds || 60);
      setOtp('');
      setNotice('A new code is on its way.');
      otpRef.current?.focus();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!/^\d{6}$/.test(otp.trim())) return setError('Enter the 6-digit code from your email.');

    setLoading(true);
    try {
      const data = await post('/api/users/verify-otp', { email: email.trim(), otp: otp.trim() });
      setSignupToken(data.signupToken);
      setStep(STEP_PROFILE);
      setNotice('Email verified. Just a few details left.');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!name.trim() || !username.trim() || !password) {
      return setError('Please fill in all the fields.');
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      return setError('Username must be 3-30 characters: letters, numbers or underscores.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      const data = await post('/api/users/register', {
        signupToken,
        name: name.trim(),
        username: username.trim(),
        password,
      });
      // The API signs the user in on creation, so go straight to the dashboard.
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError(err.message);
      // A stale verification means starting the email step again.
      if (/verification/i.test(err.message)) {
        setSignupToken('');
        setStep(STEP_EMAIL);
      }
    }
    setLoading(false);
  }

  return (
    <div className="login-main-container">
      <div className="login-left">
        <AuthBrand />

        <div className="auth-steps" aria-hidden="true">
          {[STEP_EMAIL, STEP_OTP, STEP_PROFILE].map(s => (
            <span
              key={s}
              className={`auth-step-dot${step === s ? ' active' : ''}${step > s ? ' done' : ''}`}
            />
          ))}
        </div>

        {step === STEP_EMAIL && (
          <>
            <h1 className="auth-heading">Sign-Up</h1>
            <p className="auth-subheading">
              We'll send an <span className="auth-sub-strong">OTP</span> to the email for verification.
            </p>

            <form className="login-form" onSubmit={handleSendOtp} noValidate>
              <label className="login-label" htmlFor="signup-email">Email Id</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className={`login-input${error ? ' has-error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />

              <div className="auth-action-row">
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
                <span className="auth-inline-note">
                  Didn't receive the OTP? Check your <strong>spam folder</strong>.
                </span>
              </div>

              {error && <div className="login-error" role="alert">{error}</div>}
            </form>

            <div className="login-signup-link">
              <span>Already have an account?</span>
              <Link to="/login" className="signup-link-btn">Login</Link>
            </div>
          </>
        )}

        {step === STEP_OTP && (
          <>
            <h1 className="auth-heading">Verify email</h1>
            <p className="auth-subheading auth-subheading-muted">
              Enter the 6-digit code we sent to verify it's you.
            </p>

            <div className="otp-email-row">
              <span>Sent to</span>
              <span className="otp-email">{email.trim()}</span>
              <button
                type="button"
                className="auth-linkbtn"
                onClick={() => { setStep(STEP_EMAIL); setOtp(''); setError(''); setNotice(''); }}
                disabled={loading}
              >
                Change
              </button>
            </div>

            <form className="login-form" onSubmit={handleVerifyOtp} noValidate>
              <label className="login-label" htmlFor="signup-otp">Verification code</label>
              <input
                ref={otpRef}
                id="signup-otp"
                name="one-time-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`login-input otp-input${error ? ' has-error' : ''}`}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
              />

              <div className="auth-action-row">
                <button type="submit" className="login-btn" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
                <span className="auth-inline-note">
                  Didn't receive the OTP? Check your <strong>spam folder</strong>, or{' '}
                  <button
                    type="button"
                    className="auth-linkbtn"
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                  >
                    {cooldown > 0 ? `resend in ${cooldown}s` : 'resend it'}
                  </button>.
                </span>
              </div>

              {notice && !error && <div className="auth-success-note">{notice}</div>}
              {error && <div className="login-error" role="alert">{error}</div>}
            </form>
          </>
        )}

        {step === STEP_PROFILE && (
          <>
            <h1 className="auth-heading">Almost there</h1>
            <p className="auth-subheading auth-subheading-muted">
              Set up your profile to finish creating your account.
            </p>

            <form className="login-form" onSubmit={handleCreateAccount} noValidate>
              <label className="login-label" htmlFor="signup-name">Full name</label>
              <input
                ref={nameRef}
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                className="login-input"
                placeholder="Ayush Saini"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />

              <label className="login-label" htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                className="login-input"
                placeholder="ayush_saini"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                aria-describedby="signup-username-hint"
              />
              <div className="login-hint" id="signup-username-hint">
                Friends use this to add you to trips.
              </div>

              <label className="login-label" htmlFor="signup-password">Password</label>
              <div className="login-password-wrap">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="login-input"
                  placeholder="At least 8 characters"
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
                {loading ? 'Creating account…' : 'Create account'}
              </button>

              {error && <div className="login-error" role="alert">{error}</div>}
            </form>
          </>
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
