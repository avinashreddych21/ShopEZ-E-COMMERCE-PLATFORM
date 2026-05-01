import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts, formatPrice } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const products = await getProducts();
        const foundProduct = products.find(p => String(p.id) === String(id));
        setProduct(foundProduct || null);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="page container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page container" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h3>Product Not Found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
          Back to Store
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    // Optionally show a toast or notification
    alert('Added to cart!');
  };

  return (
    <div className="page container" style={{ paddingTop: '40px' }}>
      <div className="product-details-layout fade-up">
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-details-img" />
        </div>
        <div className="product-info-container">
          {product.badge && <span className="badge">{product.badge}</span>}
          <h1 className="product-details-title">{product.name}</h1>
          <div className="product-details-rating">
            <span className="rating-value">★ {product.rating}</span>
            <span className="review-count">({product.reviews} reviews)</span>
          </div>
          <div className="product-details-price">
            {product.salePrice ? (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-3)', fontSize: '1.5rem', marginRight: 12 }}>
                  {formatPrice(product.price)}
                </span>
                {formatPrice(product.salePrice)}
              </>
            ) : (
              formatPrice(product.price)
            )}
          </div>
          <p className="product-details-desc">{product.description}</p>
          <div className="product-details-status" style={{ color: product.inStock ? 'var(--green)' : 'var(--red)' }}>
            {product.inStock ? 'In Stock - Ready to Ship' : 'Out of Stock'}
          </div>
          <div className="product-details-actions">
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '16px' }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
