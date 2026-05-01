import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, deleteUserProfile } from '../services/api';
import './AuthPages.css';

const ProfilePage = () => {
  const { user, handleLogin, handleLogout } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', profilePicture: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', profilePicture: user.profilePicture || '' });
    }
  }, [user]);

  const onChange = e => { 
    setForm(p => ({ ...p, [e.target.name]: e.target.value })); 
    setMessage({ type: '', text: '' }); 
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(p => ({ ...p, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { 
      setMessage({ type: 'error', text: 'Please fill in all fields.' }); 
      return; 
    }
    
    setLoading(true);
    const res = await updateUserProfile(form);
    setLoading(false);
    
    if (res.success) { 
      handleLogin(res.user); 
      setMessage({ type: 'success', text: res.message || 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: res.error });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      const res = await deleteUserProfile();
      setLoading(false);
      if (res.success) {
        handleLogout();
        navigate('/');
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up" style={{ maxWidth: '500px' }}>
        <h1 className="auth-title">My Profile</h1>
        <p className="auth-sub" style={{ marginBottom: '30px' }}>Update your personal information</p>

        {message.text && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: '#e2e8f0', 
                margin: '0 auto 15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--blue)', position: 'relative'
              }}
            >
              {form.profilePicture ? (
                <img src={form.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem', color: '#94a3b8' }}>👤</span>
              )}
            </div>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              Change Picture
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className="form-input"
              value={form.name} onChange={onChange} autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" className="form-input"
              value={form.email} onChange={onChange} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" type="tel" className="form-input"
              value={form.phone} onChange={onChange} autoComplete="tel" />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Saving…</> : 'Save Changes'}
          </button>

          <button 
            type="button" 
            onClick={handleDelete} 
            className="btn btn-full btn-lg" 
            disabled={loading}
            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', marginTop: '10px' }}
          >
            {loading ? 'Processing...' : 'Delete Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
