import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { getAllOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import './AdminPages.css';

const AdminAnalyticsPage = () => {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const orders = await getAllOrders();
        
        let productSales = {};
        let timeline = {};
        let revenue = 0;
        let itemsSold = 0;
        let transactions = [];

        orders.forEach(order => {
          let countsForRevenue = false;
          if (order.status === 'Delivered') {
            countsForRevenue = true;
          }

          const dateStr = new Date(order.createdAt || order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!timeline[dateStr]) timeline[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
          
          timeline[dateStr].orders += 1;

          if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
              const itemTotal = item.price * item.qty;
              
              if (countsForRevenue) {
                itemsSold += item.qty;
                if (!productSales[item.name]) {
                  productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productSales[item.name].quantity += item.qty;
                productSales[item.name].revenue += itemTotal;
              }
            });

            if (countsForRevenue) {
              const orderAmount = order.total || 0;
              revenue += orderAmount;
              timeline[dateStr].revenue += orderAmount;
            }
          }

          transactions.push({
            id: order._id || order.id,
            date: new Date(order.createdAt || order.date).toLocaleDateString('en-US'),
            customerName: order.userId?.name || order.address?.fullName || order.address?.name || 'Unknown',
            customerEmail: order.userId?.email || 'N/A',
            paymentMethod: order.paymentMethod || 'COD',
            paymentId: order.paymentId || 'N/A',
            status: order.status,
            amount: order.total || 0,
            countedInRevenue: countsForRevenue
          });
        });

        setSalesData(Object.values(productSales).sort((a, b) => b.revenue - a.revenue));
        setTimelineData(Object.values(timeline));
        setTotalRevenue(revenue);
        setTotalOrders(orders.length);
        setTotalItemsSold(itemsSold);
        setRecentTransactions(transactions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [admin]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Analytics</h1>
            <p className="admin-page-sub">View sales performance and transaction details</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard"   className="admin-tab">Overview</Link>
            <Link to="/admin/products"    className="admin-tab">Products</Link>
            <Link to="/admin/add-product" className="admin-tab">Add Product</Link>
            <Link to="/admin/orders"      className="admin-tab">Orders</Link>
            <Link to="/admin/analytics"   className="admin-tab admin-tab--active">Analytics</Link>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">Store Performance</h2>
          </div>

          {loading ? (
            <div style={{ padding:40, display:'flex', justifyContent:'center' }}><div className="spinner" /></div>
          ) : (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                  <h3 style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '8px' }}>Total Revenue</h3>
                  <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 700 }}>₹{totalRevenue.toFixed(0)}</div>
                </div>
                <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                  <h3 style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '8px' }}>Total Orders</h3>
                  <div style={{ color: 'var(--blue)', fontSize: '2rem', fontWeight: 700 }}>{totalOrders}</div>
                </div>
                <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                  <h3 style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '8px' }}>Items Sold</h3>
                  <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 700 }}>{totalItemsSold}</div>
                </div>
              </div>
              
              {/* Timeline Chart - Revenue */}
              <div>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-1)' }}>Revenue Over Time</h3>
                <div style={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                      <XAxis dataKey="date" stroke="var(--text-2)" />
                      <YAxis stroke="var(--text-2)" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)', color: 'var(--text-1)' }}
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Timeline Chart - Orders */}
              <div>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-1)' }}>Orders Over Time</h3>
                <div style={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                      <XAxis dataKey="date" stroke="var(--text-2)" />
                      <YAxis stroke="var(--text-2)" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)', color: 'var(--text-1)' }}
                        formatter={(value) => [value, 'Orders']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="orders" stroke="var(--blue)" strokeWidth={3} activeDot={{ r: 8 }} name="Orders Count" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              {salesData.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '16px', color: 'var(--text-1)' }}>Sales by Product</h3>
                  <div style={{ height: 350, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart data={salesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                        <XAxis type="number" stroke="var(--text-2)" />
                        <YAxis dataKey="name" type="category" width={150} stroke="var(--text-2)" style={{ fontSize: '12px' }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)', color: 'var(--text-1)' }}
                          formatter={(value, name) => [name === 'revenue' ? `₹${value}` : value, name.charAt(0).toUpperCase() + name.slice(1)]}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="var(--blue)" radius={[0, 4, 4, 0]} name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Customer Transactions Table */}
              <div>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-1)' }}>Customer Transactions</h3>
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ backgroundColor: 'var(--bg-surface)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)', color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem' }}>Order ID</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)', color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem' }}>Customer</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)', color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)', color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem' }}>Payment Info</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)', color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)', color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem' }}>Amount</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)', color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem' }}>Revenue Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map(tx => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-1)' }}>
                          <td style={{ padding: '12px 16px', color: 'var(--text-1)', fontSize: '0.875rem' }}>{tx.id.substring(0,8)}...</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-1)', fontSize: '0.875rem' }}>
                            <div>{tx.customerName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{tx.customerEmail}</div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-1)', fontSize: '0.875rem' }}>{tx.date}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-1)', fontSize: '0.875rem' }}>
                            <div className={`badge ${tx.paymentMethod === 'Online' ? 'badge-blue' : 'badge-orange'}`}>{tx.paymentMethod}</div>
                            {tx.paymentId !== 'N/A' && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '4px' }}>ID: {tx.paymentId}</div>}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-1)', fontSize: '0.875rem' }}>
                            <span className={`badge ${
                              tx.status === 'Delivered' ? 'badge-green' : 
                              tx.status === 'Cancelled' ? 'badge-red' : 'badge-blue'
                            }`}>{tx.status}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-1)', fontSize: '0.875rem', fontWeight: 600 }}>₹{tx.amount}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-1)', fontSize: '0.875rem' }}>
                            {tx.countedInRevenue ? 
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Counted</span> : 
                              <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>⏳ Pending</span>
                            }
                          </td>
                        </tr>
                      ))}
                      {recentTransactions.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>No transactions found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;

