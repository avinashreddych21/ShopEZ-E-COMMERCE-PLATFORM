import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './AuthPages.css';

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const res = await loginUser(form);
    setLoading(false);

    if (res.success) {
      handleLogin(res.user);
      navigate(from, { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-icon">
          <img src={logo} alt="Logo" />
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your <span className="auth-brand">ShopEZ</span> account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <div className="pwd-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((prev) => !prev)} tabIndex={-1}>
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register" className="auth-link">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
