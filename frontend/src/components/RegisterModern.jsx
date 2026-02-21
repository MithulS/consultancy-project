// Modern, attractive Registration component with single email
import React, { useState, useEffect } from 'react';
import PasswordStrength from './PasswordStrength';
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
const trackRegistrationEvent = (method, success = true) => {
  try {
    // Google Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'registration_attempt', {
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
        event: 'registration_attempt',
        method: method,
        success: success,
        timestamp: new Date().toISOString()
      })
    }).catch(() => { }); // Silent fail for analytics
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');
    return errors;
  };

  const passwordErrors = form.password ? validatePassword(form.password) : [];
  const passwordStrength = form.password.length === 0 ? null :
    passwordErrors.length === 0 ? 'strong' :
      passwordErrors.length <= 2 ? 'medium' : 'weak';

  // Handle Google OAuth Registration
  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setMsg('🔄 Redirecting to Google...');
    setErrors({});

    try {
      // Track Google registration attempt
      trackRegistrationEvent('google', true);

      // Redirect to backend Google OAuth endpoint
      window.location.href = `${API}/api/auth/google`;
    } catch (err) {
      console.error('Google registration error:', err);
      setMsg('❌ Failed to initiate Google sign-up. Please try again.');
      setGoogleLoading(false);
      trackRegistrationEvent('google', false);
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

    // Prevent processing the same callback multiple times
    const processedCallback = sessionStorage.getItem('oauth_callback_processed');

    if (token && !processedCallback) {
      console.log('✅ Google OAuth token received, processing registration...');

      // Mark callback as processed to prevent loops
      sessionStorage.setItem('oauth_callback_processed', 'true');

      // Store token
      localStorage.setItem('token', token);
      setMsg('✅ Google sign-up successful! Loading your profile...');

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
          setMsg('✅ Welcome! Redirecting to dashboard...');
          trackRegistrationEvent('google', true);

          // Set flag for welcome message
          sessionStorage.setItem('justLoggedIn', 'true');

          // Trigger event to notify app of login
          window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { user: data, token: token }
          }));

          setTimeout(() => {
            // Clear the callback processed flag after redirect
            sessionStorage.removeItem('oauth_callback_processed');
            window.location.hash = '#dashboard';
          }, 1000);
        })
        .catch(err => {
          console.error('❌ Failed to fetch user:', err);
          setMsg('⚠️ Sign-up successful but failed to load profile. Please try again.');
          setGoogleLoading(false);

          // Clear the problematic token
          localStorage.removeItem('token');
          sessionStorage.removeItem('oauth_callback_processed');

          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname + '#register');
        });
    } else if (error && !processedCallback) {
      console.error('❌ Google OAuth error:', error);

      // Mark as processed
      sessionStorage.setItem('oauth_callback_processed', 'true');

      const decodedError = decodeURIComponent(error);
      setMsg(`❌ Google sign-up failed: ${decodedError}`);
      trackRegistrationEvent('google', false);
      setGoogleLoading(false);

      // Clean URL after showing error
      setTimeout(() => {
        sessionStorage.removeItem('oauth_callback_processed');
        window.history.replaceState({}, document.title, window.location.pathname + '#register');
      }, 100);
    } else if (!token && !error && processedCallback) {
      // Clean up if we're back on register page without params
      sessionStorage.removeItem('oauth_callback_processed');
    }
  }, []);

  const getStrengthColor = () => {
    if (!passwordStrength) return '#e2e8f0';
    if (passwordStrength === 'strong') return '#48bb78';
    if (passwordStrength === 'medium') return '#ed8936';
    return '#f56565';
  };

  const getStrengthWidth = () => {
    if (!passwordStrength) return '0%';
    if (passwordStrength === 'strong') return '100%';
    if (passwordStrength === 'medium') return '66%';
    return '33%';
  };

  async function submit(e) {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';
    if (passwordErrors.length > 0) newErrors.password = 'Password does not meet requirements';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMsg('');
      return;
    }

    setErrors({});
    setMsg('Creating your account...');
    setLoading(true);

    try {
      console.log('🚀 Initiating registration request...');
      console.log('📍 API URL:', `${API}/api/auth/register`);
      console.log('📦 Payload:', { name: form.name, email: form.email });

      // Add timeout to detect hung requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Response received:', res.status, res.statusText);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${res.status}). Server may be misconfigured.`);
      }

      let data;
      try {
        data = await res.json();
        console.log('📦 Response data:', data);
      } catch (jsonError) {
        console.error('❌ JSON parse error:', jsonError);
        throw new Error(`Server returned invalid JSON. Response status: ${res.status}`);
      }

      if (!res.ok) {
        // Server returned error response
        throw new Error(data.msg || data.error || `Registration failed (${res.status})`);
      }

      // Success!
      console.log('✅ Registration successful!');

      // Track successful registration
      trackRegistrationEvent('email', true);

      setMsg('✅ Success! Check your email for verification code. Redirecting...');

      // Store email in MULTIPLE locations for redundancy
      try {
        localStorage.setItem('pendingVerificationEmail', form.email);
        sessionStorage.setItem('pendingVerificationEmail', form.email);

        // Set OTP expiry time (10 minutes from now)
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        localStorage.setItem('otpExpiry', expiry.toISOString());

        console.log('📧 Email stored in localStorage and sessionStorage');
        console.log('⏱️ OTP expiry set to:', expiry.toISOString());
      } catch (storageError) {
        console.error('⚠️ Storage error:', storageError);
        // Continue anyway - URL param will work as backup
      }

      // Clear form
      setForm({ name: '', email: '', password: '' });

      // Redirect with email as URL parameter (backup method)
      const encodedEmail = encodeURIComponent(form.email);
      setTimeout(() => {
        window.location.hash = `#verify-otp?email=${encodedEmail}`;
      }, 2000);

    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error type:', err.name);
      console.error('Error message:', err.message);

      // Track failed registration
      trackRegistrationEvent('email', false);

      // Provide specific error messages based on error type
      if (err.name === 'AbortError') {
        setMsg('❌ Request timed out. Server may be slow or offline. Please try again.');
      } else if (err.message === 'Failed to fetch') {
        setMsg('❌ Cannot connect to server. Please check:\n' +
          '1. Backend server is running (npm start in backend folder)\n' +
          '2. Backend is on port 5000\n' +
          '3. Your internet connection');
      } else if (err.message.includes('CORS')) {
        setMsg('❌ CORS error. Backend may not be configured to accept requests from this origin.');
      } else if (err.message.includes('non-JSON')) {
        setMsg('❌ Server error. Backend returned invalid response. Check backend logs.');
      } else {
        setMsg('❌ ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)'
    },
    card: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      borderRadius: 'var(--border-radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid var(--border-color)',
      maxWidth: '480px',
      width: '100%',
      padding: '48px 40px',
      animation: 'slideUp 0.4s ease-out'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '16px',
      color: 'var(--text-secondary)',
      fontWeight: '400'
    },
    inputGroup: {
      marginBottom: '24px',
      position: 'relative'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '8px',
      letterSpacing: '0.3px'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      fontSize: '16px',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-md)',
      outline: 'none',
      transition: 'all 0.3s ease',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      boxSizing: 'border-box',
      color: 'var(--text-primary)'
    },
    inputError: {
      border: '2px solid #fc8181',
      backgroundColor: '#fff5f5'
    },
    passwordToggle: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#718096',
      fontSize: '20px',
      padding: '0',
      lineHeight: '1'
    },
    errorText: {
      color: '#e53e3e',
      fontSize: '13px',
      marginTop: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    strengthBar: {
      height: '4px',
      backgroundColor: '#e2e8f0',
      borderRadius: '2px',
      marginTop: '8px',
      overflow: 'hidden',
      position: 'relative'
    },
    strengthFill: {
      height: '100%',
      transition: 'all 0.3s ease',
      borderRadius: '2px'
    },
    strengthText: {
      fontSize: '12px',
      marginTop: '6px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    requirements: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
      fontSize: '13px'
    },
    requirementItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '6px',
      color: '#4a5568'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      color: 'white',
      background: 'var(--gradient-cta)',
      border: 'none',
      borderRadius: 'var(--border-radius-md)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'var(--shadow-md)',
      letterSpacing: '0.5px'
    },
    buttonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed',
      boxShadow: 'none'
    },
    message: {
      marginTop: '20px',
      padding: '14px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center',
      animation: 'fadeIn 0.3s ease-out'
    },
    messageSuccess: {
      backgroundColor: '#c6f6d5',
      color: '#22543d',
      border: '1px solid #9ae6b4'
    },
    messageError: {
      backgroundColor: '#fed7d7',
      color: '#742a2a',
      border: '1px solid #fc8181'
    },
    divider: {
      textAlign: 'center',
      margin: '32px 0',
      position: 'relative',
      color: '#a0aec0',
      fontSize: '14px'
    },
    loginLink: {
      textAlign: 'center',
      fontSize: '15px',
      color: 'var(--text-secondary)'
    },
    link: {
      color: 'var(--accent-blue-primary)',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '6px',
      transition: 'color 0.2s'
    },
    googleButton: {
      width: '100%',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '0'
    },
    googleButtonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed'
    },
    googleButtonText: {
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--text-primary)',
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
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus {
          border: 1px solid var(--accent-blue-primary) !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 0 0 4px var(--accent-blue-subtle) !important;
        }
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        button:not(:disabled):active {
          transform: translateY(0);
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
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join us today - it's free!</p>
        </div>

        {/* Google Sign-up Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          style={{
            ...styles.googleButton,
            ...(googleLoading && styles.googleButtonDisabled)
          }}
          className="google-btn"
          aria-label="Continue with Google - Quick and secure registration with your Google account"
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

        {/* OR Divider */}
        <div style={styles.divider}>
          <span style={{
            backgroundColor: 'var(--glass-background)',
            padding: '0 16px',
            position: 'relative',
            zIndex: 1,
            color: 'var(--text-secondary)'
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
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.name && styles.inputError)
              }}
              required
              autoComplete="name"
            />
            {errors.name && (
              <div style={styles.errorText}>
                <span>⚠️</span> {errors.name}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
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
            />
            {errors.email && (
              <div style={styles.errorText}>
                <span>⚠️</span> {errors.email}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                style={{
                  ...styles.input,
                  ...(errors.password && styles.inputError),
                  paddingRight: '48px'
                }}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {form.password && <PasswordStrength password={form.password} />}

            {errors.password && (
              <div style={styles.errorText}>
                <span>⚠️</span> {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
          >
            {loading ? '⏳ Creating Account...' : 'Create Account'}
          </button>
        </form>

        {msg && (
          <div style={{
            ...styles.message,
            ...(msg.includes('✅') ? styles.messageSuccess : styles.messageError)
          }}>
            {msg}
          </div>
        )}

        <div style={styles.divider}>
          <span style={{
            backgroundColor: 'var(--glass-background)',
            padding: '0 16px',
            position: 'relative',
            zIndex: 1,
            color: 'var(--text-secondary)'
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

        <div style={styles.loginLink}>
          Already have an account?
          <a href="#login" style={styles.link}>
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}
