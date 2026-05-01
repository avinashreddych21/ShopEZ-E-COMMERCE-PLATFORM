import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { getAllOrders, getUsers, SOCKET_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './AdminPages.css';

const STATUS_BADGE = {
  Delivered:  'badge-green',
  Shipped:    'badge-gray',
  Processing: 'badge-amber',
  Cancelled:  'badge-red',
};

const StatCard = ({ icon, label, value, sub, subColor }) => (
  <div className="admin-stat">
    <div className="admin-stat__body">
      <p className="admin-stat__label">{label}</p>
      <p className="admin-stat__value">{value}</p>
      {sub && <p className="admin-stat__sub" style={{ color: subColor || 'var(--green)' }}>{sub}</p>}
    </div>
    <div className="admin-stat__icon">{icon}</div>
  </div>
);

const AdminDashboardPage = () => {
  const { admin } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersCount, setCustomersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, usersData] = await Promise.all([getAllOrders(), getUsers()]);
        const adminOrders = ordersData.filter(order => order.items.some(item => item.createdBy === admin.email));
        setOrders(adminOrders);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

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
      fetchData();
    });

    return () => socket.disconnect();
  }, [admin]);

  const revenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Dashboard Overview</h1>
            <p className="admin-page-sub">Admin Panel · ShopEZ</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard" className="admin-tab admin-tab--active">Overview</Link>
            <Link to="/admin/products"  className="admin-tab">Products</Link>
            <Link to="/admin/add-product" className="admin-tab">Add Product</Link>
            <Link to="/admin/orders"    className="admin-tab">Orders</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid">
          <StatCard
            label="TOTAL REVENUE"
            value={`₹${revenue.toFixed(2)}`}
            sub="↑ 12% this month"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
          />
          <StatCard
            label="TOTAL ORDERS"
            value={orders.length}
            sub={`↑ ${Math.min(orders.length, 3)} new today`}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          />
          <StatCard
            label="PRODUCTS"
            value="8"
            sub="↑ All in stock"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
          />
        </div>

        {/* Recent Orders */}
        <div className="admin-panel">
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">Recent Orders</h2>
            <Link to="/admin/orders" className="admin-view-all">View all →</Link>
          </div>
          {loading ? (
            <div style={{ padding: 32, display:'flex', justifyContent:'center' }}><div className="spinner" /></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>DATE</th>
                    <th>ITEMS</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.id}</strong></td>
                      <td style={{ color:'var(--text-2)' }}>{new Date(o.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</td>
                      <td>{o.items.length}</td>
                      <td><strong style={{ color:'var(--blue)' }}>₹{o.total.toFixed(2)}</strong></td>
                      <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
