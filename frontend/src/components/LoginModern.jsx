// Modern, attractive Login component
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxWidth: '440px',
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
      color: '#1a202c',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#718096',
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
      color: '#2d3748',
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
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: '#f7fafc',
      boxSizing: 'border-box'
    },
    inputFocus: {
      border: '2px solid #667eea',
      backgroundColor: 'white',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)'
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
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#4a5568'
    },
    checkboxInput: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#667eea'
    },
    forgotLink: {
      fontSize: '14px',
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.2s'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
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
    registerLink: {
      textAlign: 'center',
      fontSize: '15px',
      color: '#4a5568'
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '6px',
      transition: 'color 0.2s'
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
        input:focus {
          border: 2px solid #667eea !important;
          background-color: white !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
        }
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        button:not(:disabled):active {
          transform: translateY(0);
        }
        a:hover {
          color: #5a67d8 !important;
        }
      `}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
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
            <label style={styles.checkbox}>
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={styles.checkboxInput}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot-password" style={styles.forgotLink}>
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
