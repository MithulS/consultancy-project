// client/src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
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
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes checkmark {
    0% { transform: scale(0) rotate(0deg); }
    50% { transform: scale(1.2) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
  }
`;
if (!document.querySelector('[data-reset-password-styles]')) {
  styleSheet.setAttribute('data-reset-password-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default function ResetPassword() {
  const [form, setForm] = useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    if (token && email) {
      setForm(prev => ({ ...prev, token, email }));
    }
  }, []);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character (!@#$%^&*)');
    return errors;
  };

  const passwordErrors = form.newPassword ? validatePassword(form.newPassword) : [];

  async function submit(e) {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (passwordErrors.length > 0) newErrors.newPassword = 'Password does not meet requirements';
    if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.token || !form.email) newErrors.token = 'Invalid reset link';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMsg('');
      return;
    }
    
    setErrors({});
    setMsg('Resetting password...');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          token: form.token,
          newPassword: form.newPassword
        })
      });
      
      const data = await res.json();
      console.log('Reset password response', res.status, data);
      
      if (!res.ok) throw new Error(data.msg || 'Password reset failed');
      
      setMsg('✅ ' + data.msg);
      setForm({ email: '', token: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Reset password error', err);
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
      maxWidth: '520px',
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
    inputError: {
      borderColor: '#ef4444',
      animation: 'shake 0.5s ease-out'
    },
    inputReadOnly: {
      backgroundColor: 'rgba(241, 245, 249, 0.9)',
      cursor: 'not-allowed'
    },
    requirementsList: {
      marginTop: '12px',
      padding: '12px 16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    requirementsTitle: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#991b1b',
      marginBottom: '8px'
    },
    requirementItem: {
      fontSize: '12px',
      color: '#dc2626',
      marginLeft: '20px',
      marginBottom: '4px'
    },
    errorText: {
      fontSize: '13px',
      color: '#ef4444',
      marginTop: '6px',
      fontWeight: '500'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '700',
      color: 'white',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginTop: '8px'
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
      marginTop: '20px',
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
      borderColor: '#ef4444'
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
      borderRadius: '8px',
      marginTop: '16px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrapper}>
          🔐
        </div>

        {/* Title & Subtitle */}
        <h1 style={styles.title}>Reset Your Password</h1>
        <p style={styles.subtitle}>
          Create a strong new password to secure your account.
        </p>
        
        {/* Form */}
        <form onSubmit={submit}>
          {/* Email (Read-only) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email"
              placeholder="Email" 
              value={form.email} 
              readOnly
              style={{
                ...styles.input,
                ...styles.inputReadOnly
              }}
            />
          </div>
          
          {/* New Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password" 
              value={form.newPassword} 
              onChange={e => setForm({...form, newPassword: e.target.value})} 
              style={{
                ...styles.input,
                ...(errors.newPassword ? styles.inputError : {})
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                if (!errors.newPassword) {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              required 
            />
            {form.newPassword && passwordErrors.length > 0 && (
              <div style={styles.requirementsList}>
                <div style={styles.requirementsTitle}>⚠️ Password requirements:</div>
                {passwordErrors.map((err, i) => (
                  <div key={i} style={styles.requirementItem}>• {err}</div>
                ))}
              </div>
            )}
            {errors.newPassword && (
              <div style={styles.errorText}>❌ {errors.newPassword}</div>
            )}
          </div>
          
          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input 
              type="password" 
              placeholder="Confirm new password" 
              value={form.confirmPassword} 
              onChange={e => setForm({...form, confirmPassword: e.target.value})} 
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {})
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                if (!errors.confirmPassword) {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              required 
            />
            {errors.confirmPassword && (
              <div style={styles.errorText}>❌ {errors.confirmPassword}</div>
            )}
          </div>
          
          {/* Submit Button */}
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
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
              }
            }}
          >
            {loading ? '⏳ Resetting Password...' : '✅ Reset Password'}
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
