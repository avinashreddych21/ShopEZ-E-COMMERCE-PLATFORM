import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { addProduct } from '../services/api';
import './AdminPages.css';

const CATEGORIES = ['Electronics', 'Accessories', 'Footwear', 'Lifestyle', 'Furniture', 'Storage', 'Other'];

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: '', price: '', originalPrice: '',
    description: '', badge: '', image: '', inStock: true,
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error,   setError]     = useState('');

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError(''); setSuccess('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) { setError('Name, category and price are required.'); return; }
    setLoading(true);
    await addProduct({
      ...form,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
    });
    setLoading(false);
    setSuccess(`"${form.name}" has been added to your catalog!`);
    setForm({ name:'', category:'', price:'', originalPrice:'', description:'', badge:'', image:'', inStock:true });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Add Product</h1>
            <p className="admin-page-sub">Add a new product to your store</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard"   className="admin-tab">Overview</Link>
            <Link to="/admin/products"    className="admin-tab">Products</Link>
            <Link to="/admin/add-product" className="admin-tab admin-tab--active">Add Product</Link>
            <Link to="/admin/orders"      className="admin-tab">Orders</Link>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">New Product Details</h2>
          </div>
          <div className="add-product-body">
            {success && <div className="alert alert-success">✓ {success}</div>}
            {error   && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={onSubmit} className="add-product-form" noValidate>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Product Name *</label>
                  <input id="name" name="name" className="form-input" placeholder="e.g. Wireless Headphones"
                    value={form.name} onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category *</label>
                  <select id="category" name="category" className="form-input" value={form.category} onChange={onChange} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Price (₹) *</label>
                  <input id="price" name="price" type="number" min="0" step="0.01" className="form-input"
                    placeholder="0.00" value={form.price} onChange={onChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="originalPrice">Original Price (₹) <span style={{color:'var(--text-3)',fontWeight:400}}>(optional — for discount badge)</span></label>
                  <input id="originalPrice" name="originalPrice" type="number" min="0" step="0.01" className="form-input"
                    placeholder="Leave blank if no discount" value={form.originalPrice} onChange={onChange} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea id="description" name="description" className="form-input" rows={3}
                    placeholder="Brief product description..." value={form.description} onChange={onChange}
                    style={{ resize:'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="image">Image URL</label>
                  <input id="image" name="image" type="url" className="form-input"
                    placeholder="https://... (leave blank for placeholder)" value={form.image} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="badge">Badge</label>
                  <select id="badge" name="badge" className="form-input" value={form.badge} onChange={onChange}>
                    <option value="">None</option>
                    {['New','Sale','Best Seller','Popular'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group form-group--check">
                  <label className="check-label">
                    <input type="checkbox" name="inStock" checked={form.inStock} onChange={onChange} />
                    <span>Mark as In Stock</span>
                  </label>
                </div>
              </div>

              <div className="add-product-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="btn-spinner" /> Adding…</> : <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Product
                  </>}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
                  View All Products
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAddProductPage;
