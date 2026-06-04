import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'buyer',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function change(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic client-side check
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setError('Cannot reach server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-wrap">
      <div className="rp-card">

        {/* Header */}
        <div className="rp-header">
          <span className="rp-logo">🌿</span>
          <h2 className="rp-title">Create Account</h2>
          <p className="rp-sub">Join FarmFlow as a buyer or seller</p>
        </div>

        {/* Feedback */}
        {error   && <div className="rp-error"   role="alert">{error}</div>}
        {success && <div className="rp-success"  role="status">{success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rp-form" noValidate>

          <label className="rp-label" htmlFor="rp-name">Full Name</label>
          <input
            id="rp-name"
            className="rp-input"
            type="text"
            value={form.name}
            onChange={change('name')}
            placeholder="Your full name"
            autoComplete="name"
            required
          />

          <label className="rp-label" htmlFor="rp-email">Email</label>
          <input
            id="rp-email"
            className="rp-input"
            type="email"
            value={form.email}
            onChange={change('email')}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label className="rp-label" htmlFor="rp-password">
            Password <span className="rp-hint">(min 6 characters)</span>
          </label>
          <input
            id="rp-password"
            className="rp-input"
            type="password"
            value={form.password}
            onChange={change('password')}
            placeholder="••••••"
            autoComplete="new-password"
            minLength={6}
            required
          />

          <label className="rp-label" htmlFor="rp-role">I want to</label>
          <select
            id="rp-role"
            className="rp-input rp-select"
            value={form.role}
            onChange={change('role')}
          >
            <option value="buyer">🛒 Buy products (Buyer)</option>
            <option value="seller">🏪 Sell products (Seller)</option>
          </select>

          <button className="rp-submit" type="submit" disabled={loading || !!success}>
            {loading
              ? <><span className="rp-spinner" /> Creating account…</>
              : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <p className="rp-footer">
          Already have an account?{' '}
          <Link to="/login" className="rp-link">Login here</Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;
