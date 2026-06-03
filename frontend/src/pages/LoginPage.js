import { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [role, setRole]         = useState('buyer');   // selected role toggle
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Role mismatch check
      if (data.user.role !== role) {
        setError(
          `Wrong account type. This account is a ${data.user.role}, not a ${role}.`
        );
        return;
      }

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

        {/* Logo / heading */}
        <div className="lp-header">
          <span className="lp-logo">🌿</span>
          <h2 className="lp-title">FarmFlow</h2>
          <p className="lp-sub">Sign in to continue</p>
        </div>

        {/* Role toggle */}
        <div className="lp-toggle">
          <button
            type="button"
            className={`lp-toggle__btn ${role === 'buyer' ? 'lp-toggle__btn--active' : ''}`}
            onClick={() => { setRole('buyer'); setError(''); }}
          >
            🛒 Buyer
          </button>
          <button
            type="button"
            className={`lp-toggle__btn ${role === 'seller' ? 'lp-toggle__btn--active' : ''}`}
            onClick={() => { setRole('seller'); setError(''); }}
          >
            🏪 Seller
          </button>
        </div>

        {/* Error */}
        {error && <div className="lp-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="lp-form">
          <label className="lp-label">Email</label>
          <input
            className="lp-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label className="lp-label">Password</label>
          <input
            className="lp-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />

          <button
            className="lp-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Logging in…'
              : `Login as ${role === 'buyer' ? 'Buyer' : 'Seller'}`}
          </button>
        </form>

      </div>
    </div>
  );
}

export default LoginPage;
