import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAdmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './AuthPages.css';

const AdminRegisterPage = () => {
  const { handleAdminRegister } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  };
  const s = strength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][s];
  const strengthColor = ['', '#C81D2A', '#D4AF37', '#0B1F4A', '#D4AF37'][s];

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const res = await registerAdmin({ name: form.name, email: form.email, password: form.password });
    setLoading(false);
    if (res.success) { handleAdminRegister(res.admin); navigate('/admin/dashboard'); }
    else setError(res.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-icon" style={{ boxShadow: '0 8px 24px rgba(30,41,59,0.3)' }}>
          <img src={logo} alt="Logo" />
        </div>

        <h1 className="auth-title">Admin Registration</h1>
        <p className="auth-sub">Create an account for the <span className="auth-brand">ShopEZ</span> Admin Panel</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className="form-input"
              placeholder="Admin Name" value={form.name} onChange={onChange} autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" className="form-input"
              placeholder="admin@shopez.com" value={form.email} onChange={onChange} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="form-input"
              placeholder="Min. 6 characters" value={form.password} onChange={onChange} autoComplete="new-password" />
            {form.password && (
              <div className="strength-row">
                <div className="strength-bars">
                  {[1,2,3,4].map(l => (
                    <div key={l} className="strength-bar" style={{ background: l <= s ? strengthColor : 'var(--border-2)' }} />
                  ))}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input id="confirm" name="confirm" type="password" className="form-input"
              placeholder="Repeat password" value={form.confirm} onChange={onChange} autoComplete="new-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Creating account…</> : 'Register Admin'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an admin account? <Link to="/admin" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
