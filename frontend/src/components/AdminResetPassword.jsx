// Admin Reset Password Component - Secure password reset with token validation
import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminResetPassword() {
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    const token = params.get('token');

    if (!token) {
      setMessage({ type: 'error', text: '❌ Invalid or missing reset token' });
      setValidatingToken(false);
      return;
    }

    setResetToken(token);
    validateToken(token);

    // Security logging
    console.log('%c🔐 PASSWORD RESET PAGE ACCESS', 'color: orange; font-size: 18px; font-weight: bold;');
    console.log(`Access Time: ${new Date().toISOString()}`);
  }, []);

  async function validateToken(token) {
    try {
      const res = await fetch(`${API}/api/auth/admin-validate-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (data.success) {
        setTokenValid(true);
        setMessage({ type: 'info', text: '✅ Token verified. Please enter your new password.' });
      } else {
        setMessage({ type: 'error', text: '❌ ' + (data.msg || 'Invalid or expired reset link') });
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setMessage({ type: 'error', text: '❌ Failed to validate reset link' });
    } finally {
      setValidatingToken(false);
    }
  }

  function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Uppercase letter');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Number');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Special character');

    const strengthText = score === 0 ? '' :
                        score === 1 ? 'Very Weak' :
                        score === 2 ? 'Weak' :
                        score === 3 ? 'Medium' :
                        score === 4 ? 'Strong' : 'Very Strong';

    return { score, text: strengthText, feedback: feedback.join(', ') };
  }

  function handlePasswordChange(value) {
    setPasswords({ ...passwords, newPassword: value });
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => {
      if (type === 'error') {
        setMessage({ type: '', text: '' });
      }
    }, 5000);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!passwords.newPassword || !passwords.confirmPassword) {
      showMessage('error', '❌ All fields are required');
      return;
    }

    if (passwords.newPassword.length < 8) {
      showMessage('error', '❌ Password must be at least 8 characters long');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showMessage('error', '❌ Passwords do not match');
      return;
    }

    if (passwordStrength.score < 3) {
      showMessage('error', '❌ Password is too weak. Please use a stronger password.');
      return;
    }

    setLoading(true);
    showMessage('info', '⏳ Resetting your password...');

    try {
      const res = await fetch(`${API}/api/auth/admin-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword: passwords.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to reset password');
      }

      setResetSuccess(true);
      showMessage('success', '✅ Password reset successful!');

    } catch (err) {
      console.error('Reset password error:', err);
      showMessage('error', '❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const getStrengthColor = (score) => {
    if (score === 0) return '#e5e7eb';
    if (score <= 2) return '#ef4444';
    if (score === 3) return '#f59e0b';
    return '#10b981';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #2563eb 50%, #1e40af 75%, #1e3a8a 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      backgroundSize: '400% 400%',
      animation: 'gradientFlow 15s ease infinite'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.15) 0%, transparent 50%)',
      pointerEvents: 'none'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4), 0 10px 40px -10px rgba(30, 58, 138, 0.3)',
      padding: '48px 40px',
      width: '100%',
      maxWidth: '520px',
      position: 'relative',
      zIndex: 1,
      border: '1px solid rgba(226, 232, 240, 0.5)',
      animation: 'slideUp 0.6s ease-out'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    iconContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '20px',
      marginBottom: '20px',
      boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
      animation: 'pulse 2s ease-in-out infinite'
    },
    icon: {
      fontSize: '42px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#0f172a',
      marginBottom: '12px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '15px',
      color: '#64748b',
      lineHeight: '1.6'
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
      fontSize: '13px',
      fontWeight: '700',
      color: '#374151',
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    },
    passwordContainer: {
      position: 'relative'
    },
    input: {
      padding: '14px 50px 14px 16px',
      fontSize: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      color: '#0f172a',
      fontWeight: '500',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
      width: '100%',
      boxSizing: 'border-box'
    },
    passwordToggle: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '4px',
      transition: 'all 0.2s ease'
    },
    strengthMeter: {
      marginTop: '8px'
    },
    strengthBar: {
      height: '6px',
      backgroundColor: '#e5e7eb',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '8px'
    },
    strengthFill: {
      height: '100%',
      transition: 'all 0.3s ease',
      borderRadius: '3px'
    },
    strengthText: {
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    requirementsList: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    requirementItem: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    submitBtn: {
      padding: '16px',
      fontSize: '15px',
      fontWeight: '700',
      backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
      letterSpacing: '0.8px',
      textTransform: 'uppercase'
    },
    message: {
      padding: '14px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '16px',
      animation: 'slideDown 0.4s ease-out'
    },
    messageError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '2px solid #fecaca'
    },
    messageSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '2px solid #a7f3d0'
    },
    messageInfo: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      border: '2px solid #93c5fd'
    },
    loader: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '48px',
      animation: 'pulse 1.5s ease-in-out infinite'
    },
    successCard: {
      textAlign: 'center',
      padding: '20px'
    },
    successIcon: {
      fontSize: '72px',
      marginBottom: '20px',
      animation: 'scaleIn 0.6s ease-out'
    },
    successTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#065f46',
      marginBottom: '12px'
    },
    successText: {
      fontSize: '15px',
      color: '#047857',
      lineHeight: '1.6',
      marginBottom: '32px'
    },
    loginBtn: {
      padding: '16px 32px',
      fontSize: '15px',
      fontWeight: '700',
      backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
      textDecoration: 'none',
      display: 'inline-block'
    }
  };

  if (validatingToken) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.card}>
          <div style={styles.loader}>🔄</div>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
            Validating reset link...
          </p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#991b1b', marginBottom: '12px' }}>
              Invalid or Expired Link
            </h2>
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6', marginBottom: '32px' }}>
              {message.text || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <a 
              href="#admin-forgot-password"
              style={styles.loginBtn}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.4)';
              }}
            >
              Request New Reset Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.card}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={styles.successTitle}>Password Reset Successful!</h2>
            <p style={styles.successText}>
              Your admin password has been successfully reset. You can now log in with your new password.
            </p>
            <a 
              href="#secret-admin-login"
              style={styles.loginBtn}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.4)';
              }}
            >
              Go to Admin Login →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <div style={styles.icon}>🔐</div>
          </div>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>
            Create a strong, secure password for your admin account
          </p>
        </div>

        {message.text && (
          <div style={{
            ...styles.message,
            ...(message.type === 'error' ? styles.messageError : 
                message.type === 'success' ? styles.messageSuccess : 
                styles.messageInfo)
          }}>
            {message.text}
          </div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>🔒 New Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter new password"
                style={styles.input}
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                }}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                title={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                {showPasswords.new ? '🙈' : '👁️'}
              </button>
            </div>
            
            {passwords.newPassword && (
              <div style={styles.strengthMeter}>
                <div style={styles.strengthBar}>
                  <div 
                    style={{
                      ...styles.strengthFill,
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: getStrengthColor(passwordStrength.score)
                    }}
                  />
                </div>
                <div style={styles.strengthText}>
                  <span style={{ color: getStrengthColor(passwordStrength.score) }}>
                    {passwordStrength.text}
                  </span>
                  {passwordStrength.score < 5 && (
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      Missing: {passwordStrength.feedback}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>🔒 Confirm Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                style={styles.input}
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                }}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                title={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                {showPasswords.confirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={styles.requirementsList}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Password Requirements:
            </div>
            <div style={styles.requirementItem}>
              <span>{passwords.newPassword.length >= 8 ? '✅' : '⭕'}</span>
              <span>At least 8 characters</span>
            </div>
            <div style={styles.requirementItem}>
              <span>{/[a-z]/.test(passwords.newPassword) ? '✅' : '⭕'}</span>
              <span>One lowercase letter</span>
            </div>
            <div style={styles.requirementItem}>
              <span>{/[A-Z]/.test(passwords.newPassword) ? '✅' : '⭕'}</span>
              <span>One uppercase letter</span>
            </div>
            <div style={styles.requirementItem}>
              <span>{/[0-9]/.test(passwords.newPassword) ? '✅' : '⭕'}</span>
              <span>One number</span>
            </div>
            <div style={styles.requirementItem}>
              <span>{/[^a-zA-Z0-9]/.test(passwords.newPassword) ? '✅' : '⭕'}</span>
              <span>One special character</span>
            </div>
            <div style={styles.requirementItem}>
              <span>{passwords.newPassword && passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword ? '✅' : '⭕'}</span>
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
            }}
          >
            {loading ? '⏳ Resetting Password...' : '🔐 Reset Password'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
