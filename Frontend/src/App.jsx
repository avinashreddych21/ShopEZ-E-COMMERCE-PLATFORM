import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages - Store
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProfilePage from './pages/ProfilePage';

// Pages - Admin
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminAddProductPage from './pages/AdminAddProductPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminBannersPage from './pages/AdminBannersPage';
import AdminHeroPage from './pages/AdminHeroPage';

const StoreLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const NotFound = () => (
  <StoreLayout>
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <div className="empty-icon" role="img" aria-label="Search icon">🔍</div>
      <h3>Page Not Found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: 12 }}>Go Home</a>
    </div>
  </StoreLayout>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <OrderProvider>
            <Router>
            <Routes>
              {/* Store Routes */}
              <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
              <Route path="/product/:id" element={<StoreLayout><ProductDetailsPage /></StoreLayout>} />
              <Route path="/login" element={<StoreLayout><LoginPage /></StoreLayout>} />
              <Route path="/register" element={<StoreLayout><RegisterPage /></StoreLayout>} />
              <Route path="/forgot-password" element={<StoreLayout><ForgotPasswordPage /></StoreLayout>} />
              <Route path="/cart" element={<StoreLayout><CartPage /></StoreLayout>} />

              {/* Protected - requires login */}
              <Route
                path="/checkout"
                element={(
                  <ProtectedRoute>
                    <StoreLayout><CheckoutPage /></StoreLayout>
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders"
                element={(
                  <ProtectedRoute>
                    <StoreLayout><OrdersPage /></StoreLayout>
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/profile"
                element={(
                  <ProtectedRoute>
                    <StoreLayout><ProfilePage /></StoreLayout>
                  </ProtectedRoute>
                )}
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<StoreLayout><AdminLoginPage /></StoreLayout>} />
              <Route path="/admin/register" element={<StoreLayout><AdminRegisterPage /></StoreLayout>} />

              {/* Protected admin routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              <Route path="/admin/add-product" element={<AdminRoute><AdminAddProductPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
              <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
              <Route path="/admin/banners" element={<AdminRoute><AdminBannersPage /></AdminRoute>} />
              <Route path="/admin/hero" element={<AdminRoute><AdminHeroPage /></AdminRoute>} />

              <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </OrderProvider>
      </CartProvider>
    </ThemeProvider>
  </AuthProvider>
  );
}

export default App;
