import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { getAllOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminPages.css';

const AdminCustomersPage = () => {
  const { admin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const orders = await getAllOrders();
      
      const customerMap = {};

      orders.forEach(order => {
        // Check if order contains products created by this admin
        const adminItems = order.items.filter(item => item.createdBy === admin.email);
        
        if (adminItems.length > 0 && order.address) {
          const email = order.userId !== 'demo' ? order.userId : `${order.address.fullName.toLowerCase().replace(/\s+/g, '')}@example.com`;
          
          if (!customerMap[email]) {
            customerMap[email] = {
              name: order.address.fullName,
              email: email,
              phone: order.address.phone,
              city: order.address.city,
              state: order.address.state,
              totalSpent: 0,
              ordersCount: 0,
              lastOrderDate: order.date
            };
          }
          
          // Add spending ONLY for this admin's products
          const spending = adminItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
          customerMap[email].totalSpent += spending;
          customerMap[email].ordersCount += 1;
          
          if (new Date(order.date) > new Date(customerMap[email].lastOrderDate)) {
            customerMap[email].lastOrderDate = order.date;
          }
        }
      });

      setCustomers(Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent));
      setLoading(false);
    };

    fetchCustomers();
  }, [admin]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main fade-up">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Customers</h1>
            <p className="admin-page-sub">View customers who purchased your products</p>
          </div>
          <div className="admin-tabs">
            <Link to="/admin/dashboard"   className="admin-tab">Overview</Link>
            <Link to="/admin/products"    className="admin-tab">Products</Link>
            <Link to="/admin/add-product" className="admin-tab">Add Product</Link>
            <Link to="/admin/orders"      className="admin-tab">Orders</Link>
            <Link to="/admin/analytics"   className="admin-tab">Analytics</Link>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-hdr">
            <h2 className="admin-panel-title">
              Your Customers
              <span className="badge badge-blue" style={{ marginLeft:10 }}>{customers.length}</span>
            </h2>
          </div>

          {loading ? (
            <div style={{ padding:40, display:'flex', justifyContent:'center' }}><div className="spinner" /></div>
          ) : customers.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--text-3)' }}>
              No customers found. Wait for orders containing your products!
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>CONTACT</th>
                    <th>LOCATION</th>
                    <th>ORDERS</th>
                    <th>TOTAL SPENT</th>
                    <th>LAST ORDER</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <strong style={{ display: 'block', color: 'var(--text-1)' }}>{c.name}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{c.email}</span>
                      </td>
                      <td>{c.phone}</td>
                      <td>{c.city}, {c.state}</td>
                      <td><span className="badge badge-gray">{c.ordersCount}</span></td>
                      <td><strong style={{ color:'var(--blue)' }}>₹{c.totalSpent.toFixed(0)}</strong></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                        {new Date(c.lastOrderDate).toLocaleDateString()}
                      </td>
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

export default AdminCustomersPage;
