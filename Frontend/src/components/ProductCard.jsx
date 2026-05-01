import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';
import './ProductCard.css';

const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#F2E8DC" />
    <rect x="72" y="72" width="656" height="456" rx="32" fill="#ffffff" />
    <text x="110" y="280" fill="#0B1F4A" font-family="Segoe UI, Arial, sans-serif" font-size="48" font-weight="700">ShopEZ Product</text>
    <text x="110" y="340" fill="#5B6472" font-family="Segoe UI, Arial, sans-serif" font-size="26">Image unavailable</text>
  </svg>
`);

const Stars = ({ rating }) => {
  const safeRating = Number(rating) || 0;
  const full = Math.floor(safeRating);
  const half = safeRating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="stars">
      {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className="star star--full">★</span>)}
      {half && <span className="star star--half">★</span>}
      {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className="star star--empty">☆</span>)}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const price = useMemo(() => Number(product.price) || 0, [product.price]);
  const salePrice = useMemo(() => {
    const parsed = Number(product.salePrice);
    return Number.isFinite(parsed) && parsed > 0 && parsed < price ? parsed : null;
  }, [product.salePrice, price]);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <div
        className="product-card__img-wrap"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={imageError ? FALLBACK_IMAGE : product.image}
          alt={product.name}
          className="product-card__img"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        {salePrice && !product.badge && <span className="product-card__badge" style={{ backgroundColor: 'var(--red)' }}>Sale</span>}
        {!product.inStock && <div className="product-card__out">Out of Stock</div>}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>
          {product.name}
        </h3>
        {product.description && <p className="product-card__desc">{product.description}</p>}

        <div className="product-card__rating">
          <Stars rating={product.rating} />
          <span className="product-card__reviews">{(Number(product.rating) || 0).toFixed(1)} ({Number(product.reviews || 0).toLocaleString()})</span>
        </div>

        <div className="product-card__footer">
          {salePrice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="product-card__price" style={{ color: 'var(--red)', fontSize: '18px' }}>{formatPrice(salePrice)}</span>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-3)', fontSize: '12px' }}>{formatPrice(price)}</span>
            </div>
          ) : (
            <span className="product-card__price">{formatPrice(price)}</span>
          )}
          <button
            className={`btn btn-primary btn-sm product-card__btn ${added ? 'btn--added' : ''}`}
            onClick={handleAdd}
            disabled={!product.inStock || added}
          >
            {added ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
