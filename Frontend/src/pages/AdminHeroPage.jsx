import React, { useEffect, useState } from 'react';
import { getHeroConfig, updateHeroConfig } from '../services/api';
import './AdminPages.css';

const AdminHeroPage = () => {
  const [heroForm, setHeroForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await getHeroConfig();
      setHeroForm(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    await updateHeroConfig(heroForm);
    setSaving(false);
    alert('Hero settings saved successfully!');
  };

  const addImage = () => {
    if (!newImage.trim()) return;
    setHeroForm(prev => ({ ...prev, images: [...(prev.images || []), newImage] }));
    setNewImage('');
  };

  const removeImage = (index) => {
    setHeroForm(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  if (loading) return <div className="admin-loading">Loading hero settings...</div>;

  return (
    <div className="admin-page admin-hero-page">
      <div className="admin-header">
        <h1 className="admin-title">Manage Hero Slider</h1>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr', maxWidth: 800 }}>
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>Hero Images (Carousel)</h2>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input 
              type="text" 
              className="form-input" 
              value={newImage} 
              onChange={e => setNewImage(e.target.value)} 
              placeholder="Enter image URL" 
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={addImage}>Add Image</button>
          </div>

          {(!heroForm.images || heroForm.images.length === 0) ? (
            <p style={{ color: 'var(--text-2)' }}>No images added. Homepage will show default text hero.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {heroForm.images.map((img, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-2)', padding: 12, borderRadius: 'var(--radius)' }}>
                  <img src={img} alt={`Hero ${idx}`} style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                  <span style={{ flex: 1, wordBreak: 'break-all', fontSize: 13, color: 'var(--text)' }}>{img}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => removeImage(idx)} style={{ color: 'var(--red)' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeroPage;
