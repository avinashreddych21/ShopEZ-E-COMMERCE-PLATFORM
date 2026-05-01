import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './AuthPages.css';

const AdminLoginPage = () => {
  const { handleAdminLogin } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const res = await loginAdmin(form);
    setLoading(false);
    if (res.success) { handleAdminLogin(res.admin); navigate('/admin/dashboard'); }
    else setError(res.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-icon" style={{ boxShadow: '0 8px 24px rgba(30,41,59,0.3)' }}>
          <img src={logo} alt="Logo" />
        </div>

        <h1 className="auth-title">Admin Access</h1>
        <p className="auth-sub">Sign in to the <span className="auth-brand">ShopEZ</span> Admin Panel</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Admin Email</label>
            <input id="email" name="email" type="email" className="form-input"
              placeholder="admin@shopez.com" value={form.email} onChange={onChange} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="form-input"
              placeholder="••••••••" value={form.password} onChange={onChange} autoComplete="current-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Signing in…</> : 'Access Admin Panel'}
          </button>
        </form>

        <p className="auth-footer">
          Need an admin account? <a href="/admin/register" className="auth-link">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
