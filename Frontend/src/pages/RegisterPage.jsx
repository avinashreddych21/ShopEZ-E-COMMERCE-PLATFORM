import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, verifyOtp, resendOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './AuthPages.css';

// Reusable 6-box OTP Input Component
const OtpInput = ({ value, onChange, length = 6 }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    let newOtp = value.split('');
    // Handle pasting multiple digits
    if (val.length > 1) {
      const pasted = val.slice(0, length).split('');
      for (let i = 0; i < length; i++) {
        newOtp[i] = pasted[i] || '';
      }
      onChange(newOtp.join(''));
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus].focus();
      return;
    }

    newOtp[index] = val;
    onChange(newOtp.join(''));

    // Move to next input
    if (val !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-container">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength="6"
          className="otp-box"
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
};

const RegisterPage = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Math Captcha State
  const [captchaParams, setCaptchaParams] = useState({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) });
  const [captchaInput, setCaptchaInput] = useState('');

  // OTP View State
  const [showOtp, setShowOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [otpPreview, setOtpPreview] = useState('');

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); setMessage(''); };

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  };
  const s = strength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][s];
  const strengthColor = ['', '#C81D2A', '#D4AF37', '#0B1F4A', '#D4AF37'][s];

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    
    // Captcha Validation
    if (parseInt(captchaInput) !== (captchaParams.a + captchaParams.b)) {
      setError('Incorrect math captcha answer. Please try again.');
      setCaptchaParams({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) });
      setCaptchaInput('');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    const res = await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);
    
    if (res.success) { 
      setMessage(res.message || '');
      setOtpPreview(res.otpPreview || '');
      setShowOtp(true); 
    } else {
      setError(res.error);
    }
  };

  const onVerify = async e => {
    e.preventDefault();
    if (emailOtp.length < 6) { 
      setError('Please enter the complete 6-digit Email OTP.'); 
      return; 
    }
    
    setLoading(true);
    setError('');
    const res = await verifyOtp({ email: form.email, otp: emailOtp });
    setLoading(false);
    
    if (res.success) { 
      handleRegister(res.user); 
      navigate('/'); 
    } else {
      setError(res.error);
    }
  };

  const onResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const res = await resendOtp({ email: form.email });
    setLoading(false);
    if (res.success) {
      setMessage(res.message || 'New OTP has been sent to your email!');
      setOtpPreview(res.otpPreview || '');
      setEmailOtp('');
    } else {
      setError(res.error || 'Failed to resend OTPs');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        {!showOtp ? (
          // --- REGISTRATION FORM ---
          <>
            <div className="auth-icon">
              <img src={logo} alt="Logo" />
            </div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-sub">Join thousands of happy shoppers on <span className="auth-brand">ShopEZ</span></p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={onSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text" className="form-input"
                  placeholder="John Doe" value={form.name} onChange={onChange} autoComplete="name" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" className="form-input"
                  placeholder="you@example.com" value={form.email} onChange={onChange} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" className="form-input"
                  placeholder="+91 9876543210" value={form.phone} onChange={onChange} autoComplete="tel" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" className="form-input"
                  value={form.password} onChange={onChange} autoComplete="new-password" />
                {form.password && (
                  <div className="strength-row">
                    <div className="strength-bars">
                      {[1,2,3,4].map(l => (
                        <div key={l} className="strength-bar" style={{ background: l <= s ? strengthColor : 'var(--border-2)' }} />
                      ))}
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm">Confirm Password</label>
                <input id="confirm" name="confirm" type="password" className="form-input"
                  value={form.confirm} onChange={onChange} autoComplete="new-password" />
              </div>

              {/* Math Captcha */}
              <div className="form-group">
                <label className="form-label">Security Check: What is {captchaParams.a} + {captchaParams.b}?</label>
                <input type="number" className="form-input"
                  placeholder="Enter the result" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Creating account…</> : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </>
        ) : (
          // --- OTP VERIFICATION VIEW ---
          <>
            <div className="auth-icon" style={{ boxShadow: '0 8px 24px rgba(212,175,55,0.3)' }}>
              <img src={logo} alt="Logo" />
            </div>
            <h1 className="auth-title">Verify Your Account</h1>
            <p className="auth-sub" style={{ lineHeight: '1.5', marginTop: '4px' }}>
              We've sent a 6-digit code to:<br/>
              <strong>{form.email}</strong> & <strong>{form.phone}</strong>
            </p>

            <button 
              type="button" 
              onClick={() => setShowOtp(false)} 
              className="auth-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', margin: '-5px 0 10px' }}
            >
              ✎ Change email or phone number
            </button>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success" style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{message}</div>}
            {otpPreview && (
              <div className="alert alert-info" style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                OTP Preview: <strong>{otpPreview}</strong>
              </div>
            )}

            <form onSubmit={onVerify} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center', width: '100%', marginBottom: '4px' }}>Email OTP</label>
                <OtpInput value={emailOtp} onChange={setEmailOtp} length={6} />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? <><span className="btn-spinner" /> Verifying...</> : 'Verify & Login'}
              </button>
            </form>

            <p className="auth-footer" style={{ marginTop: '15px' }}>
              Didn't receive the codes?{' '}
              <button 
                type="button" 
                onClick={onResendOtp} 
                disabled={loading} 
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                Resend OTP
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
