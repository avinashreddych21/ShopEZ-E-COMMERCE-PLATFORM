import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, getBanners, getHeroConfig } from '../services/api';

import './HomePage.css';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [heroConfig, setHeroConfig] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, bannerData, heroData] = await Promise.all([
          getProducts(),
          getBanners(),
          getHeroConfig()
        ]);
        setProducts(productData);
        setBanners(bannerData);
        setHeroConfig(heroData);
      } finally {
        setLoading(false);
        setBannersLoading(false);
      }
    };

    loadData();

    const handleHeroUpdate = async () => {
      const heroData = await getHeroConfig();
      setHeroConfig(heroData);
    };
    window.addEventListener('heroConfigUpdated', handleHeroUpdate);
    return () => window.removeEventListener('heroConfigUpdated', handleHeroUpdate);
  }, []);

  useEffect(() => {
    if (!heroConfig?.images?.length || heroConfig.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroConfig.images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroConfig?.images]);

  const nextSlide = () => {
    if (heroConfig?.images?.length) {
      setCurrentSlide(prev => (prev + 1) % heroConfig.images.length);
    }
  };

  const prevSlide = () => {
    if (heroConfig?.images?.length) {
      setCurrentSlide(prev => (prev === 0 ? heroConfig.images.length - 1 : prev - 1));
    }
  };

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    return ['All', ...dynamic];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return [...products]
      .filter((product) => category === 'All' || product.category === category)
      .filter((product) => {
        if (!normalizedSearch) return true;
        const haystack = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
  }, [products, category, search, sort]);

  const imageBanners = banners.filter((banner) => banner.type === 'image');
  const productBanners = banners.filter((banner) => banner.type === 'products');

  const validImages = (heroConfig?.images || []).filter(img => img && img.trim() !== '');
  const hasImages = validImages.length > 0;

  return (
    <div className="page">
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-inner">
            <span className="hero-eyebrow">New arrivals every week</span>
            <h1 className="hero-title">
              Shop Smart, Shop <span className="hero-title--accent">Easy</span>
            </h1>
            <p className="hero-desc" style={{ marginBottom: '32px' }}>
              Discover premium products curated just for you, from electronics to lifestyle essentials.
            </p>

            <div className="hero-search-wrap glass-search-wrap" style={{ margin: '0 auto', width: '100%', maxWidth: '640px' }}>
              <svg className="hero-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="hero-search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="banners-section container fade-up">
        {bannersLoading ? (
          <div className="banners-loading">
            <div className="spinner" style={{ margin: '40px auto' }} />
          </div>
        ) : (
          imageBanners.length > 0 && (
            <div className="banners-grid">
              {imageBanners.map((banner) => (
                <div
                  key={banner.id}
                  className={`banner-card ${banner.size === 'full-width' ? 'banner-card--full-width' : ''}`}
                  onClick={() => setSelectedImage(banner.image)}
                  style={{ height: banner.scale ? `${240 * (banner.scale / 100)}px` : undefined }}
                >
                  <img src={banner.image} alt={banner.title || 'Banner'} className="banner-img" />
                  {banner.title && (
                    <div className="banner-overlay">
                      <h3 className="banner-title">{banner.title}</h3>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </section>

      {!bannersLoading && productBanners.length > 0 && (
        <section className="trending-section container fade-up">
          {productBanners.map((banner) => {
            const bannerProducts = products.filter((product) => (banner.productIds || []).includes(product.id));
            if (bannerProducts.length === 0) return null;

            return (
              <div key={banner.id} className="banner-showcase-fullwidth" style={{ position: 'relative' }}>
                <h3 className="banner-showcase-fullwidth-title">{banner.title}</h3>
                <div className="banner-showcase-scroll">
                  {bannerProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              </div>
            );
          })}
        </section>
      )}
      <section className="products-section container">
        <div className="products-toolbar">
          <div className="category-tabs">
            {categories.map((item) => (
              <button
                key={item}
                className={`cat-tab ${category === item ? 'cat-tab--active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="toolbar-right">
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>

        {!loading && <p className="products-count">Showing <strong>{filteredProducts.length}</strong> products</p>}

        {loading ? (
          <div className="products-loading">
            {Array(8).fill(0).map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid fade-up">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" role="img" aria-label="Search">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search term or category.</p>
            <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => { setSearch(''); setCategory('All'); }}>
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {selectedImage && (
        <div className="banner-lightbox" onClick={() => setSelectedImage(null)}>
          <button className="banner-lightbox-close" onClick={() => setSelectedImage(null)}>&times;</button>
          <img
            src={selectedImage}
            alt="Expanded banner"
            className="banner-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
