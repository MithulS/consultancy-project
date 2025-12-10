// AuthModal.jsx - Modal for Login/Register triggered by Add to Cart
import React, { useState } from 'react';

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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Incentive Banner */}
        {showIncentive && (
          <div style={styles.incentiveBanner}>
            <div style={styles.incentiveIcon}>🎁</div>
            <div style={styles.incentiveContent}>
              <strong>Welcome Offer!</strong>
              <p style={styles.incentiveText}>
                Get <strong>10% OFF</strong> on your first order + Free Shipping!
              </p>
            </div>
            <button 
              style={styles.dismissBtn} 
              onClick={() => setShowIncentive(false)}
              aria-label="Dismiss offer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.lockIcon}>🔐</div>
          <h2 style={styles.title}>
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p style={styles.subtitle}>
            {mode === 'login' 
              ? 'Login to add items to your cart' 
              : 'Sign up to start shopping'}
          </p>
        </div>

        {/* Pending Product Preview */}
        {pendingProduct && (
          <div style={styles.productPreview}>
            <img 
              src={pendingProduct.imageUrl} 
              alt={pendingProduct.name} 
              style={styles.productImage}
            />
            <div style={styles.productInfo}>
              <strong style={styles.productName}>{pendingProduct.name}</strong>
              <span style={styles.productPrice}>₹{pendingProduct.price}</span>
            </div>
          </div>
        )}

        {/* Benefits List */}
        <div style={styles.benefitsSection}>
          <h3 style={styles.benefitsTitle}>Why create an account?</h3>
          <ul style={styles.benefitsList}>
            <li style={styles.benefitItem}>
              <span style={styles.benefitIcon}>💾</span>
              Save items for later
            </li>
            <li style={styles.benefitItem}>
              <span style={styles.benefitIcon}>📦</span>
              Track your orders
            </li>
            <li style={styles.benefitItem}>
              <span style={styles.benefitIcon}>🎯</span>
              Get personalized recommendations
            </li>
            <li style={styles.benefitItem}>
              <span style={styles.benefitIcon}>⚡</span>
              Faster checkout process
            </li>
          </ul>
        </div>

        {/* Google Login Button */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={styles.googleBtn}
          aria-label="Continue with Google"
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b'
          }}>
            {message}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login & Add to Cart'}
            </button>

            <p style={styles.switchText}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setMessage('');
                }}
                style={styles.switchBtn}
              >
                Sign up now
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe123"
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                minLength="6"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up & Get 10% OFF'}
            </button>

            <p style={styles.switchText}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMessage('');
                }}
                style={styles.switchBtn}
              >
                Login here
              </button>
            </p>
          </form>
        )}

        {/* Guest Checkout Option */}
        <div style={styles.guestSection}>
          <p style={styles.guestText}>
            Not ready to create an account?
          </p>
          <button 
            style={styles.guestBtn}
            onClick={() => {
              // Store pending product and redirect to guest checkout
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
          >
            Continue as Guest
          </button>
        </div>

        {/* Privacy Notice */}
        <p style={styles.privacyText}>
          By continuing, you agree to our{' '}
          <a href="#terms" style={styles.privacyLink}>Terms of Service</a>
          {' '}and{' '}
          <a href="#privacy" style={styles.privacyLink}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.3s ease'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    animation: 'slideUp 0.4s ease'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  incentiveBanner: {
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  },
  incentiveIcon: {
    fontSize: '32px'
  },
  incentiveContent: {
    flex: 1,
    color: 'white'
  },
  incentiveText: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.95)'
  },
  dismissBtn: {
    background: 'rgba(255, 255, 255, 0.3)',
    border: 'none',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  lockIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0
  },
  productPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '2px dashed #e5e7eb'
  },
  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  productName: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '600'
  },
  productPrice: {
    fontSize: '18px',
    color: '#7c3aed',
    fontWeight: '700'
  },
  benefitsSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px'
  },
  benefitsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#065f46',
    marginBottom: '12px',
    marginTop: 0
  },
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  benefitItem: {
    fontSize: '13px',
    color: '#047857',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  benefitIcon: {
    fontSize: '16px'
  },
  googleBtn: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    marginBottom: '20px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '20px 0',
    position: 'relative'
  },
  dividerText: {
    backgroundColor: 'white',
    padding: '0 16px',
    position: 'relative',
    zIndex: 1,
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '600'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },
  submitBtn: {
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0 0 0'
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#7c3aed',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    fontSize: 'inherit'
  },
  guestSection: {
    textAlign: 'center',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  guestText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px'
  },
  guestBtn: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  privacyText: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '20px',
    lineHeight: '1.5'
  },
  privacyLink: {
    color: '#7c3aed',
    textDecoration: 'none',
    fontWeight: '500'
  }
};
