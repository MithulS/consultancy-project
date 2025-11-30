// Modern, attractive Registration component with single email
import React, { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');
    return errors;
  };

  const passwordErrors = form.password ? validatePassword(form.password) : [];
  const passwordStrength = form.password.length === 0 ? null : 
    passwordErrors.length === 0 ? 'strong' : 
    passwordErrors.length <= 2 ? 'medium' : 'weak';

  const getStrengthColor = () => {
    if (!passwordStrength) return '#e2e8f0';
    if (passwordStrength === 'strong') return '#48bb78';
    if (passwordStrength === 'medium') return '#ed8936';
    return '#f56565';
  };

  const getStrengthWidth = () => {
    if (!passwordStrength) return '0%';
    if (passwordStrength === 'strong') return '100%';
    if (passwordStrength === 'medium') return '66%';
    return '33%';
  };

  async function submit(e) {
    e.preventDefault();
    
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';
    if (passwordErrors.length > 0) newErrors.password = 'Password does not meet requirements';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMsg('');
      return;
    }
    
    setErrors({});
    setMsg('Creating your account...');
    setLoading(true);
    
    try {
      console.log('🚀 Initiating registration request...');
      console.log('📍 API URL:', `${API}/api/auth/register`);
      console.log('📦 Payload:', { username: form.username, name: form.name, email: form.email });
      
      // Add timeout to detect hung requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response received:', res.status, res.statusText);
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${res.status}). Server may be misconfigured.`);
      }
      
      const data = await res.json();
      console.log('📦 Response data:', data);
      
      if (!res.ok) {
        // Server returned error response
        throw new Error(data.msg || data.error || `Registration failed (${res.status})`);
      }
      
      // Success!
      console.log('✅ Registration successful!');
      setMsg('✅ Success! Check your email for verification code. Redirecting...');
      
      // Store email in MULTIPLE locations for redundancy
      try {
        localStorage.setItem('pendingVerificationEmail', form.email);
        sessionStorage.setItem('pendingVerificationEmail', form.email);
        console.log('📧 Email stored in localStorage and sessionStorage');
      } catch (storageError) {
        console.error('⚠️ Storage error:', storageError);
        // Continue anyway - URL param will work as backup
      }
      
      // Clear form
      setForm({ username: '', name: '', email: '', password: '' });
      
      // Redirect with email as URL parameter (backup method)
      const encodedEmail = encodeURIComponent(form.email);
      setTimeout(() => {
        window.location.hash = `#verify-otp?email=${encodedEmail}`;
      }, 2000);
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error type:', err.name);
      console.error('Error message:', err.message);
      
      // Provide specific error messages based on error type
      if (err.name === 'AbortError') {
        setMsg('❌ Request timed out. Server may be slow or offline. Please try again.');
      } else if (err.message === 'Failed to fetch') {
        setMsg('❌ Cannot connect to server. Please check:\n' +
               '1. Backend server is running (npm start in backend folder)\n' +
               '2. Backend is on port 5000\n' +
               '3. Your internet connection');
      } else if (err.message.includes('CORS')) {
        setMsg('❌ CORS error. Backend may not be configured to accept requests from this origin.');
      } else if (err.message.includes('non-JSON')) {
        setMsg('❌ Server error. Backend returned invalid response. Check backend logs.');
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
      maxWidth: '480px',
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
    strengthBar: {
      height: '4px',
      backgroundColor: '#e2e8f0',
      borderRadius: '2px',
      marginTop: '8px',
      overflow: 'hidden',
      position: 'relative'
    },
    strengthFill: {
      height: '100%',
      transition: 'all 0.3s ease',
      borderRadius: '2px'
    },
    strengthText: {
      fontSize: '12px',
      marginTop: '6px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    requirements: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
      fontSize: '13px'
    },
    requirementItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '6px',
      color: '#4a5568'
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
    loginLink: {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join us today - it's free!</p>
        </div>

        <form onSubmit={submit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text"
              placeholder="Choose a unique username"
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})} 
              style={{
                ...styles.input,
                ...(errors.username && styles.inputError)
              }}
              required 
              autoComplete="username"
            />
            {errors.username && (
              <div style={styles.errorText}>
                <span>⚠️</span> {errors.username}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text"
              placeholder="Enter your full name"
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              style={{
                ...styles.input,
                ...(errors.name && styles.inputError)
              }}
              required 
              autoComplete="name"
            />
            {errors.name && (
              <div style={styles.errorText}>
                <span>⚠️</span> {errors.name}
              </div>
            )}
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email"
              placeholder="you@example.com"
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
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
                placeholder="Create a strong password"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                style={{
                  ...styles.input,
                  ...(errors.password && styles.inputError),
                  paddingRight: '48px'
                }}
                required 
                autoComplete="new-password"
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
            
            {form.password && (
              <>
                <div style={styles.strengthBar}>
                  <div style={{
                    ...styles.strengthFill,
                    width: getStrengthWidth(),
                    backgroundColor: getStrengthColor()
                  }}></div>
                </div>
                <div style={{ ...styles.strengthText, color: getStrengthColor() }}>
                  Password Strength: {passwordStrength}
                </div>
              </>
            )}
            
            {form.password && (focusedField === 'password' || passwordErrors.length > 0) && (
              <div style={styles.requirements}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>
                  Password must contain:
                </div>
                {[
                  { text: 'At least 8 characters', valid: form.password.length >= 8 },
                  { text: 'One uppercase letter', valid: /[A-Z]/.test(form.password) },
                  { text: 'One lowercase letter', valid: /[a-z]/.test(form.password) },
                  { text: 'One number', valid: /[0-9]/.test(form.password) },
                  { text: 'One special character', valid: /[!@#$%^&*]/.test(form.password) }
                ].map((req, i) => (
                  <div key={i} style={styles.requirementItem}>
                    <span style={{ fontSize: '16px' }}>
                      {req.valid ? '✅' : '⭕'}
                    </span>
                    <span style={{ color: req.valid ? '#48bb78' : '#718096' }}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {errors.password && (
              <div style={styles.errorText}>
                <span>⚠️</span> {errors.password}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
          >
            {loading ? '⏳ Creating Account...' : 'Create Account'}
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
        
        <div style={styles.loginLink}>
          Already have an account?
          <a href="#login" style={styles.link}>
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}
