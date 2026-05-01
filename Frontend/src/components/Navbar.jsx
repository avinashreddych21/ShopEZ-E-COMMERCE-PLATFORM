import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';
import './Navbar.css';

const Logo = () => (
  <div className="navbar-logo">
    <div className="logo-icon" style={{ background: '#fff', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={logo} alt="ShopEZ Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
    <span className="logo-text" style={{ color: '#fff' }}>Shop<span className="logo-ez" style={{ color: '#2563EB' }}>EZ</span></span>
  </div>
);

const Navbar = () => {
  const { isLoggedIn, handleLogout, user } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/',       label: 'Home',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
    { to: '/cart',   label: 'Cart',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39A2 2 0 009.66 16h9.69a2 2 0 001.97-1.67L23 6H6"/></svg>, count: cartCount },
    { to: '/orders', label: 'Orders', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg> },
  ];

  if (isLoggedIn) {
    navLinks.push({ to: '/profile', label: 'Profile', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> });
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links">
          {navLinks.map(({ to, label, icon, count }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              >
                {icon}
                {label}
                {count > 0 && <span className="nav-badge">{count}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="navbar-right">
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme} style={{ padding: '8px', borderRadius: '50%' }} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>

          {isLoggedIn ? (
            <div className="user-menu">
              <span className="user-name" style={{ color: 'var(--text-2)', cursor: 'default' }}>Hi, {user?.name?.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm nav-login-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Login
            </Link>
          )}

          <Link to="/admin" className="btn btn-sm admin-btn">Admin</Link>

          {/* Hamburger */}
          <button className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(({ to, label, count }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'mobile-link--active' : ''}`} onClick={() => setMenuOpen(false)}>
              {label} {count > 0 && <span className="nav-badge">{count}</span>}
            </NavLink>
          ))}
          <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Admin</Link>
          {isLoggedIn
            ? <>
                <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button className="mobile-link mobile-link--btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
              </>
            : <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
          }
        </div>
      )}
    </nav>
  );
};

export default Navbar;
