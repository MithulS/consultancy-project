// Admin Login Component - Enhanced Professional Design
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
`;
if (!document.querySelector('style[data-admin-login]')) {
  styleSheet.setAttribute('data-admin-login', 'true');
  document.head.appendChild(styleSheet);
}

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Add security watermark
    console.log('%c⚠️ ADMIN PORTAL ACCESS LOG', 'color: red; font-size: 24px; font-weight: bold;');
    console.log('%cUnauthorized access is strictly prohibited and will be prosecuted.', 'color: orange; font-size: 14px;');
    console.log(`Access Time: ${new Date().toISOString()}`);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setMsg('❌ All fields are required');
      return;
    }

    if (isLocked) {
      setMsg('🔒 Account is temporarily locked. Please wait.');
      return;
    }

    setLoading(true);
    setMsg('Verifying admin credentials...');

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(`${API}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please try again.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Admin login failed');
      }

      // Store admin token and flag
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      setMsg('✅ Admin login successful! Redirecting...');
      setLoginAttempts(0); // Reset attempts on success
      
      setTimeout(() => {
        window.location.hash = '#admin-dashboard';
      }, 1000);

    } catch (err) {
      console.error('Admin login error:', err);
      
      // Handle specific error types
      let errorMessage = '❌ ';
      
      if (err.name === 'AbortError') {
        errorMessage += 'Connection timeout. Please check your network and try again.';
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage += 'Cannot connect to server. Please ensure backend is running on port 5000.';
      } else if (err.message.includes('Invalid credentials')) {
        errorMessage += 'Invalid email or password. Please check your credentials.';
      } else if (err.message.includes('not an admin')) {
        errorMessage += 'Access denied. Admin privileges required.';
      } else {
        errorMessage += err.message || 'Server error occurred. Please try again.';
      }
      
      setMsg(errorMessage);
      
      // Track failed attempts only for credential errors
      if (!err.message.includes('fetch') && !err.message.includes('timeout') && !err.name === 'AbortError') {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          setMsg('🔒 Too many failed attempts. Account temporarily locked for 5 minutes.');
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
            setMsg('');
          }, 300000); // 5 minutes
        }
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
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #2563eb 50%, #1e40af 75%, #1e3a8a 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(147, 197, 253, 0.1) 0%, transparent 40%)',
      pointerEvents: 'none',
      animation: 'pulse 8s ease-in-out infinite'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4), 0 10px 40px -10px rgba(30, 58, 138, 0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
      padding: '56px 48px',
      width: '100%',
      maxWidth: '540px',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      zIndex: 1,
      border: '1px solid rgba(226, 232, 240, 0.5)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '36px',
      position: 'relative'
    },
    iconContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '88px',
      height: '88px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)',
      borderRadius: '22px',
      marginBottom: '24px',
      boxShadow: '0 12px 35px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      position: 'relative',
      transform: 'scale(1)',
      transition: 'transform 0.3s ease'
    },
    icon: {
      fontSize: '46px',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
    },
    securityBadge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.5)',
      border: '3px solid white',
      animation: 'pulse 2s ease-in-out infinite'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#0f172a',
      marginBottom: '10px',
      letterSpacing: '-0.8px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    warningBadge: {
      backgroundColor: '#fef9c3',
      border: '1px solid #facc15',
      borderRadius: '12px',
      padding: '14px 16px',
      marginBottom: '24px',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(250, 204, 21, 0.15)'
    },
    warningIcon: {
      fontSize: '20px',
      flexShrink: 0
    },
    warningText: {
      color: '#854d0e',
      fontSize: '13px',
      fontWeight: '600',
      margin: 0,
      lineHeight: '1.5',
      textAlign: 'left'
    },
    attemptsWarning: {
      backgroundColor: '#fee2e2',
      border: '1px solid #ef4444',
      borderRadius: '12px',
      padding: '12px 16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    attemptsText: {
      color: '#991b1b',
      fontSize: '13px',
      fontWeight: '600',
      margin: 0
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '2px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '16px 20px',
      fontSize: '15px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: 'inherit',
      backgroundColor: '#f9fafb',
      color: '#0f172a',
      fontWeight: '500',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
    },
    passwordContainer: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px',
    submitBtn: {
      padding: '18px',
      fontSize: '15px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginTop: '8px',
      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    },letterSpacing: '0.5px',
      textTransform: 'uppercase'
    },
    message: {
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
      fontWeight: '500'
    },
    messageError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    messageSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    messageInfo: {
      backgroundColor: '#dbeafe',
    footer: {
      marginTop: '32px',
      paddingTop: '28px',
      borderTop: '1px solid #e2e8f0',
      textAlign: 'center',
      fontSize: '13px',
      color: '#64748b'
    },textAlign: 'center',
      fontSize: '13px',
      color: '#64748b'
    },
    backLink: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: 'transparent'
    },
    securityFooter: {
      marginTop: '12px',
      fontSize: '11px',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    sessionInfo: {
      marginTop: '16px',
      padding: '12px 16px',
      backgroundColor: '#f1f5f9',
      borderRadius: '8px',
      fontSize: '11px',
      color: '#64748b',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <div style={styles.icon}>🔐</div>
            <div style={styles.securityBadge}>✓</div>
          </div>
          <h1 style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>Authorized Personnel Only</p>
        </div>

        <div style={styles.warningBadge}>
          <span style={styles.warningIcon}>⚠️</span>
          <p style={styles.warningText}>
            This area is restricted. Unauthorized access attempts will be logged and reported to security.
          </p>
        </div>

        {loginAttempts > 0 && !isLocked && (
          <div style={styles.attemptsWarning}>
            <span>🚨</span>
            <p style={styles.attemptsText}>
              Failed attempts: {loginAttempts}/3. Account will be locked after 3 failed attempts.
            </p>
          </div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              📧 Admin Email
            </label>
            <input
              type="email"
              style={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              required
              autoComplete="username"
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
              disabled={isLocked}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              🔑 Password
            </label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{...styles.input, paddingRight: '48px'}}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLocked}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {msg && (
            <div style={{
              ...styles.message,
              ...(msg.includes('✅') ? styles.messageSuccess : 
                  msg.includes('❌') ? styles.messageError : 
                  styles.messageInfo)
            }}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: (loading || isLocked) ? 0.5 : 1,
              cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
              transform: 'translateY(0)'
            }}
            disabled={loading || isLocked}
            onMouseOver={(e) => {
              if (!loading && !isLocked) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
            }}
          >
            {isLocked ? '🔒 Account Locked' : loading ? '🔄 Authenticating...' : '🚀 Access Admin Panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <a 
            href="#admin-forgot-password"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#eff6ff';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.textDecoration = 'none';
            }}
          >
            🔑 Forgot Password?
          </a>
        </div>

        <div style={styles.footer}>
          <a 
            href="#login" 
            style={styles.backLink}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#eff6ff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ← Back to Customer Portal
          </a>
          
          <div style={styles.sessionInfo}>
            <span>🛡️ Secure Connection</span>
            <span>Session: {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div style={styles.securityFooter}>
            <span>🔒</span>
            <span>256-bit SSL Encrypted</span>
            <span>•</span>
            <span>All attempts logged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
