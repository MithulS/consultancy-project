// Enhanced OTP Verification - Email-less, streamlined UX
import React, { useState, useEffect, useRef } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VerifyOTPEnhanced() {
  // Get email from multiple sources with fallback chain
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmail = urlParams.get('email') ? decodeURIComponent(urlParams.get('email')) : '';
  const localEmail = localStorage.getItem('pendingVerificationEmail') || '';
  const sessionEmail = sessionStorage.getItem('pendingVerificationEmail') || '';
  const storedEmail = localEmail || sessionEmail || urlEmail || '';
  
  // OTP digits (6 individual inputs)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success', 'error', 'info'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [canResend, setCanResend] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  
  // Refs for input fields
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Initialize countdown timer
  useEffect(() => {
    console.group('🔐 OTP Verification Initialization');
    console.log('📧 Email from localStorage:', localEmail || 'NOT FOUND');
    console.log('📧 Email from sessionStorage:', sessionEmail || 'NOT FOUND');
    console.log('📧 Email from URL:', urlEmail || 'NOT FOUND');
    console.log('📧 Final email:', storedEmail || 'NONE AVAILABLE');
    console.log('💾 LocalStorage keys:', Object.keys(localStorage));
    console.log('🕒 OTP expiry:', localStorage.getItem('otpExpiry'));
    console.log('🌐 Current URL:', window.location.href);
    console.log('📍 Hash:', window.location.hash);
    console.log('🔍 Referrer:', document.referrer);
    console.groupEnd();
    
    // Check if email exists
    if (!storedEmail) {
      console.error('❌ CRITICAL: No email found in any storage location');
      setMsg('⚠️ No email address found in session. This usually happens when your browser cleared stored data or you navigated directly to this page.');
      setMsgType('error');
      setShowManualEmailInput(true);
      return;
    }

    // Initialize or restore countdown
    const expiryTime = localStorage.getItem('otpExpiry');
    if (expiryTime) {
      const remaining = Math.floor((new Date(expiryTime) - new Date()) / 1000);
      if (remaining > 0) {
        setTimeRemaining(remaining);
        console.log('⏱️ Countdown restored:', remaining, 'seconds');
      } else {
        console.log('⏱️ OTP expired');
        setCanResend(true);
        setMsg('Your OTP has expired. Please request a new one.');
        setMsgType('error');
      }
    } else {
      // Set initial 10-minute expiry
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      localStorage.setItem('otpExpiry', expiry.toISOString());
      setTimeRemaining(600); // 10 minutes in seconds
      console.log('⏱️ Countdown started: 10 minutes');
    }

    // Focus first input on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [storedEmail]);

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timeRemaining === 0) {
        setCanResend(true);
        setMsg('Your OTP has expired. Please request a new one.');
        setMsgType('error');
      }
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

  const handleDigitChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Clear error message when user starts typing
    if (msg && msgType === 'error') {
      setMsg('');
      setMsgType('');
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...otpDigits];
      
      if (otpDigits[index]) {
        // Clear current digit
        newDigits[index] = '';
        setOtpDigits(newDigits);
      } else if (index > 0) {
        // Move to previous digit and clear it
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs[index - 1].current?.focus();
      }
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      // Paste will be handled by onPaste event
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only accept 6-digit pastes
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split('');
      setOtpDigits(newDigits);
      // Focus last input
      inputRefs[5].current?.focus();
      
      setMsg('');
      setMsgType('');
    }
  };

  const getOtpString = () => otpDigits.join('');

  async function verify(e) {
    e.preventDefault();
    
    const otpString = getOtpString();
    
    if (otpString.length !== 6) {
      setMsg('Please enter all 6 digits');
      setMsgType('error');
      return;
    }
    
    // Check email is present before proceeding
    if (!storedEmail) {
      console.error('❌ No email available for verification');
      setMsg('❌ Email address missing. Please return to registration.');
      setMsgType('error');
      setShowManualEmailInput(true);
      return;
    }
    
    if (isLocked) {
      setMsg('Account is locked due to too many failed attempts. Please wait 15 minutes.');
      setMsgType('error');
      return;
    }

    if (canResend && timeRemaining === 0) {
      setMsg('Your OTP has expired. Please request a new one.');
      setMsgType('error');
      return;
    }
    
    setMsg('Verifying your code...');
    setMsgType('info');
    setLoading(true);
    
    try {
      console.log('🔐 Verifying OTP...');
      console.log('📧 Email:', storedEmail);
      console.log('🔢 OTP:', otpString);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: storedEmail, otp: otpString }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please try again.');
      };
      
      const data = await res.json();
      console.log('📡 Response:', res.status, data);
      
      if (!res.ok) {
        // Handle "already verified" case
        if (res.status === 400 && data.msg && data.msg.toLowerCase().includes('already verified')) {
          console.log('✅ User already verified - redirecting to login');
          setMsg('✅ Your email is already verified! Redirecting to login...');
          setMsgType('success');
          
          // Store success message for login page
          sessionStorage.setItem('loginMessage', 'Email already verified. You can now log in.');
          sessionStorage.setItem('loginMessageType', 'success');
          
          // Clear OTP storage
          localStorage.removeItem('pendingVerificationEmail');
          localStorage.removeItem('otpExpiry');
          
          // Redirect after 2 seconds
          setTimeout(() => {
            window.location.hash = '#login';
          }, 2000);
          return;
        }
        
        // Handle "user not found" case
        if (res.status === 400 && data.msg && data.msg.toLowerCase().includes('no user found')) {
          console.error('❌ User not found in database');
          setMsg('❌ Account not found. Please register first.');
          setMsgType('error');
          
          // Redirect to registration after 3 seconds
          setTimeout(() => {
            window.location.hash = '#register';
          }, 3000);
          return;
        }
        
        if (res.status === 429 || res.status === 423) {
          // Account locked
          setIsLocked(true);
          setMsg(data.msg || 'Account locked due to too many failed attempts. Please wait 15 minutes.');
          setMsgType('error');
        } else if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          setMsg(`Incorrect code. ${data.attemptsRemaining} attempt${data.attemptsRemaining !== 1 ? 's' : ''} remaining.`);
          setMsgType('error');
          // Clear OTP inputs
          setOtpDigits(['', '', '', '', '', '']);
          inputRefs[0].current?.focus();
        } else {
          throw new Error(data.msg || 'Verification failed');
        }
      } else {
        // Success!
        console.log('✅ Verification successful!');
        setMsg('✅ Email verified successfully! Redirecting to login...');
        setMsgType('success');
        
        // Store success message for login page
        sessionStorage.setItem('loginMessage', '✅ Email verified successfully! You can now log in.');
        sessionStorage.setItem('loginMessageType', 'success');
        
        // Clear stored data
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('otpExpiry');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.hash = '#login';
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      
      // Specific error messages
      if (err.name === 'AbortError') {
        setMsg('❌ Request timed out. Please check your connection and try again.');
      } else if (err.message === 'Failed to fetch') {
        setMsg('❌ Cannot connect to server. Please check your internet connection.');
      } else if (err.message.includes('JSON') || err.message.includes('invalid response')) {
        setMsg('❌ Server error. Please try again later.');
      } else {
        setMsg('❌ ' + (err.message || 'Verification failed. Please try again.'));
      }
      
      setMsgType('error');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!storedEmail) {
      setMsg('No email found. Please register first.');
      setMsgType('error');
      return;
    }
    
    setMsg('Resending verification code...');
    setMsgType('info');
    setResending(true);
    
    try {
      console.log('🔄 Resending OTP to:', storedEmail);
      
      const res = await fetch(`${API}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: storedEmail })
      });
      
      const data = await res.json();
      console.log('📡 Resend response:', res.status, data);
      
      if (!res.ok) {
        throw new Error(data.msg || 'Failed to resend code');
      }
      
      setMsg('✅ New code sent! Please check your email.');
      setMsgType('success');
      
      // Reset countdown
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      localStorage.setItem('otpExpiry', expiry.toISOString());
      setTimeRemaining(600);
      setCanResend(false);
      
      // Clear OTP inputs
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
      
    } catch (err) {
      console.error('❌ Resend error:', err);
      setMsg(err.message || 'Failed to resend code. Please try again.');
      setMsgType('error');
    } finally {
      setResending(false);
    }
  }

  const getTimerColor = () => {
    if (timeRemaining === null) return '#48bb78';
    if (timeRemaining > 300) return '#48bb78'; // Green (>5 min)
    if (timeRemaining > 60) return '#ed8936';  // Orange (1-5 min)
    return '#f56565'; // Red (<1 min)
  };

  const getMaskedEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (local.length <= 3) return email;
    return `${local.substring(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
  };

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
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1a202c',
      marginBottom: '12px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#718096',
      marginBottom: '40px',
      lineHeight: '1.5'
    },
    timerBox: {
      backgroundColor: '#f7fafc',
      borderRadius: '12px',
      border: '2px dashed #e2e8f0',
      padding: '24px',
      marginBottom: '32px'
    },
    timerLabel: {
      fontSize: '14px',
      color: '#4a5568',
      marginBottom: '8px',
      fontWeight: '500'
    },
    timerValue: {
      fontSize: '48px',
      fontWeight: '700',
      color: getTimerColor(),
      fontFamily: 'monospace',
      letterSpacing: '4px'
    },
    emailLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '12px',
      textAlign: 'left'
    },
    emailDisplay: {
      backgroundColor: '#f7fafc',
      padding: '14px 16px',
      borderRadius: '12px',
      fontSize: '16px',
      color: '#4a5568',
      marginBottom: '32px',
      border: '2px solid #e2e8f0'
    },
    otpLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '12px',
      textAlign: 'left'
    },
    otpContainer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '32px'
    },
    otpInput: {
      width: '56px',
      height: '56px',
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: '#f7fafc',
      color: '#2d3748',
      fontFamily: 'monospace'
    },
    otpInputFilled: {
      backgroundColor: 'white',
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '12px'
    },
    verifyButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    },
    verifyButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)'
    },
    verifyButtonDisabled: {
      background: '#cbd5e0',
      cursor: 'not-allowed',
      boxShadow: 'none'
    },
    resendButton: {
      backgroundColor: 'white',
      color: '#667eea',
      border: '2px solid #e2e8f0'
    },
    resendButtonDisabled: {
      backgroundColor: '#f7fafc',
      color: '#cbd5e0',
      cursor: 'not-allowed'
    },
    message: {
      padding: '14px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      marginBottom: '24px',
      textAlign: 'center',
      fontWeight: '500'
    },
    messageSuccess: {
      backgroundColor: '#c6f6d5',
      color: '#22543d',
      border: '2px solid #9ae6b4'
    },
    messageError: {
      backgroundColor: '#fed7d7',
      color: '#742a2a',
      border: '2px solid #fc8181'
    },
    messageInfo: {
      backgroundColor: '#bee3f8',
      color: '#2c5282',
      border: '2px solid #90cdf4'
    },
    helpText: {
      fontSize: '14px',
      color: '#718096',
      marginTop: '24px',
      lineHeight: '1.6'
    },
    manualEmailSection: {
      backgroundColor: '#fffaf0',
      border: '2px solid #fbd38d',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      textAlign: 'left'
    },
    manualEmailTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#744210',
      marginBottom: '12px'
    },
    manualEmailText: {
      fontSize: '14px',
      color: '#7c2d12',
      marginBottom: '16px',
      lineHeight: '1.6'
    },
    emailInput: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      marginBottom: '12px',
      outline: 'none',
      transition: 'border 0.3s ease',
      boxSizing: 'border-box'
    },
    continueButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    optionButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: 'white',
      color: '#667eea',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '12px',
      transition: 'all 0.3s ease',
      textAlign: 'left'
    },
    bulletList: {
      textAlign: 'left',
      paddingLeft: '20px',
      marginBottom: '20px',
      lineHeight: '1.8',
      color: '#4a5568'
    },
    icon: {
      fontSize: '20px',
      marginRight: '4px'
    },
    attemptsWarning: {
      fontSize: '13px',
      color: '#c05621',
      marginTop: '12px',
      padding: '10px',
      backgroundColor: '#feebc8',
      borderRadius: '8px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Verify Your Email</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to your email
        </p>

        {/* Manual Email Input Recovery Section */}
        {showManualEmailInput && (
          <div style={styles.manualEmailSection}>
            <h3 style={styles.manualEmailTitle}>⚠️ Session Not Found</h3>
            <p style={styles.manualEmailText}>
              We couldn't find your email address. This usually happens when:
            </p>
            <ul style={styles.bulletList}>
              <li>🔗 You navigated directly to this page</li>
              <li>🧹 Your browser cleared stored data</li>
              <li>🔒 Private/Incognito mode restrictions</li>
              <li>⏰ Session expired ({'>'} 30 minutes)</li>
            </ul>
            
            <p style={styles.manualEmailText}>
              <strong>Enter your email to continue:</strong>
            </p>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              style={styles.emailInput}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            
            <button
              type="button"
              onClick={() => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(manualEmail)) {
                  // Store in all locations
                  localStorage.setItem('pendingVerificationEmail', manualEmail);
                  sessionStorage.setItem('pendingVerificationEmail', manualEmail);
                  console.log('✅ Email manually entered and stored:', manualEmail);
                  
                  // Update URL
                  const encodedEmail = encodeURIComponent(manualEmail);
                  window.location.hash = `#verify-otp?email=${encodedEmail}`;
                  
                  // Reload page to reinitialize with new email
                  window.location.reload();
                } else {
                  setMsg('❌ Please enter a valid email address');
                  setMsgType('error');
                }
              }}
              style={styles.continueButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5568d3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              Continue with this email
            </button>
            
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => window.location.hash = '#register'}
                style={styles.optionButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f7fafc'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                🔄 Register a new account instead
              </button>
              
              <button
                type="button"
                onClick={() => window.location.hash = '#login'}
                style={styles.optionButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f7fafc'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                🔑 Already verified? Go to login
              </button>
            </div>
          </div>
        )}

        {/* Countdown Timer */}
        {!showManualEmailInput && (
          <>
            <div style={styles.timerBox}>
              <div style={styles.timerLabel}>Code expires in:</div>
              <div style={styles.timerValue}>
                {timeRemaining !== null && timeRemaining > 0 
                  ? formatTime(timeRemaining)
                  : '0:00'}
              </div>
            </div>

            {/* Email Display (masked) */}
            <div style={{ textAlign: 'left' }}>
              <label style={styles.emailLabel}>Email Address</label>
            </div>
            <div style={styles.emailDisplay}>
              {getMaskedEmail(storedEmail) || 'you@example.com'}
            </div>

            {/* Message Display */}
            {msg && (
              <div style={{
                ...styles.message,
                ...(msgType === 'success' ? styles.messageSuccess : 
                    msgType === 'error' ? styles.messageError : 
                    styles.messageInfo)
              }}>
                {msg}
              </div>
            )}

            {/* OTP Input */}
            <form onSubmit={verify}>
          <div style={{ textAlign: 'left' }}>
            <label style={styles.otpLabel}>Verification Code</label>
          </div>
          
          <div style={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={loading}
                aria-label={`Digit ${index + 1} of 6`}
                style={{
                  ...styles.otpInput,
                  ...(digit ? styles.otpInputFilled : {})
                }}
              />
            ))}
          </div>

          {/* Attempts Warning */}
          {attemptsRemaining < 5 && attemptsRemaining > 0 && !isLocked && (
            <div style={styles.attemptsWarning}>
              ⚠️ {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
            </div>
          )}

          {/* Locked Warning */}
          {isLocked && (
            <div style={{...styles.attemptsWarning, backgroundColor: '#fed7d7', color: '#742a2a'}}>
              🔒 Account locked. Please wait 15 minutes before trying again.
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || isLocked || getOtpString().length !== 6 || showManualEmailInput}
            style={{
              ...styles.button,
              ...styles.verifyButton,
              ...(loading || isLocked || getOtpString().length !== 6 ? styles.verifyButtonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading && !isLocked && getOtpString().length === 6) {
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? (
              <>
                <span style={styles.icon}>⏳</span> Verifying...
              </>
            ) : (
              <>
                <span style={styles.icon}>✓</span> Verify Email
              </>
            )}
          </button>

          {/* Resend Button */}
          <button
            type="button"
            onClick={resend}
            disabled={resending || !canResend || isLocked || showManualEmailInput}
            style={{
              ...styles.button,
              ...styles.resendButton,
              ...(resending || !canResend || isLocked ? styles.resendButtonDisabled : {})
            }}
          >
            {resending ? (
              <>
                <span style={styles.icon}>⏳</span> Sending...
              </>
            ) : canResend ? (
              <>
                <span style={styles.icon}>🔄</span> Resend Code
              </>
            ) : (
              <>
                <span style={styles.icon}>🔄</span> Resend (wait {formatTime(timeRemaining || 0)})
              </>
            )}
          </button>
        </form>

            {/* Help Text */}
            <div style={styles.helpText}>
              <p>
                <span style={styles.icon}>💡</span> 
                <strong>Didn't receive the code?</strong>
              </p>
              <p style={{ margin: '8px 0 0 0' }}>
                Check your spam folder or click "Resend Code" after the timer expires.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
