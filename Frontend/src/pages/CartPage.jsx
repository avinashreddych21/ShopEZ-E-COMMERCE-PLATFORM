import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQty, cartSubtotal } = useCart();
  const { isLoggedIn } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const successOrder = location.state?.successOrder || null;

  const shipping = cartSubtotal >= 10000 ? 0 : cartSubtotal > 0 ? 100 : 0;
  const tax      = cartSubtotal * 0.18;
  const total    = cartSubtotal + shipping + tax;

  const handleCheckout = () => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/checkout' } }); return; }
    navigate('/checkout');
  };

  /* ── Success State ── */
  if (successOrder) {
    return (
      <div className="page">
        <div className="container">
          <div className="checkout-success fade-up">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order <strong>{successOrder.id}</strong> has been received and is being processed.</p>
            <div className="success-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/orders')}>View My Orders</button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/')}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  /* ── Empty Cart ── */
  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 100 }}>
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any items yet.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="cart-header fade-up">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39A2 2 0 009.66 16h9.69a2 2 0 001.97-1.67L23 6H6"/></svg>
          <h1 className="page-title">Shopping Cart</h1>
          <span className="badge badge-blue">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="cart-layout fade-up">
          {/* Items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item__img" />
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.name}</h3>
                  <span className="badge badge-gray cart-item__cat">{item.category}</span>
                  <p className="cart-item__price">₹{item.price.toFixed(0)}</p>
                </div>
                <div className="cart-item__controls">
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <span className="cart-item__sub">= ₹{(item.price * item.qty).toFixed(0)}</span>
                  <button className="cart-item__del" onClick={() => removeFromCart(item.id)} aria-label="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="cart-summary">
            <div className="card">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toFixed(0)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green' : ''}>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(0)}`}</span>
                </div>
                {shipping === 0 && cartSubtotal > 0 && (
                  <p className="free-shipping-note">✓ Free shipping on orders over ₹10,000</p>
                )}
                <div className="summary-row">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
              </div>
              <div className="divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span className="total-price">₹{total.toFixed(0)}</span>
              </div>

              <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 16 }} onClick={handleCheckout}>
                Checkout →
              </button>
              <Link to="/" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>Continue Shopping</Link>

              {!isLoggedIn && (
                <p className="login-note">You'll be asked to log in before checkout.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
