// client/src/components/ForgotPassword.jsx
import React, { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Inject CSS animations for modern UI
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
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
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
if (!document.querySelector('[data-forgot-password-styles]')) {
  styleSheet.setAttribute('data-forgot-password-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function submit(e) {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setMsg('❌ Please enter a valid email address');
      return;
    }
    
    setMsg('Sending reset link...');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      console.log('Forgot password response', res.status, data);
      
      if (!res.ok) throw new Error(data.msg || 'Failed to send reset link');
      
      setMsg('✅ ' + data.msg + ' Please check your email inbox and spam folder.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password error', err);
      setMsg('❌ ' + err.message);
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientFlow 15s ease infinite',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '48px',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      animation: 'scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    },
    iconWrapper: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      fontSize: '40px',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
      animation: 'float 3s ease-in-out infinite'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: '12px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '32px',
      lineHeight: '1.6'
    },
    inputGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      fontSize: '16px',
      border: '2px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '700',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '20px'
    },
    buttonDisabled: {
      background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    notification: {
      padding: '16px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideUp 0.5s ease-out',
      border: '1px solid'
    },
    notificationSuccess: {
      background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      color: '#065f46',
      borderColor: '#10b981'
    },
    notificationError: {
      background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      color: '#991b1b',
      borderColor: '#ef4444',
      animation: 'shake 0.5s ease-out'
    },
    backLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#667eea',
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      padding: '12px',
      borderRadius: '8px'
    },
    decorativeBlob1: {
      position: 'absolute',
      top: '-100px',
      right: '-100px',
      width: '300px',
      height: '300px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'float 8s ease-in-out infinite'
    },
    decorativeBlob2: {
      position: 'absolute',
      bottom: '-150px',
      left: '-100px',
      width: '400px',
      height: '400px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      filter: 'blur(80px)',
      animation: 'float 10s ease-in-out infinite reverse'
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative Background Elements */}
      <div style={styles.decorativeBlob1}></div>
      <div style={styles.decorativeBlob2}></div>

      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrapper}>
          🔑
        </div>

        {/* Title & Subtitle */}
        <h1 style={styles.title}>Forgot Password?</h1>
        <p style={styles.subtitle}>
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {/* Form */}
        <form onSubmit={submit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email"
              placeholder="your.email@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
                e.target.style.transform = 'scale(1.01)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'scale(1)';
              }}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
          </button>
        </form>
        
        {/* Notification Messages */}
        {msg && (
          <div style={{
            ...styles.notification,
            ...(msg.includes('✅') ? styles.notificationSuccess : styles.notificationError)
          }}>
            <span style={{ fontSize: '18px' }}>
              {msg.includes('✅') ? '✅' : '❌'}
            </span>
            <span>{msg.replace('✅ ', '').replace('❌ ', '')}</span>
          </div>
        )}
        
        {/* Back to Login Link */}
        <a 
          href="#login" 
          style={styles.backLink}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span>←</span>
          <span>Back to Login</span>
        </a>
      </div>
    </div>
  );
}
