import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { deleteProduct, getProducts, updateProduct, formatPrice } from '../services/api';
import { compressImage } from '../utils/imageUtils';
import './AdminPages.css';

const CATEGORY_OPTIONS = ['Electronics', 'Accessories', 'Footwear', 'Lifestyle', 'Furniture', 'Storage', 'Other'];

const EMPTY_EDIT_FORM = {
  name: '',
  description: '',
  category: 'Electronics',
  price: '',
  salePrice: '',
  badge: '',
  image: '',
  inStock: true,
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState(EMPTY_EDIT_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const closeModal = () => {
    setEditingProduct(null);
    setEditFormData(EMPTY_EDIT_FORM);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await deleteProduct(id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
    setDeleting(null);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'Electronics',
      price: product.price ?? '',
      salePrice: product.salePrice ?? '',
      badge: product.badge || '',
      image: product.image || '',
      inStock: product.inStock !== false,
    });
  };

  const handleEditChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setEditFormData((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error('Image compression failed', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);

    const dataToUpdate = {
      ...editFormData,
      price: Number(editFormData.price),
      salePrice: editFormData.salePrice ? Number(editFormData.salePrice) : null,
      badge: String(editFormData.badge || '').trim(),
      description: String(editFormData.description || '').trim(),
    };

    const updatedProduct = await updateProduct(editingProduct.id, dataToUpdate);
    if (updatedProduct) {
      setProducts((prev) => prev.map((product) => (product.id === editingProduct.id ? updatedProduct : product)));
    }

    setSavingEdit(false);
    closeModal();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Products</h1>
            <p className="admin-page-sub">Manage your product catalog</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard" className="admin-tab">Overview</Link>
            <Link to="/admin/products" className="admin-tab admin-tab--active">Products</Link>
            <Link to="/admin/add-product" className="admin-tab">Add Product</Link>
            <Link to="/admin/orders" className="admin-tab">Orders</Link>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">
              All Products
              <span className="badge badge-blue" style={{ marginLeft: 10 }}>{products.length}</span>
            </h2>
            <Link to="/admin/add-product" className="btn btn-primary btn-sm">Add Product</Link>
          </div>

          {loading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>IMAGE</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>RATING</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td><img src={product.image} alt={product.name} style={{ width: 48, height: 38, objectFit: 'cover', borderRadius: 6 }} /></td>
                      <td style={{ maxWidth: 220, fontWeight: 500 }}>{product.name}</td>
                      <td><span className="badge badge-gray">{product.category}</span></td>
                      <td>
                        <strong>{formatPrice(product.price)}</strong>
                        {product.salePrice && <span style={{ display: 'block', fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>Sale: {formatPrice(product.salePrice)}</span>}
                      </td>
                      <td>
                        <span className={`badge ${product.inStock ? 'badge-green' : 'badge-red'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>{product.rating > 0 ? `★ ${product.rating}` : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(product)}>Edit</button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={deleting === product.id}
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            {deleting === product.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editingProduct && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="admin-panel" style={{ width: '100%', maxWidth: '560px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="admin-panel-hdr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Edit Product</h3>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ padding: '24px' }}>
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Name</label>
                    <input type="text" name="name" className="form-input" value={editFormData.name} onChange={handleEditChange} required />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <textarea name="description" className="form-input" rows="3" value={editFormData.description} onChange={handleEditChange} />
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Price (₹)</label>
                      <input type="number" name="price" className="form-input" value={editFormData.price} onChange={handleEditChange} required min="0" />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Sale Price (₹)</label>
                      <input type="number" name="salePrice" className="form-input" value={editFormData.salePrice} onChange={handleEditChange} min="0" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Category</label>
                      <select name="category" className="form-input" value={editFormData.category} onChange={handleEditChange}>
                        {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Badge</label>
                      <input type="text" name="badge" className="form-input" value={editFormData.badge} onChange={handleEditChange} placeholder="Optional badge" />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Product Image</label>
                    <input type="file" name="image" accept="image/*" className="form-input" onChange={handleEditImageChange} />
                    {editFormData.image && (
                      <div style={{ marginTop: '10px' }}>
                        <img src={editFormData.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px', border: '1px solid var(--border-2)' }} />
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="inStock" checked={editFormData.inStock} onChange={handleEditChange} id="inStockCheckbox" />
                    <label htmlFor="inStockCheckbox" style={{ fontSize: '14px', cursor: 'pointer' }}>In Stock</label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;
