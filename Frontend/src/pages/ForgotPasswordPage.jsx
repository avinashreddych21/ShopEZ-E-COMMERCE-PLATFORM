import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpPreview, setOtpPreview] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email.');
    setLoading(true);
    setError('');
    setMessage('');
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      setMessage(res.message);
      setOtpPreview(res.otpPreview || '');
      setStep(2);
    } else {
      setError(res.error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return setError('Please fill in all fields.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    setError('');
    const res = await resetPassword({ email, otp, newPassword });
    setLoading(false);
    if (res.success) {
      navigate('/login', { state: { message: 'Password reset successfully! Please login.' } });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-sub">
          {step === 1 ? "Enter your email to receive a reset code." : "Enter your code and a new password."}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success" style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{message}</div>}
        {otpPreview && <div className="alert alert-info" style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>Reset Code Preview: <strong>{otpPreview}</strong></div>}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" className="form-input"
                placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Reset Code</label>
              <input type="text" className="form-input"
                placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '20px' }}>
          Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
