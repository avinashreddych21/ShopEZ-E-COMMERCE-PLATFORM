import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { addBanner, deleteBanner, getBanners, getProducts, updateBanner } from '../services/api';
import { compressImage } from '../utils/imageUtils';
import './AdminPages.css';

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [formData, setFormData] = useState({ type: 'image', image: '', title: '', link: '', productIds: [], size: 'default' });
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchPageData = async () => {
    setLoading(true);
    const [bannerData, productData] = await Promise.all([getBanners(), getProducts()]);
    setBanners(bannerData);
    setAllProducts(productData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const handleInputChange = (e) => {
    setError('');
    if (e.target.name === 'productIds') {
      const selected = Array.from(e.target.options)
        .filter((option) => option.selected)
        .map((option) => Number(option.value));
      setFormData((prev) => ({ ...prev, productIds: selected }));
      return;
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.type === 'image' && !formData.image.trim()) {
      setError('Please add a banner image.');
      return;
    }

    if (formData.type === 'products' && (!formData.title.trim() || formData.productIds.length === 0)) {
      setError('Please enter a title and select at least one product.');
      return;
    }

    setIsAdding(true);
    let result;
    if (editingBannerId) {
      result = await updateBanner(editingBannerId, {
        type: formData.type,
        image: formData.type === 'image' ? formData.image : '',
        title: formData.title,
        link: formData.link || '/',
        productIds: formData.type === 'products' ? formData.productIds : [],
        size: formData.type === 'image' ? formData.size : 'default',
      });
    } else {
      result = await addBanner({
        type: formData.type,
        image: formData.type === 'image' ? formData.image : '',
        title: formData.title,
        link: formData.link || '/',
        productIds: formData.type === 'products' ? formData.productIds : [],
        size: formData.type === 'image' ? formData.size : 'default',
      });
    }
    setIsAdding(false);

    if (!result.success) {
      setError(result.error || (editingBannerId ? 'Failed to update banner.' : 'Failed to add banner.'));
      return;
    }

    setFormData({ type: 'image', image: '', title: '', link: '', productIds: [], size: 'default', scale: 100 });
    setEditingBannerId(null);
    fetchPageData();
  };

  const handleEdit = (banner) => {
    setFormData({
      type: banner.type,
      image: banner.image || '',
      title: banner.title || '',
      link: banner.link || '',
      productIds: banner.productIds || [],
      size: banner.size || 'default',
      scale: banner.scale || 100,
    });
    setEditingBannerId(banner.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    await deleteBanner(id);
    fetchPageData();
  };



  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Banners</h1>
            <p className="admin-page-sub">Manage homepage banner images</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard" className="admin-tab">Overview</Link>
            <Link to="/admin/products" className="admin-tab">Products</Link>
            <Link to="/admin/add-product" className="admin-tab">Add Product</Link>
            <Link to="/admin/orders" className="admin-tab">Orders</Link>
            <Link to="/admin/analytics" className="admin-tab">Analytics</Link>
          </div>
        </div>


        <div className="admin-panel" style={{ marginBottom: '32px' }}>
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">{editingBannerId ? 'Edit Banner' : 'Add New Banner'}</h2>
          </div>
          <div style={{ padding: '24px' }}>
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Banner Type</label>
                <select name="type" className="form-input" value={formData.type} onChange={handleInputChange}>
                  <option value="image">Image Banner</option>
                  <option value="products">Product Showcase</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Title {formData.type === 'image' && '(Optional)'}</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder={formData.type === 'image' ? 'Summer Sale' : 'Top Picks for You'}
                  value={formData.title}
                  onChange={handleInputChange}
                  required={formData.type === 'products'}
                />
              </div>

              {formData.type === 'image' && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Banner Size</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <select name="size" className="form-input" value={formData.size} onChange={handleInputChange} style={{ flex: 1 }}>
                        <option value="default">Default Grid</option>
                        <option value="full-width">Full Width</option>
                      </select>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Scale (%)</label>
                        <input type="number" name="scale" className="form-input" value={formData.scale} onChange={handleInputChange} min="50" max="100" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Image URL or Upload File</label>
                    <input
                      type="text"
                      name="image"
                      className="form-input"
                      placeholder="Paste image URL"
                      value={formData.image}
                      onChange={handleInputChange}
                      style={{ marginBottom: '8px' }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          const compressed = await compressImage(file);
                          setFormData((prev) => ({ ...prev, image: compressed }));
                        } catch {
                          setError('Failed to process image.');
                        }
                      }}
                    />
                  </div>
                </>
              )}

              {formData.type === 'products' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Products</label>
                  <div style={{ height: '200px', overflowY: 'auto', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allProducts.map((product) => (
                      <label key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, productIds: [...prev.productIds, product.id] }));
                            } else {
                              setFormData(prev => ({ ...prev, productIds: prev.productIds.filter(id => id !== product.id) }));
                            }
                          }}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--text)' }}>{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={isAdding}>
                  {isAdding ? (editingBannerId ? 'Saving...' : 'Adding...') : (editingBannerId ? 'Save Changes' : 'Add Banner')}
                </button>
                {editingBannerId && (
                  <button type="button" className="btn btn-outline" onClick={() => {
                    setEditingBannerId(null);
                    setFormData({ type: 'image', image: '', title: '', link: '', productIds: [], size: 'default' });
                    setError('');
                  }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">
              Current Banners
              <span className="badge badge-blue" style={{ marginLeft: 10 }}>{banners.length}</span>
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : banners.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>No banners found. Add one above.</div>
          ) : (
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {banners.map((banner) => (
                <div key={banner.id} style={{ border: '1px solid var(--border-2)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--white)' }}>
                  <div style={{ height: '150px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {banner.type === 'products'
                      ? <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--blue)' }}>{banner.title}</span>
                      : <img src={banner.image} alt={banner.title || 'Banner'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>{banner.title || 'Untitled Banner'}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Type: {banner.type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(banner)} style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>
                        Edit
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(banner.id)} style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBannersPage;
