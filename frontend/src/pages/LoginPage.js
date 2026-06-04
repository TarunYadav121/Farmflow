import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';
const API_URL = process.env.REACT_APP_API_URL || "";
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Show the server's message — covers "Invalid credentials", missing fields, etc.
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Role is detected automatically from the server response
      // App.js routes to the correct dashboard based on user.role
      onLogin({ ...data.user, token: data.token });
    } catch {
      setError('Cannot reach server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-wrap">
      <div className="lp-card">

        {/* Header */}
        <div className="lp-header">
          <span className="lp-logo">🌿</span>
          <h2 className="lp-title">FarmFlow</h2>
          <p className="lp-sub">Sign in to your account</p>
        </div>

        {/* Role info pill */}
        <div className="lp-role-hint">
          Your role (Buyer or Seller) is detected automatically after login.
        </div>

        {/* Error */}
        {error && <div className="lp-error" role="alert">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="lp-form" noValidate>
          <label className="lp-label" htmlFor="lp-email">Email</label>
          <input
            id="lp-email"
            className="lp-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label className="lp-label" htmlFor="lp-password">Password</label>
          <input
            id="lp-password"
            className="lp-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
            required
          />

          <button className="lp-submit" type="submit" disabled={loading}>
            {loading
              ? <><span className="lp-spinner" /> Logging in…</>
              : 'Login'}
          </button>
        </form>

        {/* Register link */}
        <p className="lp-footer">
          Don't have an account?{' '}
          <Link to="/register" className="lp-link">Register here</Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;
