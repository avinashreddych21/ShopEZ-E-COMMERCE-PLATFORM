import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { getAllOrders, updateOrderStatus, SOCKET_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './AdminPages.css';

const STATUS_BADGE = { Delivered:'badge-green', Shipped:'badge-gray', 'Out for delivery':'badge-purple', Processing:'badge-amber', Cancelled:'badge-red' };
const ALL_STATUSES = ['Processing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];

const AdminOrdersPage = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState({ name: '', phone: '' });
  const { admin } = useAuth();

  useEffect(() => {
    const fetchAdminOrders = () => {
      getAllOrders().then(data => {
        setOrders(data);
        setLoading(false);
      });
    };

    fetchAdminOrders();

    const socket = io(SOCKET_URL);
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          (order.id === updatedOrder._id || order._id === updatedOrder._id) 
            ? { ...order, status: updatedOrder.status } 
            : order
        )
      );
    });

    socket.on('newOrder', () => {
      fetchAdminOrders();
    });

    return () => socket.disconnect();
  }, [admin]);

  const handleStatusSelect = (orderId, newStatus) => {
    setPendingStatusChange({ orderId, newStatus });
    if (newStatus === 'Out for delivery') {
      setDeliveryDetails({ name: '', phone: '' });
    }
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const { orderId, newStatus } = pendingStatusChange;
    
    if (newStatus === 'Out for delivery') {
      if (!deliveryDetails.name.trim() || !deliveryDetails.phone.trim()) {
        alert("Please provide both the Delivery Person's Name and Phone Number.");
        return;
      }
    }

    setUpdating(orderId);
    setPendingStatusChange(null);
    await updateOrderStatus(orderId, newStatus, deliveryDetails);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdating(null);
    alert(`Email Sent: The customer has been notified that order #${orderId} is now ${newStatus}.`);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Orders</h1>
            <p className="admin-page-sub">Manage and track all customer orders</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard"   className="admin-tab">Overview</Link>
            <Link to="/admin/products"    className="admin-tab">Products</Link>
            <Link to="/admin/add-product" className="admin-tab">Add Product</Link>
            <Link to="/admin/orders"      className="admin-tab admin-tab--active">Orders</Link>
            <Link to="/admin/analytics"   className="admin-tab">Analytics</Link>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">
              All Orders
              <span className="badge badge-blue" style={{ marginLeft:10 }}>{orders.length}</span>
            </h2>
          </div>

          {loading ? (
            <div style={{ padding:40, display:'flex', justifyContent:'center' }}><div className="spinner" /></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>DATE</th>
                    <th>CUSTOMER</th>
                    <th>ITEMS</th>
                    <th>TOTAL</th>
                    <th>PAYMENT</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong style={{ color:'var(--blue)' }}>{o.id}</strong></td>
                      <td style={{ color:'var(--text-2)', fontSize:13 }}>
                        {new Date(o.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
                      </td>
                      <td>
                        <strong style={{ color:'var(--text-1)', fontSize:13 }}>{o.address?.fullName || 'Guest'}</strong>
                      </td>
                      <td style={{ maxWidth:220, fontSize:13, color:'var(--text-2)' }}>
                        <div>{o.items.slice(0,2).map(i => i.name).join(', ')}{o.items.length > 2 ? `… +${o.items.length-2}` : ''}</div>
                        {o.address && (
                          <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                            Deliver to: {o.address.city}, {o.address.state}
                          </div>
                        )}
                      </td>
                      <td><strong>₹{o.total.toFixed(0)}</strong></td>
                      <td style={{ fontSize:13 }}>
                        <div><span className={`badge ${o.paymentMethod === 'UPI' ? 'badge-blue' : 'badge-gray'}`}>{o.paymentMethod || 'COD'}</span></div>
                        {o.paymentMethod === 'UPI' && o.paymentId && (
                          <div style={{ marginTop: '4px', color: 'var(--text-3)', fontSize: '11px' }}>
                            Ref: {o.paymentId}
                          </div>
                        )}
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <select
                            className="form-input"
                            style={{ padding:'5px 10px', fontSize:13, width:140 }}
                            value={o.status}
                            disabled={updating === o.id || o.status === 'Cancelled'}
                            onChange={e => handleStatusSelect(o.id, e.target.value)}
                          >
                            {ALL_STATUSES.map((s, idx) => (
                              <option key={s} value={s} disabled={s !== 'Cancelled' && idx < ALL_STATUSES.indexOf(o.status)}>{s}</option>
                            ))}
                          </select>
                          {updating === o.id && <div className="spinner" style={{ width:16, height:16, borderWidth:2 }} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 2-Step Verification Confirmation Modal */}
      {pendingStatusChange && (
        <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            backdropFilter: 'none'
          }}>
            <h3 style={{ marginTop: 0, color: '#111827' }}>Confirm Status Change</h3>
            <p style={{ color: '#4b5563', fontSize: '15px' }}>
              Are you sure you want to change this order's status to <strong>{pendingStatusChange.newStatus}</strong>?
            </p>

            {pendingStatusChange.newStatus === 'Out for delivery' && (
              <div style={{ marginTop: '16px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-1)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-1)' }}>Delivery Executive Details</h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-2)' }}>Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="E.g., Ramesh" 
                    value={deliveryDetails.name}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-2)' }}>Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="E.g., 9876543210" 
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setPendingStatusChange(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmStatusChange}>Confirm Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
