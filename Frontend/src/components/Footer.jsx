import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <img src={logo} alt="Logo" />
            </div>
            <span><span style={{color:'#ffffff'}}>Shop</span><span style={{color:'#2563EB'}}>EZ</span></span>
          </div>
          <p className="footer-tagline">
            Your one-stop shop for premium products at unbeatable prices.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="footer-heading">Account</h4>
          <ul className="footer-links">
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-links">
            <li>support@shopez.com</li>
            <li>+1 (800) 123-4567</li>
            <li>Mon–Fri, 9am–6pm EST</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ShopEZ. All rights reserved.</p>
        <div className="footer-socials">
          {['G','𝕏','📷'].map((s, i) => (
            <a key={i} href="#!" className="social-icon">{s}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
