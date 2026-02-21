// AuthModal.jsx - Professional Login/Register Modal with Enhanced UX
import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, pendingProduct }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showIncentive, setShowIncentive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('✅ Login successful! Adding item to cart...');

        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 800);
      } else {
        setMessage('❌ ' + data.msg);
      }
    } catch (err) {
      setMessage('❌ Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Registration successful! Please check your email for verification.');
        setTimeout(() => {
          setMode('login');
          setMessage('');
        }, 2000);
      } else {
        setMessage('❌ ' + data.msg);
      }
    } catch (err) {
      setMessage('❌ Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Store pending product in session storage
    if (pendingProduct) {
      sessionStorage.setItem('pendingCartProduct', JSON.stringify(pendingProduct));
    }
    window.location.href = `${API}/api/auth/google`;
  };

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button - Accessible */}
        <button
          style={styles.closeBtn}
          onClick={onClose}
          aria-label="Close authentication modal"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Welcome Offer Banner - Dismissible */}
        {showIncentive && (
          <div style={styles.incentiveBanner} role="banner">
            <div style={styles.incentiveContent}>
              <div style={styles.incentiveIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V22H4V12"></path>
                  <path d="M22 7H2V12H22V7Z"></path>
                  <path d="M12 22V7"></path>
                  <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z"></path>
                  <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"></path>
                </svg>
              </div>
              <div>
                <strong style={styles.incentiveTitle}>First Order Special</strong>
                <p style={styles.incentiveText}>Get <strong>10% OFF</strong> + Free Shipping on your first purchase</p>
              </div>
            </div>
            <button
              style={styles.dismissBtn}
              onClick={() => setShowIncentive(false)}
              aria-label="Dismiss welcome offer"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue-primary)' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 id="auth-modal-title" style={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to continue your shopping experience'
              : 'Join us and enjoy exclusive benefits'}
          </p>
        </div>

        {/* Pending Product Card - Enhanced */}
        {pendingProduct && (
          <div style={styles.productCard} role="region" aria-label="Product to add">
            <div style={styles.productBadge}>Ready to add</div>
            <div style={styles.productContent}>
              <img
                src={pendingProduct.imageUrl}
                alt={pendingProduct.name}
                style={styles.productImage}
              />
              <div style={styles.productDetails}>
                <strong style={styles.productName}>{pendingProduct.name}</strong>
                <div style={styles.priceRow}>
                  <span style={styles.productPrice}>₹{pendingProduct.price}</span>
                  <span style={styles.stockBadge}>In Stock</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Benefits - Modern Grid Layout */}
        <div style={styles.benefitsSection}>
          <h3 style={styles.benefitsTitle}>Account Benefits</h3>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIconCircle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span style={styles.benefitLabel}>Save Items</span>
            </div>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIconCircle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span style={styles.benefitLabel}>Track Orders</span>
            </div>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIconCircle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <span style={styles.benefitLabel}>Fast Checkout</span>
            </div>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIconCircle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </div>
              <span style={styles.benefitLabel}>Exclusive Deals</span>
            </div>
          </div>
        </div>

        {/* Google Login - Premium Style */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            ...styles.googleBtn,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          aria-label="Continue with Google"
          onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = '#d1d5db')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = '#e5e7eb')}
        >
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          <span style={styles.googleBtnText}>Continue with Google</span>
        </button>

        {/* Elegant Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or continue with email</span>
          <div style={styles.dividerLine}></div>
        </div>

        {/* Status Message with Icon */}
        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.includes('✅') ? 'var(--color-success-50)' : 'var(--color-error-50)',
            borderLeft: `4px solid ${message.includes('✅') ? 'var(--color-success)' : 'var(--color-error)'}`,
            color: message.includes('✅') ? 'var(--accent-green)' : 'var(--color-error-700)'
          }}
            role="alert"
          >
            <div style={styles.messageIcon}>
              {message.includes('✅') ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
            </div>
            <span>{message.replace('✅ ', '').replace('❌ ', '')}</span>
          </div>
        )}

        {/* Login Form - Enhanced */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={styles.form} noValidate>
            <div style={styles.inputGroup}>
              <label htmlFor="login-email" style={styles.label}>
                Email Address
                <span style={styles.required} aria-label="required">*</span>
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'email' ? 'var(--accent-blue-primary)' : 'var(--border-secondary)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="you@example.com"
                  required
                  style={styles.input}
                  disabled={loading}
                  autoComplete="email"
                  aria-required="true"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="login-password" style={styles.label}>
                Password
                <span style={styles.required} aria-label="required">*</span>
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'password' ? 'var(--accent-blue-primary)' : 'var(--border-secondary)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your password"
                  required
                  style={styles.input}
                  disabled={loading}
                  autoComplete="current-password"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <>
                  <svg style={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  <span>Sign In & Continue</span>
                </>
              )}
            </button>

            <p style={styles.switchText}>
              New to our store?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setMessage('');
                  setForm({ email: '', password: '', name: '', username: '' });
                }}
                style={styles.switchBtn}
                disabled={loading}
              >
                Create an account
              </button>
            </p>
          </form>
        )}

        {/* Register Form - Enhanced with Validation */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={styles.form} noValidate>
            <div style={styles.inputGroup}>
              <label htmlFor="register-name" style={styles.label}>
                Full Name
                <span style={styles.required} aria-label="required">*</span>
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'name' ? 'var(--accent-blue-primary)' : 'var(--border-secondary)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  placeholder="John Doe"
                  required
                  style={styles.input}
                  disabled={loading}
                  autoComplete="name"
                  aria-required="true"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="register-username" style={styles.label}>
                Username
                <span style={styles.required} aria-label="required">*</span>
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'username' ? 'var(--accent-blue-primary)' : 'var(--border-secondary)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
                <input
                  id="register-username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  placeholder="johndoe123"
                  required
                  style={styles.input}
                  disabled={loading}
                  autoComplete="username"
                  aria-required="true"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="register-email" style={styles.label}>
                Email Address
                <span style={styles.required} aria-label="required">*</span>
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'register-email' ? 'var(--accent-blue-primary)' : 'var(--border-secondary)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('register-email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="you@example.com"
                  required
                  style={styles.input}
                  disabled={loading}
                  autoComplete="email"
                  aria-required="true"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="register-password" style={styles.label}>
                Password
                <span style={styles.required} aria-label="required">*</span>
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'register-password' ? 'var(--accent-blue-primary)' : 'var(--border-secondary)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('register-password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Minimum 6 characters"
                  required
                  minLength="6"
                  style={styles.input}
                  disabled={loading}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <p id="password-requirements" style={styles.helperText}>
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <>
                  <svg style={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                  <span>Create Account & Get 10% OFF</span>
                </>
              )}
            </button>

            <p style={styles.switchText}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMessage('');
                  setForm({ email: '', password: '', name: '', username: '' });
                }}
                style={styles.switchBtn}
                disabled={loading}
              >
                Sign in here
              </button>
            </p>
          </form>
        )}

        {/* Guest Checkout - Subtle & Accessible */}
        <div style={styles.guestSection}>
          <div style={styles.guestDivider}></div>
          <button
            style={styles.guestBtn}
            onClick={() => {
              if (pendingProduct) {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const existingItem = guestCart.find(item => item._id === pendingProduct._id);

                if (existingItem) {
                  existingItem.quantity += 1;
                } else {
                  guestCart.push({ ...pendingProduct, quantity: 1 });
                }

                localStorage.setItem('guestCart', JSON.stringify(guestCart));
              }

              onClose();
              window.location.hash = '#guest-checkout';
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Continue as Guest</span>
          </button>
        </div>

        {/* Privacy & Security Notice */}
        <div style={styles.securityBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <p style={styles.privacyText}>
            Secure checkout · Protected by encryption
          </p>
        </div>

        <p style={styles.termsText}>
          By continuing, you agree to our{' '}
          <a href="#terms" style={styles.termsLink}>Terms of Service</a>
          {' '}and{' '}
          <a href="#privacy" style={styles.termsLink}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  // Overlay with smooth backdrop blur
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    animation: 'fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '20px'
  },

  // Modern modal container
  modal: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '40px 36px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '95vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-xl)',
    position: 'relative',
    animation: 'slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e1 transparent'
  },

  // Close button with hover states
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10
  },

  // Premium incentive banner
  incentiveBanner: {
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '14px',
    padding: '18px 20px',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    position: 'relative',
    boxShadow: '0 8px 16px rgba(251, 191, 36, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
  },

  incentiveContent: {
    flex: 1,
    color: '#ffffff'
  },

  incentiveIcon: {
    color: '#ffffff',
    flexShrink: 0
  },

  incentiveTitle: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '4px',
    color: '#ffffff'
  },

  incentiveText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.5',
    color: 'rgba(255, 255, 255, 0.95)'
  },

  dismissBtn: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: 'none',
    color: '#ffffff',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },

  // Header section
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },

  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    marginBottom: '16px'
  },

  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    letterSpacing: '-0.02em'
  },

  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: '1.5'
  },

  // Enhanced product card
  productCard: {
    position: 'relative',
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '24px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-sm)'
  },

  productBadge: {
    position: 'absolute',
    top: '-10px',
    right: '16px',
    backgroundColor: 'var(--accent-blue-primary)',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 6px var(--accent-blue-glow)'
  },

  productContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    flexShrink: 0
  },

  productDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  productName: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  productPrice: {
    fontSize: '20px',
    color: 'var(--accent-blue-primary)',
    fontWeight: '700'
  },

  stockBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--accent-green)',
    backgroundColor: 'var(--accent-green-glow)',
    padding: '3px 8px',
    borderRadius: '6px'
  },

  // Modern benefits section
  benefitsSection: {
    marginBottom: '28px'
  },

  benefitsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '14px',
    marginTop: 0
  },

  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },

  benefitCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 10px',
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    transition: 'all 0.2s ease'
  },

  benefitIconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent-blue-primary)',
    boxShadow: 'none'
  },

  benefitLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    lineHeight: '1.3'
  },

  // Premium Google button
  googleBtn: {
    width: '100%',
    padding: '15px 20px',
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '24px',
    boxShadow: 'none'
  },

  googleBtnText: {
    color: 'var(--text-primary)'
  },

  // Elegant divider
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    gap: '16px'
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb'
  },

  dividerText: {
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  },

  // Enhanced message styling
  message: {
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    lineHeight: '1.5'
  },

  messageIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center'
  },

  // Form styling
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  required: {
    color: '#ef4444',
    fontSize: '14px'
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
  },

  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-tertiary)',
    pointerEvents: 'none'
  },

  input: {
    flex: 1,
    padding: '13px 16px 13px 44px',
    fontSize: '15px',
    border: 'none',
    borderRadius: '12px',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)'
  },

  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease'
  },

  helperText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0',
    paddingLeft: '4px'
  },

  // Premium submit button
  submitBtn: {
    padding: '15px 24px',
    background: 'linear-gradient(135deg, var(--accent-blue-primary) 0%, var(--accent-blue-active) 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 14px var(--accent-blue-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },

  spinner: {
    animation: 'spin 0.8s linear infinite'
  },

  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
    lineHeight: '1.5'
  },

  switchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue-primary)',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    fontSize: 'inherit',
    transition: 'color 0.2s ease'
  },

  // Guest section styling
  guestSection: {
    marginTop: '28px',
    paddingTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  guestDivider: {
    height: '1px',
    backgroundColor: 'var(--glass-border)',
    marginBottom: '4px'
  },

  guestBtn: {
    width: '100%',
    padding: '13px 20px',
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px dashed var(--glass-border)',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },

  // Security badge
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #f3f4f6'
  },

  privacyText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
    fontWeight: '500'
  },

  termsText: {
    fontSize: '11px',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '16px',
    lineHeight: '1.6',
    marginBottom: 0
  },

  termsLink: {
    color: 'var(--accent-blue-primary)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease'
  }
};
// Inject CSS animations and responsive styles
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('auth-modal-animations') || document.createElement('style');
  styleElement.id = 'auth-modal-animations';
  styleElement.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes slideUpFade {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    /* Custom scrollbar for modal */
    [style*="maxHeight: '95vh'"] {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }
    
    [style*="maxHeight: '95vh'"]::-webkit-scrollbar {
      width: 6px;
    }
    
    [style*="maxHeight: '95vh'"]::-webkit-scrollbar-track {
      background: transparent;
    }
    
    [style*="maxHeight: '95vh'"]::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 20px;
    }
    
    /* Input focus animations */
    input:focus {
      outline: none;
    }
    
    /* Smooth transitions for interactive elements */
    button:active {
      transform: scale(0.98);
    }
    
    /* Accessibility: Focus visible */
    button:focus-visible,
    input:focus-visible,
    a:focus-visible {
      outline: 2px solid var(--accent-blue-primary);
      outline-offset: 2px;
    }
    
    /* Responsive adjustments */
    @media (max-width: 640px) {
      [style*="padding: '40px 36px'"] {
        padding: 28px 24px !important;
      }
      
      [style*="fontSize: '26px'"] {
        font-size: 22px !important;
      }
      
      [style*="gridTemplateColumns: 'repeat(2, 1fr)'"] {
        grid-template-columns: 1fr !important;
      }
    }
    
    /* Dark mode support (optional) */
    @media (prefers-color-scheme: dark) {
      /* Can be enabled in future */
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  if (!document.getElementById('auth-modal-animations')) {
    document.head.appendChild(styleElement);
  }
}
