// Admin Forgot Password Component - OTP-based password recovery
import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0 });
  const [otpTimer, setOtpTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ 
    score: 0, 
    text: '', 
    missing: [],
    feedback: '' 
  });

  useEffect(() => {
    // Generate CAPTCHA on mount
    generateCaptcha();
    
    // Security logging
    console.log('%c🔐 PASSWORD RECOVERY ACCESS', 'color: orange; font-size: 18px; font-weight: bold;');
    console.log(`Access Time: ${new Date().toISOString()}`);
  }, []);

  useEffect(() => {
    // OTP Timer countdown
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2 });
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => {
      if (type === 'error') {
        setMessage({ type: '', text: '' });
      }
    }, 5000);
  }

  function calculatePasswordStrength(password) {
    let score = 0;
    let missing = [];

    if (password.length >= 8) score += 1;
    else missing.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else missing.push('Lowercase letter');

    if (/[A-Z]/.test(password)) score += 1;
    else missing.push('Uppercase letter');

    if (/[0-9]/.test(password)) score += 1;
    else missing.push('Number');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else missing.push('Special character');

    const strengthText = score === 0 ? '' :
                        score === 1 ? 'Very Weak' :
                        score === 2 ? 'Weak' :
                        score === 3 ? 'Medium' :
                        score === 4 ? 'Strong' : 'Very Strong';

    return { 
      score, 
      text: strengthText, 
      missing: missing,
      feedback: missing.join(', ') 
    };
  }

  function handlePasswordChange(value) {
    setPasswords({ ...passwords, newPassword: value });
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
  }

  async function handleSendOTP(e) {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      showMessage('error', '❌ Email address is required');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('error', '❌ Please enter a valid email address');
      return;
    }

    // CAPTCHA validation
    const expectedAnswer = captchaQuestion.num1 + captchaQuestion.num2;
    if (parseInt(captchaValue) !== expectedAnswer) {
      showMessage('error', '❌ CAPTCHA verification failed. Please try again.');
      generateCaptcha();
      setCaptchaValue('');
      return;
    }

    setLoading(true);
    showMessage('info', '⏳ Sending OTP to your email...');

    try {
      console.log('📧 Sending OTP request to:', `${API}/api/auth/admin-send-reset-otp`);
      console.log('📧 Email:', email.trim());
      
      const res = await fetch(`${API}/api/auth/admin-send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      console.log('📧 Response status:', res.status);
      const data = await res.json();
      console.log('📧 Response data:', data);

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to send OTP');
      }

      setStep(2);
      setOtpTimer(600); // 10 minutes
      showMessage('success', '✅ OTP has been sent to your email');
      console.log('✅ Successfully moved to step 2 - OTP sent');
      
    } catch (err) {
      console.error('❌ Send OTP error:', err);
      console.error('❌ Error details:', err.message);
      showMessage('error', '❌ ' + err.message);
      generateCaptcha();
      setCaptchaValue('');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();

    if (!otp.trim()) {
      showMessage('error', '❌ Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      showMessage('error', '❌ OTP must be 6 digits');
      return;
    }

    setLoading(true);
    showMessage('info', '⏳ Verifying OTP...');

    try {
      const res = await fetch(`${API}/api/auth/admin-verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Invalid OTP');
      }

      setStep(3);
      showMessage('success', '✅ OTP verified! Now set your new password');
      
    } catch (err) {
      console.error('Verify OTP error:', err);
      showMessage('error', '❌ ' + err.message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
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
      const res = await fetch(`${API}/api/auth/admin-reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: passwords.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to reset password');
      }

      showMessage('success', '✅ Password reset successful! Redirecting to login...');
      
      setTimeout(() => {
        window.location.hash = '#secret-admin-login';
      }, 2000);
      
    } catch (err) {
      console.error('Reset password error:', err);
      showMessage('error', '❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setLoading(true);
    showMessage('info', '⏳ Resending OTP...');

    try {
      const res = await fetch(`${API}/api/auth/admin-send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to resend OTP');
      }

      setOtpTimer(600);
      setOtp('');
      showMessage('success', '✅ New OTP has been sent to your email');
      
    } catch (err) {
      console.error('Resend OTP error:', err);
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
  }

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
      backdropFilter: 'blur(20px)',
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
      backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      borderRadius: '20px',
      marginBottom: '20px',
      boxShadow: '0 12px 35px rgba(245, 158, 11, 0.4)',
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
      lineHeight: '1.6',
      maxWidth: '400px',
      margin: '0 auto'
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
    input: {
      padding: '14px 16px',
      fontSize: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      color: '#0f172a',
      fontWeight: '500',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
    },
    captchaContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    captchaQuestion: {
      flex: 1,
      padding: '14px 16px',
      backgroundImage: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      border: '2px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: '700',
      color: '#1f2937',
      textAlign: 'center',
      userSelect: 'none'
    },
    captchaInput: {
      flex: 1,
      padding: '14px 16px',
      fontSize: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      fontWeight: '600'
    },
    refreshBtn: {
      padding: '14px',
      backgroundImage: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
    },
    submitBtn: {
      padding: '16px',
      fontSize: '15px',
      fontWeight: '700',
      backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
      letterSpacing: '0.8px',
      textTransform: 'uppercase'
    },
    backLink: {
      textAlign: 'center',
      marginTop: '24px'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
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
    securityNote: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      border: '2px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '24px'
    },
    securityTitle: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#92400e',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    securityText: {
      fontSize: '12px',
      color: '#78350f',
      lineHeight: '1.6',
      margin: '4px 0'
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
      fontSize: '24px',
      fontWeight: '700',
      color: '#065f46',
      marginBottom: '12px'
    },
    successText: {
      fontSize: '15px',
      color: '#047857',
      lineHeight: '1.6',
      marginBottom: '24px'
    },
    emailHighlight: {
      backgroundColor: '#d1fae5',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '700',
      color: '#065f46',
      fontSize: '16px',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.card}>
        
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <div style={styles.header}>
              <div style={styles.iconContainer}>
                <div style={styles.icon}>🔑</div>
              </div>
              <h1 style={styles.title}>Forgot Password?</h1>
              <p style={styles.subtitle}>
                Enter your admin email address to receive a One-Time Password (OTP)
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

            <form style={styles.form} onSubmit={handleSendOTP}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📧 Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  style={styles.input}
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🤖 Security Verification</label>
                <div style={styles.captchaContainer}>
                  <div style={styles.captchaQuestion}>
                    {captchaQuestion.num1} + {captchaQuestion.num2} = ?
                  </div>
                  <input
                    type="number"
                    value={captchaValue}
                    onChange={(e) => setCaptchaValue(e.target.value)}
                    placeholder="Answer"
                    style={styles.captchaInput}
                    disabled={loading}
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    style={styles.refreshBtn}
                    onClick={() => {
                      generateCaptcha();
                      setCaptchaValue('');
                    }}
                    disabled={loading}
                    title="Refresh CAPTCHA"
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                    }}
                  >
                    🔄
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.4)';
                }}
              >
                {loading ? '⏳ Sending OTP...' : '📨 Send OTP Code'}
              </button>
            </form>

            <div style={styles.backLink}>
              <a 
                href="#secret-admin-login" 
                style={styles.link}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                ← Back to Login
              </a>
            </div>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <>
            <div style={styles.header}>
              <div style={styles.iconContainer}>
                <div style={styles.icon}>🔐</div>
              </div>
              <h1 style={styles.title}>Enter OTP Code</h1>
              <p style={styles.subtitle}>
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
              {otpTimer > 0 ? (
                <p style={{fontSize: '14px', color: '#f59e0b', marginTop: '8px', fontWeight: '600'}}>
                  ⏱️ Code expires in: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </p>
              ) : (
                <p style={{fontSize: '14px', color: '#ef4444', marginTop: '8px', fontWeight: '600'}}>
                  ⚠️ OTP has expired. Please request a new one.
                </p>
              )}
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

            <form style={styles.form} onSubmit={handleVerifyOTP}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>🔢 OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  style={{...styles.input, fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontWeight: '700'}}
                  disabled={loading || otpTimer === 0}
                  maxLength="6"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                  }}
                />
              </div>

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading || otpTimer === 0}
                onMouseOver={(e) => {
                  if (!loading && otpTimer > 0) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.4)';
                }}
              >
                {loading ? '⏳ Verifying...' : '✓ Verify OTP'}
              </button>
            </form>

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '12px'}}>
              <button
                onClick={handleResendOTP}
                disabled={loading || otpTimer > 540}
                style={{
                  ...styles.link,
                  background: 'none',
                  border: 'none',
                  cursor: otpTimer > 540 || loading ? 'not-allowed' : 'pointer',
                  opacity: otpTimer > 540 || loading ? 0.5 : 1
                }}
              >
                🔄 Resend OTP {otpTimer > 540 && `(wait ${Math.ceil((600 - otpTimer) / 60)}m)`}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setOtpTimer(0);
                }}
                disabled={loading}
                style={{
                  ...styles.link,
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                ← Change Email
              </button>
            </div>
          </>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <>
            <div style={styles.header}>
              <div style={styles.iconContainer}>
                <div style={styles.icon}>🔒</div>
              </div>
              <h1 style={styles.title}>Set New Password</h1>
              <p style={styles.subtitle}>
                Create a strong password for your admin account
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

            <form style={styles.form} onSubmit={handleResetPassword}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>🔐 New Password</label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter new password"
                    style={styles.input}
                    disabled={loading}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                
                {passwords.newPassword && (
                  <div style={{marginTop: '8px'}}>
                    <div style={{
                      height: '6px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor(passwordStrength.score),
                        transition: 'all 0.3s ease'
                      }} />
                    </div>
                    <p style={{
                      fontSize: '12px',
                      marginTop: '4px',
                      fontWeight: '600',
                      color: getStrengthColor(passwordStrength.score)
                    }}>
                      {passwordStrength.text}
                    </p>
                  </div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🔐 Confirm Password</label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    style={styles.input}
                    disabled={loading}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <p style={{fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: '600'}}>
                    ❌ Passwords do not match
                  </p>
                )}
              </div>

              {passwordStrength?.missing && passwordStrength.missing.length > 0 && (
                <div style={styles.securityNote}>
                  <div style={styles.securityTitle}>
                    <span>📋</span>
                    <span>Password Requirements</span>
                  </div>
                  {passwordStrength.missing.map((req, idx) => (
                    <p key={idx} style={styles.securityText}>❌ {req}</p>
                  ))}
                </div>
              )}

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading || passwordStrength.score < 3}
                onMouseOver={(e) => {
                  if (!loading && passwordStrength.score >= 3) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.4)';
                }}
              >
                {loading ? '⏳ Resetting Password...' : '🔒 Reset Password'}
              </button>
            </form>
          </>
        )}
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
