// Modern, attractive Login component
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      
      setMsg(`✅ Welcome back, ${data.user.name || data.user.email}!`);
      setForm({ email: '', password: '' });
      
      setTimeout(() => {
        window.location.hash = '#dashboard';
      }, 1000);
    } catch (err) {
      console.error('Login error', err);
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

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientFlow 15s ease infinite',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '28px',
      boxShadow: '0 25px 70px rgba(102, 126, 234, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.6)',
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
      width: '72px',
      height: '72px',
      margin: '0 auto 24px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '36px',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
      animation: 'float 3s ease-in-out infinite'
    },
    title: {
      fontSize: '36px',
      fontWeight: '800',
      color: '#1a202c',
      marginBottom: '10px',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '17px',
      color: '#64748b',
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
      color: '#1e293b',
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
      border: '2px solid #e2e8f0',
      borderRadius: '14px',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#f8fafc',
      boxSizing: 'border-box',
      color: '#1e293b'
    },
    inputFocus: {
      border: '2px solid #667eea',
      backgroundColor: 'white',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.12)'
    },
    inputError: {
      border: '2px solid #ef4444',
      backgroundColor: '#fef2f2'
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
      color: '#475569',
      userSelect: 'none'
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      accentColor: '#667eea'
    },
    forgotLink: {
      fontSize: '15px',
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    button: {
      width: '100%',
      padding: '18px',
      fontSize: '17px',
      fontWeight: '700',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
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
      width: '300px',
      height: '300px',
      background: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'float 8s ease-in-out infinite',
      pointerEvents: 'none'
    },
    decorativeBlob2: {
      position: 'absolute',
      bottom: '-120px',
      left: '-120px',
      width: '350px',
      height: '350px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      filter: 'blur(70px)',
      animation: 'float 10s ease-in-out infinite reverse',
      pointerEvents: 'none'
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative Background Elements */}
      <div style={styles.decorativeBlob1}></div>
      <div style={styles.decorativeBlob2}></div>

      <style>{`
        input:focus {
          border: 2px solid #667eea !important;
          background-color: white !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12) !important;
        }
        button:not(:disabled):hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
        }
        button:not(:disabled):active {
          transform: translateY(-1px) scale(0.99);
        }
        a:hover {
          color: #5a67d8 !important;
          text-decoration: none;
        }
        .checkbox-label:hover {
          color: #1e293b;
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

        <form onSubmit={submit}>
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
            {errors.password && (
              <div style={styles.errorText}>
                <span>⚠️</span> {errors.password}
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
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
          >
            {loading ? '⏳ Logging in...' : 'Login'}
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
            backgroundColor: 'white',
            padding: '0 16px',
            position: 'relative',
            zIndex: 1
          }}>
            OR
          </span>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: '#e2e8f0',
            zIndex: 0
          }}></div>
        </div>
        
        <div style={styles.registerLink}>
          Don't have an account?
          <a href="#register" style={styles.link}>
            Create one now
          </a>
        </div>
      </div>
    </div>
  );
}
