// Modern, attractive Login component with Google OAuth
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Google logo SVG component
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <title>Google Logo</title>
    <g fill="none" fillRule="evenodd">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </g>
  </svg>
);

// Analytics helper function
const trackLoginEvent = (method, success = true) => {
  try {
    // Google Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'login_attempt', {
        method: method,
        success: success,
        timestamp: new Date().toISOString()
      });
    }

    // Custom analytics endpoint (if you have one)
    fetch(`${API}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'login_attempt',
        method: method,
        success: success,
        timestamp: new Date().toISOString()
      })
    }).catch(() => { }); // Silent fail for analytics
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};

// Inject CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes gradientFlow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
`;
if (!document.querySelector('[data-login-modern-styles]')) {
  styleSheet.setAttribute('data-login-modern-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for messages from other pages (OTP verification)
  useEffect(() => {
    const loginMessage = sessionStorage.getItem('loginMessage');
    const messageType = sessionStorage.getItem('loginMessageType');

    if (loginMessage) {
      setMsg(loginMessage);

      // Clear message from storage
      sessionStorage.removeItem('loginMessage');
      sessionStorage.removeItem('loginMessageType');

      // Auto-clear message after 5 seconds
      setTimeout(() => {
        setMsg('');
      }, 5000);
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function submit(e) {
    e.preventDefault();

    const newErrors = {};
    if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMsg('');
      return;
    }

    setErrors({});
    setMsg('Logging in...');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Track successful login
      trackLoginEvent('email', true);

      setMsg(`✅ Welcome back, ${data.user.name || data.user.email}!`);
      setForm({ email: '', password: '' });

      // Set flag for welcome message
      sessionStorage.setItem('justLoggedIn', 'true');

      // Trigger event to notify app of login
      window.dispatchEvent(new CustomEvent('userLoggedIn', {
        detail: { user: data.user, token: data.token }
      }));

      // Check if there's a redirect destination stored
      const redirectTo = sessionStorage.getItem('redirectAfterLogin');

      setTimeout(() => {
        if (redirectTo) {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.hash = redirectTo;
        } else {
          window.location.hash = '#dashboard';
        }
      }, 800);
    } catch (err) {
      console.error('Login error', err);

      // Track failed login
      trackLoginEvent('email', false);

      if (err.message === 'Email not verified') {
        setMsg('❌ Email not verified. Redirecting to verification page...');

        // Store email for OTP page
        try {
          localStorage.setItem('pendingVerificationEmail', form.email);
          sessionStorage.setItem('pendingVerificationEmail', form.email);
        } catch (storageError) {
          console.error('Storage error:', storageError);
        }

        // Redirect to OTP verification page
        setTimeout(() => {
          const encodedEmail = encodeURIComponent(form.email);
          window.location.hash = `#verify-otp?email=${encodedEmail}`;
        }, 1500);
      } else {
        setMsg('❌ ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle Google OAuth Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMsg('🔄 Redirecting to Google...');
    setErrors({});

    try {
      // Track Google login attempt
      trackLoginEvent('google', true);

      // Redirect to backend Google OAuth endpoint
      window.location.href = `${API}/api/auth/google`;
    } catch (err) {
      console.error('Google login error:', err);
      setMsg('❌ Failed to initiate Google login. Please try again.');
      setGoogleLoading(false);
      trackLoginEvent('google', false);
    }
  };

  // Handle OAuth callback (when returning from Google)
  useEffect(() => {
    // Handle both hash-based and query-based routing
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : window.location.search.substring(1);
    const urlParams = new URLSearchParams(queryString);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    // Check if already logged in (token exists in localStorage)
    const existingToken = localStorage.getItem('token');
    if (existingToken && !token && !error) {
      // Already logged in, redirect to dashboard
      console.log('✅ Already authenticated, redirecting to dashboard...');
      window.location.hash = '#dashboard';
      return;
    }

    // Prevent processing the same callback multiple times (but allow retry after 5 seconds)
    const processedCallback = sessionStorage.getItem('oauth_callback_processed');
    const processedTime = sessionStorage.getItem('oauth_callback_time');
    const now = Date.now();
    
    // Clear old processed flag if more than 5 seconds old
    if (processedCallback && processedTime && (now - parseInt(processedTime) > 5000)) {
      console.log('🔄 Clearing old OAuth processing flag...');
      sessionStorage.removeItem('oauth_callback_processed');
      sessionStorage.removeItem('oauth_callback_time');
    }

    if (token && !sessionStorage.getItem('oauth_callback_processed')) {
      console.log('✅ Google OAuth token received, processing...');

      // Mark callback as processed to prevent loops (with timestamp)
      sessionStorage.setItem('oauth_callback_processed', 'true');
      sessionStorage.setItem('oauth_callback_time', Date.now().toString());

      // Store token
      localStorage.setItem('token', token);
      setMsg('✅ Google login successful! Loading your profile...');
      setLoading(true);

      // Fetch user info
      fetch(`${API}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch user info: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('✅ User profile loaded:', data.email);
          localStorage.setItem('user', JSON.stringify(data));
          setMsg('✅ Welcome back! Redirecting to dashboard...');
          trackLoginEvent('google', true);

          // Set flag for welcome message
          sessionStorage.setItem('justLoggedIn', 'true');

          // Trigger event to notify app of login
          window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { user: data, token: token }
          }));

          // Check if there's a redirect destination stored
          const redirectTo = sessionStorage.getItem('redirectAfterLogin');

          // Clear the callback processed flag after successful login
          sessionStorage.removeItem('oauth_callback_processed');
          sessionStorage.removeItem('oauth_callback_time');
          setLoading(false);

          if (redirectTo) {
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.hash = redirectTo;
          } else {
            window.location.hash = '#dashboard';
          }
          
          // ✅ NO RELOAD - Let React handle state updates
          // The userLoggedIn event will trigger component re-renders
        })
        .catch(err => {
          console.error('❌ Failed to fetch user:', err);
          setMsg('⚠️ Login successful but failed to load profile. Please try again.');
          setGoogleLoading(false);
          setLoading(false);

          // Clear the problematic token and flags
          localStorage.removeItem('token');
          sessionStorage.removeItem('oauth_callback_processed');
          sessionStorage.removeItem('oauth_callback_time');

          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname + '#login');
        });
    } else if (error && !processedCallback) {
      console.error('❌ Google OAuth error:', error);

      // Mark as processed
      sessionStorage.setItem('oauth_callback_processed', 'true');

      const decodedError = decodeURIComponent(error);
      setMsg(`❌ Google login failed: ${decodedError}`);
      trackLoginEvent('google', false);
      setGoogleLoading(false);

      // Clean URL after showing error
      setTimeout(() => {
        sessionStorage.removeItem('oauth_callback_processed');
        window.history.replaceState({}, document.title, window.location.pathname + '#login');
      }, 100);
    } else if (!token && !error && processedCallback) {
      // Clean up if we're back on login page without params
      sessionStorage.removeItem('oauth_callback_processed');
    }
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--text-primary)'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 'var(--border-radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid var(--border-color)',
      maxWidth: '480px',
      width: '100%',
      padding: '56px 48px',
      animation: 'scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    lockIcon: {
      width: '80px',
      height: '80px',
      margin: '0 auto 32px',
      background: 'var(--background-secondary)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '36px',
      boxShadow: 'var(--shadow-inner)',
      border: '1px solid var(--border-color)'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: 'var(--text-primary)',
      marginBottom: '12px',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '17px',
      color: 'var(--text-secondary)',
      fontWeight: '400'
    },
    inputGroup: {
      marginBottom: '24px',
      position: 'relative'
    },
    label: {
      display: 'block',
      fontSize: '15px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '10px',
      letterSpacing: '0'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '15px 18px',
      fontSize: '16px',
      border: '1px solid var(--border-secondary)',
      borderRadius: '14px',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      color: 'var(--text-primary)'
    },
    inputFocus: {
      border: '1px solid var(--accent-blue-primary)',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 4px var(--accent-blue-subtle)'
    },
    inputError: {
      border: '1px solid var(--accent-red-primary)',
      backgroundColor: 'rgba(255, 71, 87, 0.1)'
    },
    passwordToggle: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      fontSize: '20px',
      padding: '0',
      lineHeight: '1'
    },
    errorText: {
      color: 'var(--accent-red-primary)',
      fontSize: '13px',
      marginTop: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      fontSize: '15px',
      color: 'var(--text-secondary)',
      userSelect: 'none'
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      accentColor: 'var(--accent-blue-primary)'
    },
    forgotLink: {
      fontSize: '15px',
      color: 'var(--accent-blue-primary)',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.2s ease'
    },
    button: {
      width: '100%',
      padding: '18px',
      fontSize: '17px',
      fontWeight: '700',
      color: 'white',
      background: 'var(--gradient-cta)',
      border: 'none',
      borderRadius: 'var(--border-radius-md)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'var(--shadow-md)',
      letterSpacing: '0.3px',
      textTransform: 'none'
    },
    buttonDisabled: {
      opacity: '0.65',
      cursor: 'not-allowed',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
    },
    message: {
      marginTop: '24px',
      padding: '16px 20px',
      borderRadius: '14px',
      fontSize: '15px',
      fontWeight: '500',
      textAlign: 'center',
      animation: 'slideUp 0.4s ease-out'
    },
    messageSuccess: {
      background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      color: '#065f46',
      border: '1px solid #10b981',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    },
    messageError: {
      background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      color: '#991b1b',
      border: '1px solid #ef4444',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
    },
    divider: {
      textAlign: 'center',
      margin: '36px 0',
      position: 'relative',
      color: '#94a3b8',
      fontSize: '14px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    registerLink: {
      textAlign: 'center',
      fontSize: '15px',
      color: '#64748b'
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '6px',
      transition: 'all 0.2s ease'
    },
    decorativeBlob1: {
      position: 'absolute',
      top: '-100px',
      right: '-100px',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: -1
    },
    decorativeBlob2: {
      position: 'absolute',
      bottom: '-120px',
      left: '-120px',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: -1
    },
    googleButton: {
      width: '100%',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#3c4043',
      backgroundColor: '#ffffff',
      border: '2px solid #dadce0',
      borderRadius: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex !important',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'visible',
      marginBottom: '0',
      zIndex: 10,
      visibility: 'visible !important',
      opacity: '1 !important'
    },
    googleButtonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed'
    },
    googleButtonText: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#3c4043',
      letterSpacing: '0.25px'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '18px',
      height: '18px',
      border: '3px solid rgba(102, 126, 234, 0.2)',
      borderTopColor: '#667eea',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    },
    securityNote: {
      fontSize: '13px',
      color: '#64748b',
      textAlign: 'center',
      marginTop: '20px',
      padding: '12px 16px',
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      lineHeight: '1.6',
      border: '1px solid #e2e8f0'
    },
    privacyLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'opacity 0.2s'
    },
    tooltip: {
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      whiteSpace: 'nowrap',
      marginBottom: '8px',
      opacity: 0,
      pointerEvents: 'none',
      transition: 'opacity 0.2s ease',
      zIndex: 10,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    tooltipArrow: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid #1e293b'
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative Background Elements */}
      <div style={styles.decorativeBlob1}></div>
      <div style={styles.decorativeBlob2}></div>

      <style>{`
        input:focus {
          border: 1px solid var(--accent-blue-primary) !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 0 0 4px var(--accent-blue-subtle) !important;
          color: var(--text-primary) !important;
        }
        button:not(:disabled):hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
        }
        button:not(:disabled):active {
          transform: translateY(-1px) scale(0.99);
        }
        .google-btn:not(:disabled):hover {
          background-color: #f8fafc;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          border-color: #667eea;
        }
        .google-btn:not(:disabled):active {
          transform: translateY(0);
        }
        .google-btn:focus {
          outline: 3px solid rgba(102, 126, 234, 0.3);
          outline-offset: 2px;
        }
        a:hover {
          color: #5a67d8 !important;
          text-decoration: none;
        }
        .checkbox-label:hover {
          color: #1e293b;
        }
        .privacy-link:hover {
          opacity: 0.8;
        }
        .google-btn-wrapper:hover .tooltip {
          opacity: 1;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          {/* Lock Icon */}
          <div style={styles.lockIcon}>
            🔐
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Login to your account</p>
        </div>

        {/* Google Login Button */}
        <div style={{ position: 'relative', marginBottom: '16px' }} className="google-btn-wrapper">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            style={{
              ...styles.googleButton,
              ...(googleLoading && styles.googleButtonDisabled),
              display: 'flex !important',
              visibility: 'visible !important',
              opacity: 1
            }}
            className="google-btn"
            aria-label="Continue with Google - Quick and secure access with your Google account"
          >
            {googleLoading ? (
              <>
                <div style={styles.loadingSpinner} role="status" aria-label="Loading"></div>
                <span style={styles.googleButtonText}>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleLogo />
                <span style={styles.googleButtonText}>Continue with Google</span>
              </>
            )}
          </button>

          {/* Tooltip */}
          <div style={styles.tooltip} className="tooltip" role="tooltip">
            Quick and secure access with your Google account
            <div style={styles.tooltipArrow}></div>
          </div>
        </div>

        {/* OR Divider */}
        <div style={{ ...styles.divider, margin: '24px 0' }}>
          <span style={{
            backgroundColor: 'var(--glass-background)',
            padding: '0 16px',
            position: 'relative',
            zIndex: 1,
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            OR
          </span>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'var(--border-secondary)',
            zIndex: 0
          }}></div>
        </div>

        <form onSubmit={submit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.email && styles.inputError)
              }}
              required
              autoComplete="email"
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <div style={styles.errorText} id="email-error" role="alert">
                <span aria-hidden="true">⚠️</span> {errors.email}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password-input">Password</label>
            <div style={styles.inputWrapper}>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{
                  ...styles.input,
                  ...(errors.password && styles.inputError),
                  paddingRight: '48px'
                }}
                required
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <span aria-hidden="true">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
              </button>
            </div>
            {errors.password && (
              <div style={styles.errorText} id="password-error" role="alert">
                <span aria-hidden="true">⚠️</span> {errors.password}
              </div>
            )}
          </div>

          <div style={styles.rememberRow}>
            <label style={styles.checkbox} className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={styles.checkboxInput}
              />
              <span>Remember me</span>
            </label>
            <a
              href="#forgot-password"
              style={styles.forgotLink}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
            aria-label="Login with email and password"
          >
            {loading ? (
              <>
                <span style={styles.loadingSpinner} role="status" aria-label="Loading"></span>
                <span style={{ marginLeft: '8px' }}>Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {msg && (
          <div
            style={{
              ...styles.message,
              ...(msg.includes('✅') ? styles.messageSuccess : styles.messageError)
            }}
            role="alert"
            aria-live="polite"
          >
            {msg}
          </div>
        )}

        {/* Security & Privacy Notice */}
        <div style={styles.securityNote}>
          🔒 <strong>Secure Login:</strong> Your data is protected with industry-standard encryption.
          By logging in with Google, you agree to our{' '}
          <a
            href="#privacy-policy"
            style={styles.privacyLink}
            className="privacy-link"
            aria-label="Read our privacy policy"
          >
            Privacy Policy
          </a>
          {' '}and{' '}
          <a
            href="#terms"
            style={styles.privacyLink}
            className="privacy-link"
            aria-label="Read our terms of service"
          >
            Terms of Service
          </a>.
        </div>

        <div style={styles.registerLink}>
          Don't have an account?
          <a href="#register" style={styles.link}>
            Create one now
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a
            href="#home"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.3s ease',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.color = '#4f46e5'}
            onMouseOut={(e) => e.target.style.color = '#667eea'}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
