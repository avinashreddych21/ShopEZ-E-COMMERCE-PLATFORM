import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { updateAdminDetails } from '../services/api';
import './AdminPages.css';

const AdminSettingsPage = () => {
  const { admin } = useAuth();
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const dataToUpdate = { name: formData.name, email: formData.email };
    if (formData.password) {
      dataToUpdate.password = formData.password;
    }

    const res = await updateAdminDetails(admin.id, dataToUpdate);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      setFormData(prev => ({ ...prev, password: '' })); // Clear password field
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update settings.' });
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Settings</h1>
            <p className="admin-page-sub">Manage your admin profile and preferences</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard"   className="admin-tab">Overview</Link>
            <Link to="/admin/products"    className="admin-tab">Products</Link>
            <Link to="/admin/add-product" className="admin-tab">Add Product</Link>
            <Link to="/admin/orders"      className="admin-tab">Orders</Link>
            <Link to="/admin/analytics"   className="admin-tab">Analytics</Link>
          </div>
        </div>

        <div className="admin-panel" style={{ maxWidth: '600px' }}>
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">Profile Information</h2>
          </div>

          <div style={{ padding: '24px' }}>
            {message.text && (
              <div className={`badge ${message.type === 'success' ? 'badge-green' : 'badge-red'}`} style={{ marginBottom: '20px', padding: '10px 15px', display: 'block', fontSize: '14px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-input" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-input" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  name="password"
                  className="form-input" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
