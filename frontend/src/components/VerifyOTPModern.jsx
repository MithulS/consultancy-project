// Modern OTP Verification Component with countdown timer and retry logic
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VerifyOTPModern() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [canResend, setCanResend] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Start 10-minute countdown when component mounts
    const expiryTime = localStorage.getItem('otpExpiry');
    if (expiryTime) {
      const remaining = Math.floor((new Date(expiryTime) - new Date()) / 1000);
      if (remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        setCanResend(true);
      }
    } else {
      // Set 10-minute expiry
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      localStorage.setItem('otpExpiry', expiry.toISOString());
      setTimeRemaining(600); // 10 minutes in seconds
    }
  }, []);

  useEffect(() => {
    if (timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function verify(e) {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setMsg('❌ Invalid email format');
      return;
    }
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setMsg('❌ OTP must be 6 digits');
      return;
    }
    
    if (isLocked) {
      setMsg('❌ Account is locked. Please wait before trying again.');
      return;
    }
    
    setMsg('Verifying your code...');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          // Account locked
          setIsLocked(true);
          setMsg(`🔒 ${data.msg}`);
        } else if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          setMsg(`❌ ${data.msg}`);
        } else {
          throw new Error(data.msg || 'Verification failed');
        }
      } else {
        setMsg('✅ Email verified successfully! Redirecting to login...');
        localStorage.removeItem('otpExpiry');
        setEmail('');
        setOtp('');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.hash = '#login';
        }, 2000);
      }
    } catch (err) {
      console.error('Verify error', err);
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!validateEmail(email)) {
      setMsg('❌ Please enter a valid email first');
      return;
    }
    
    setMsg('Resending OTP...');
    setResending(true);
    
    try {
      const res = await fetch(`${API}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.msg || 'Resend failed');
      
      setMsg('✅ New OTP sent to your email!');
      setOtp('');
      
      // Reset timer
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      localStorage.setItem('otpExpiry', expiry.toISOString());
      setTimeRemaining(600);
      setCanResend(false);
      setAttemptsRemaining(5);
      setIsLocked(false);
    } catch (err) {
      console.error('Resend error', err);
      setMsg('❌ ' + err.message);
    } finally {
      setResending(false);
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
      maxWidth: '480px',
      width: '100%',
      padding: '48px 40px',
      animation: 'slideUp 0.4s ease-out'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    icon: {
      fontSize: '64px',
      marginBottom: '16px'
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
    timerSection: {
      textAlign: 'center',
      marginBottom: '32px',
      padding: '20px',
      backgroundColor: '#f7fafc',
      borderRadius: '12px',
      border: '2px dashed #cbd5e0'
    },
    timerLabel: {
      fontSize: '14px',
      color: '#4a5568',
      marginBottom: '8px',
      fontWeight: '500'
    },
    timer: {
      fontSize: '36px',
      fontWeight: '700',
      fontFamily: 'monospace',
      letterSpacing: '2px'
    },
    timerActive: {
      color: '#48bb78'
    },
    timerWarning: {
      color: '#ed8936'
    },
    timerExpired: {
      color: '#f56565'
    },
    attemptsInfo: {
      textAlign: 'center',
      marginBottom: '24px',
      padding: '12px',
      backgroundColor: attemptsRemaining <= 2 ? '#fff5f5' : '#f0fff4',
      borderRadius: '8px',
      border: `1px solid ${attemptsRemaining <= 2 ? '#fc8181' : '#9ae6b4'}`
    },
    attemptsText: {
      fontSize: '14px',
      fontWeight: '600',
      color: attemptsRemaining <= 2 ? '#c53030' : '#22543d'
    },
    inputGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '8px'
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
    otpInput: {
      textAlign: 'center',
      fontSize: '24px',
      letterSpacing: '8px',
      fontWeight: '700',
      fontFamily: 'monospace'
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
      marginBottom: '12px'
    },
    buttonSecondary: {
      background: 'white',
      color: '#667eea',
      border: '2px solid #667eea',
      boxShadow: 'none'
    },
    buttonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
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
    messageInfo: {
      backgroundColor: '#e6fffa',
      color: '#234e52',
      border: '1px solid #81e6d9'
    },
    helpText: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#718096',
      marginTop: '24px',
      lineHeight: '1.6'
    }
  };

  const getTimerColor = () => {
    if (timeRemaining === null || timeRemaining > 180) return styles.timerActive;
    if (timeRemaining > 60) return styles.timerWarning;
    return styles.timerExpired;
  };

  const getMessageStyle = () => {
    if (msg.includes('✅')) return { ...styles.message, ...styles.messageSuccess };
    if (msg.includes('❌') || msg.includes('🔒')) return { ...styles.message, ...styles.messageError };
    return { ...styles.message, ...styles.messageInfo };
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
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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
      `}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>📧</div>
          <h1 style={styles.title}>Verify Your Email</h1>
          <p style={styles.subtitle}>Enter the 6-digit code sent to your email</p>
        </div>

        {timeRemaining !== null && (
          <div style={styles.timerSection}>
            <div style={styles.timerLabel}>
              {timeRemaining > 0 ? 'Code expires in:' : 'Code expired'}
            </div>
            <div style={{ ...styles.timer, ...getTimerColor() }}>
              {timeRemaining > 0 ? formatTime(timeRemaining) : '0:00'}
            </div>
          </div>
        )}

        {!isLocked && attemptsRemaining < 5 && (
          <div style={styles.attemptsInfo}>
            <div style={styles.attemptsText}>
              ⚠️ {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
            </div>
          </div>
        )}

        {isLocked && (
          <div style={styles.attemptsInfo}>
            <div style={styles.attemptsText}>
              🔒 Account temporarily locked
            </div>
          </div>
        )}

        <form onSubmit={verify}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email"
              placeholder="you@example.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={styles.input}
              required 
              autoComplete="email"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Verification Code</label>
            <input 
              type="text"
              placeholder="000000"
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              style={{ ...styles.input, ...styles.otpInput }}
              maxLength={6}
              pattern="\d{6}"
              required 
              autoComplete="one-time-code"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || isLocked}
            style={{
              ...styles.button,
              ...((loading || isLocked) && styles.buttonDisabled)
            }}
          >
            {loading ? '⏳ Verifying...' : '✓ Verify Email'}
          </button>

          <button 
            type="button"
            onClick={resend}
            disabled={resending || !canResend || isLocked}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              ...((resending || !canResend || isLocked) && styles.buttonDisabled)
            }}
          >
            {resending ? '⏳ Sending...' : canResend ? '↻ Resend Code' : `↻ Resend (wait ${formatTime(timeRemaining || 0)})`}
          </button>
        </form>
        
        {msg && (
          <div style={getMessageStyle()}>
            {msg}
          </div>
        )}

        <div style={styles.helpText}>
          <p>
            💡 <strong>Didn't receive the code?</strong><br/>
            Check your spam folder or click "Resend Code" after the timer expires.
          </p>
          <p style={{ marginTop: '12px' }}>
            <a href="#login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              ← Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
