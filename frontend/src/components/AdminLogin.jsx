// Admin Login Component - Separate from user login
import React, { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '', adminKey: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.email || !form.password || !form.adminKey) {
      setMsg('❌ All fields are required');
      return;
    }

    setLoading(true);
    setMsg('Verifying admin credentials...');

    try {
      const res = await fetch(`${API}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Admin login failed');
      }

      // Store admin token and flag
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      setMsg('✅ Admin login successful! Redirecting...');
      
      setTimeout(() => {
        window.location.hash = '#admin-dashboard';
      }, 1000);

    } catch (err) {
      console.error('Admin login error:', err);
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
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      padding: '20px'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      padding: '48px',
      width: '100%',
      maxWidth: '480px',
      backdropFilter: 'blur(10px)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    icon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1e1b4b',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
    },
    warningBadge: {
      backgroundColor: '#fef3c7',
      border: '2px solid #fbbf24',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '24px',
      textAlign: 'center'
    },
    warningText: {
      color: '#92400e',
      fontSize: '13px',
      fontWeight: '600',
      margin: 0
    },
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
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    input: {
      padding: '12px 16px',
      fontSize: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.2s',
      fontFamily: 'inherit'
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
      padding: '4px'
    },
    submitBtn: {
      padding: '14px',
      fontSize: '16px',
      fontWeight: '600',
      backgroundColor: '#1e1b4b',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '8px'
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
      color: '#1e40af',
      border: '1px solid #bfdbfe'
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '13px',
      color: '#6b7280'
    },
    backLink: {
      color: '#1e1b4b',
      textDecoration: 'none',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🔐</div>
          <h1 style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>Authorized Personnel Only</p>
        </div>

        <div style={styles.warningBadge}>
          <p style={styles.warningText}>
            ⚠️ This area is restricted. Unauthorized access attempts will be logged.
          </p>
        </div>

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
              onFocus={(e) => e.target.style.borderColor = '#1e1b4b'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              🔑 Password
            </label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{...styles.input, width: '100%', paddingRight: '48px'}}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                onFocus={(e) => e.target.style.borderColor = '#1e1b4b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              🛡️ Admin Access Key
            </label>
            <input
              type="password"
              style={styles.input}
              value={form.adminKey}
              onChange={(e) => setForm({ ...form, adminKey: e.target.value })}
              placeholder="Enter admin key"
              required
              autoComplete="off"
              onFocus={(e) => e.target.style.borderColor = '#1e1b4b'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
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
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#312e81';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#1e1b4b';
            }}
          >
            {loading ? '🔄 Authenticating...' : '🚀 Access Admin Panel'}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="#login" style={styles.backLink}>
            ← Back to Customer Portal
          </a>
        </div>
      </div>
    </div>
  );
}
