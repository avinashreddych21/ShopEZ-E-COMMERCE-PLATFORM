import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const shipping = cartSubtotal >= 10000 ? 0 : cartSubtotal > 0 ? 100 : 0;
  const tax = cartSubtotal * 0.18; // 18% GST approx
  const total = cartSubtotal + shipping + tax;

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState('');

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.pincode) {
      setError('Please fill in all address fields.');
      return;
    }
    
    if (paymentMethod === 'UPI') {
      setShowUpiModal(true);
    } else {
      setLoading(true);
      setError('');
      try {
        const orderItems = cartItems.map(i => ({ id: i.id || i._id, name: i.name, qty: i.qty, price: i.price, image: i.image, createdBy: i.createdBy }));
        const res = await placeOrder({ 
          items: orderItems, 
          total, 
          address: form,
          paymentMethod: 'COD'
        });
        setLoading(false);
        
        if (res && res.success) {
          clearCart();
          navigate('/cart', { state: { successOrder: res.order } });
        } else {
          setError(`Failed: ${res?.error || 'Check connection'}`);
        }
      } catch (err) {
        setLoading(false);
        setError(`Unexpected error: ${err.message}`);
      }
    }
  };

  const handleUpiSubmit = async () => {
    if (!upiTransactionId.trim()) {
      alert("Please enter the Transaction ID / UTR number.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderItems = cartItems.map(i => ({ id: i.id || i._id, name: i.name, qty: i.qty, price: i.price, image: i.image, createdBy: i.createdBy }));
      const res = await placeOrder({ 
        items: orderItems, 
        total, 
        address: form,
        paymentMethod: 'UPI',
        paymentId: upiTransactionId
      });
      setLoading(false);
      setShowUpiModal(false);
      if (res && res.success) {
        clearCart();
        navigate('/cart', { state: { successOrder: res.order } });
      } else {
        setError(`UPI Failed: ${res?.error || 'Check connection'}`);
      }
    } catch (err) {
      setLoading(false);
      setShowUpiModal(false);
      setError(`Unexpected error: ${err.message}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 100 }}>
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-layout fade-up">
          <div className="checkout-form-section">
            <div className="card">
              <h2 className="summary-title">Delivery Address</h2>
              {error && <div className="alert alert-error">{error}</div>}
              <form className="auth-form" onSubmit={handleConfirmOrder}>
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <input id="fullName" name="fullName" type="text" className="form-input" value={form.fullName} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input id="phone" name="phone" type="text" className="form-input" value={form.phone} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="street">Street Address</label>
                  <input id="street" name="street" type="text" className="form-input" value={form.street} onChange={onChange} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="city">City</label>
                    <input id="city" name="city" type="text" className="form-input" value={form.city} onChange={onChange} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="state">State</label>
                    <input id="state" name="state" type="text" className="form-input" value={form.state} onChange={onChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">Pincode</label>
                  <input id="pincode" name="pincode" type="text" className="form-input" value={form.pincode} onChange={onChange} />
                </div>

                <div className="form-group" style={{ marginTop: '16px', borderTop: '1px solid var(--border-1)', paddingTop: '16px' }}>
                  <label className="form-label">Payment Method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <span style={{ fontWeight: 500 }}>Cash on Delivery (COD)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <span style={{ fontWeight: 500 }}>UPI Transfer (QR Code)</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 24 }} disabled={loading}>
                  {loading ? <><span className="btn-spinner" /> Processing…</> : 'Confirm Order'}
                </button>
              </form>
            </div>
          </div>

          <aside className="cart-summary">
            <div className="card">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Items ({cartItems.length})</span>
                  <span>₹{cartSubtotal.toFixed(0)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green' : ''}>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(0)}`}</span>
                </div>
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
            </div>
            
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Items in Order</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-2)' }}>{item.qty}x {item.name}</span>
                    <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showUpiModal && (
        <div className="upi-modal-overlay">
          <div className="upi-modal fade-up">
            <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--text-1)' }}>Complete UPI Payment</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: '16px' }}>Scan the QR Code below using any UPI app to pay <strong>₹{total.toFixed(0)}</strong></p>
            <div className="upi-qr-container">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=8446556759@ybl&pn=ShopEZ&am=${total.toFixed(2)}`} alt="UPI QR Code" />
            </div>
            <p style={{ color: 'var(--text-2)', marginTop: '16px' }}>Or send directly to UPI ID:<br/><strong style={{ color: 'var(--blue)', fontSize: '16px' }}>8446556759@ybl</strong></p>
            
            <div className="form-group" style={{ marginTop: '24px', textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Transaction / UTR Number *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter 12-digit transaction ID" 
                value={upiTransactionId}
                onChange={e => setUpiTransactionId(e.target.value)}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>Please enter the reference number after successful payment to verify your order.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowUpiModal(false)} disabled={loading}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleUpiSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
