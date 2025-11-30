// client/src/components/Register.jsx
import React, { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character (!@#$%^&*)');
    return errors;
  };

  const passwordErrors = form.password ? validatePassword(form.password) : [];
  const passwordStrength = form.password.length === 0 ? '' : 
    passwordErrors.length === 0 ? 'Strong' : 
    passwordErrors.length <= 2 ? 'Medium' : 'Weak';

  async function submit(e) {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';
    if (passwordErrors.length > 0) newErrors.password = 'Password does not meet requirements';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMsg('');
      return;
    }
    
    setErrors({});
    setMsg('Registering...');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      console.log('Register response', res.status, data);
      if (!res.ok) throw new Error(data.msg || 'Registration failed');
      setMsg('✅ Registered successfully! OTP sent to your email. Please check your inbox.');
      setForm({ username: '', name: '', email: '', password: '' });
    } catch (err) {
      console.error('Register error', err);
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>📝 Register</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            placeholder="Username" 
            value={form.username} 
            onChange={e => setForm({...form, username: e.target.value})} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.username ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {errors.username && <small style={{ color: '#f44336' }}>{errors.username}</small>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            placeholder="Name" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.name ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {errors.name && <small style={{ color: '#f44336' }}>{errors.name}</small>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email"
            placeholder="Email" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.email ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {errors.email && <small style={{ color: '#f44336' }}>{errors.email}</small>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.password ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {form.password && (
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              <div>Password strength: <strong style={{ 
                color: passwordStrength === 'Strong' ? '#4caf50' : 
                       passwordStrength === 'Medium' ? '#ff9800' : '#f44336' 
              }}>{passwordStrength}</strong></div>
              {passwordErrors.length > 0 && (
                <div style={{ marginTop: '5px', color: '#f44336' }}>
                  <div>Requirements:</div>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {passwordErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          {errors.password && <small style={{ color: '#f44336', display: 'block', marginTop: '5px' }}>{errors.password}</small>}
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: loading ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {msg && <p style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: msg.includes('✅') ? '#e8f5e9' : '#ffebee',
        color: msg.includes('✅') ? '#2e7d32' : '#c62828',
        borderRadius: '4px',
        fontSize: '14px'
      }}>{msg}</p>}
      
      <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        <span style={{ color: '#666' }}>Already have an account? </span>
        <a href="#login" style={{ color: '#2196f3', textDecoration: 'none', fontWeight: 'bold' }}>Login here</a>
      </div>
    </div>
  );
}
