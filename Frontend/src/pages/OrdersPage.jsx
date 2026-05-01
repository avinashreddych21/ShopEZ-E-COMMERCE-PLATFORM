import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useOrders } from '../context/OrderContext';
import { formatPrice } from '../services/api';
import './OrdersPage.css';

const STATUS = {
  Delivered: { badge: 'badge-green' },
  Shipped: { badge: 'badge-gray' },
  'Out for delivery': { badge: 'badge-purple' },
  Processing: { badge: 'badge-amber' },
  Cancelled: { badge: 'badge-red' },
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const OrdersPage = () => {
  const { orders, ordersLoading, cancelOrder } = useOrders();
  const [expanded, setExpanded] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const counts = Object.keys(STATUS).reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status).length;
    return acc;
  }, {});

  const downloadInvoice = (order) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Header
      pdf.setTextColor(37, 99, 235); // Blue
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ShopEZ', margin, y);
      
      pdf.setTextColor(0, 0, 0); // Black
      pdf.setFontSize(16);
      pdf.text('INVOICE', pageWidth - margin, y, { align: 'right' });

      y += 8;
      pdf.setTextColor(100, 100, 100); // Grey
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Your Ultimate E-commerce Partner', margin, y);
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Order ID: ${order.id}`, pageWidth - margin, y, { align: 'right' });
      
      y += 6;
      pdf.text(`Date: ${fmtDate(order.date)}`, pageWidth - margin, y, { align: 'right' });

      y += 10;
      // Divider
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 15;

      // Billed To / Payment Details
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Billed To:', margin, y);
      pdf.text('Payment Details:', pageWidth - margin, y, { align: 'right' });

      y += 8;
      pdf.setTextColor(0, 0, 0);
      pdf.text(order.address?.fullName || order.address?.name || 'Customer', margin, y);
      pdf.text(`Method: ${order.paymentMethod || 'Cash on Delivery'}`, pageWidth - margin, y, { align: 'right' });

      y += 6;
      pdf.setFont('helvetica', 'normal');
      if (order.address) {
        pdf.text(order.address.street || '', margin, y);
        y += 6;
        pdf.text(`${order.address.city || ''}, ${order.address.state || ''} ${order.address.pincode || ''}`.trim(), margin, y);
        y += 6;
        pdf.text(`Phone: ${order.address.phone || ''}`, margin, y);
      }

      y += 15;

      // Table Header
      pdf.setFillColor(248, 249, 250); // Light grey background
      pdf.rect(margin, y - 6, pageWidth - (margin * 2), 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Item', margin + 3, y);
      pdf.text('Qty', pageWidth - 70, y, { align: 'center' });
      pdf.text('Price', pageWidth - 45, y, { align: 'center' });
      pdf.text('Total', pageWidth - margin - 3, y, { align: 'right' });
      
      y += 10;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      order.items.forEach((item) => {
        const itemTotal = Number(item.price || 0) * Number(item.qty || 0);
        
        pdf.text(item.name || 'Product', margin + 3, y);
        pdf.text(`${item.qty}`, pageWidth - 70, y, { align: 'center' });
        pdf.text(`Rs. ${item.price || 0}`, pageWidth - 45, y, { align: 'center' });
        pdf.text(`Rs. ${itemTotal}`, pageWidth - margin - 3, y, { align: 'right' });
        
        y += 4;
        pdf.setDrawColor(240, 240, 240);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 8;
      });

      // Totals
      y += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Grand Total:', pageWidth - 60, y, { align: 'right' });
      pdf.setTextColor(37, 99, 235); // Blue
      pdf.text(`Rs. ${order.total}`, pageWidth - margin - 3, y, { align: 'right' });

      pdf.save(`Invoice_${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      window.alert('Unable to generate invoice right now.');
    }
  };

  if (ordersLoading) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 60, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 100 }}>
            <div className="empty-icon" role="img" aria-label="Package">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here once you make a purchase.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="orders-hdr fade-up">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-sub">Track and manage your purchases</p>
          </div>
        </div>

        <div className="orders-stat-grid fade-up">
          {Object.entries(STATUS).map(([status, meta]) => (
            <div key={status} className="orders-stat-card">
              <span className={`badge ${meta.badge}`}>{status}</span>
              <div className="orders-stat-count">{counts[status] || 0}</div>
            </div>
          ))}
        </div>

        <div className="orders-list fade-up">
          {orders.map((order) => {
            const statusConfig = STATUS[order.status] || STATUS.Processing;
            const open = expanded === order.id;

            return (
              <div key={order.id} className={`order-card ${open ? 'order-card--open' : ''}`}>
                <div
                  className="order-card__row"
                  onClick={() => toggle(order.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggle(order.id)}
                >
                  <div className="order-card__left">
                    <div className="order-card__id">{order.id}</div>
                    <div className="order-card__date">{fmtDate(order.date)}</div>
                  </div>
                  <div className="order-card__mid">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                  <div className="order-card__right">
                    <span className="order-card__total">{formatPrice(order.total)}</span>
                    <span className={`badge ${statusConfig.badge}`}>{order.status}</span>
                  </div>
                </div>

                {open && (
                  <div className="order-card__details">
                    <div className="order-items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-line">
                          {item.image && <img src={item.image} alt={item.name} className="order-line__img" />}
                          <span className="order-line__name">{item.name}</span>
                          <span className="order-line__qty">x{item.qty}</span>
                          <span className="order-line__price">{formatPrice((item.price || 0) * (item.qty || 0))}</span>
                        </div>
                      ))}
                      <div className="order-summary-row">
                        <span>Total Paid</span>
                        <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    {order.address && (
                      <div className="order-details-right" style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-1)', marginTop: '16px' }}>
                        <h4 style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--text-2)' }}>Delivery Address</h4>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                          <strong>{order.address.fullName || order.address.name}</strong><br />
                          {order.address.street}<br />
                          {order.address.city}, {order.address.state} {order.address.pincode}<br />
                          Phone: {order.address.phone}
                        </p>
                      </div>
                    )}

                    <div className="order-card__actions">
                      {order.status === 'Processing' && (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this order?')) {
                              cancelOrder(order.id);
                            }
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => setTrackingOrder(order)}>Track Order</button>
                      {order.status === 'Delivered' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => downloadInvoice(order)}>Download Invoice</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {trackingOrder && (
        <div className="modal-backdrop">
          <div className="modal-content fade-up" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Track Order {trackingOrder.id}</h2>
              <button className="btn btn-ghost" style={{ padding: '5px' }} onClick={() => setTrackingOrder(null)}>X</button>
            </div>

            <div className="tracking-timeline">
              {['Processing', 'Shipped', 'Out for delivery', 'Delivered'].map((step, index) => {
                const orderDate = new Date(trackingOrder.createdAt || trackingOrder.date);
                const stepDate = new Date(orderDate.getTime() + (index * 2 * 24 * 60 * 60 * 1000));
                const statuses = ['Processing', 'Shipped', 'Out for delivery', 'Delivered'];
                const currentStatusIndex = statuses.indexOf(trackingOrder.status === 'Cancelled' ? 'Processing' : trackingOrder.status);
                const isCompleted = index <= currentStatusIndex && trackingOrder.status !== 'Cancelled';

                return (
                  <div key={step} className={`tracking-step ${isCompleted ? 'completed' : ''}`} style={{ display: 'flex', marginBottom: '20px', position: 'relative' }}>
                    {index < 3 && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-20px', width: '2px', background: isCompleted ? 'var(--blue)' : 'var(--border-2)', zIndex: 1 }} />}
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isCompleted ? 'var(--blue)' : 'var(--bg-app)', border: `2px solid ${isCompleted ? 'var(--blue)' : 'var(--border-2)'}`, zIndex: 2, marginRight: '16px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: isCompleted ? 'var(--text-1)' : 'var(--text-3)' }}>{step}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-3)' }}>
                        {isCompleted ? 'Completed' : 'Estimated'}: {fmtDate(stepDate.toISOString())}
                      </p>
                    </div>
                  </div>
                );
              })}

              {trackingOrder.status === 'Cancelled' && <div className="alert alert-error" style={{ marginTop: '20px' }}>This order has been cancelled.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
