// client/src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>🔐 Reset Password</h3>
      
      <form onSubmit={submit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email"
            placeholder="Email" 
            value={form.email} 
            readOnly
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: '#f5f5f5',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="New Password" 
            value={form.newPassword} 
            onChange={e => setForm({...form, newPassword: e.target.value})} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.newPassword ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {form.newPassword && passwordErrors.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#f44336' }}>
              <div>Password requirements:</div>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {passwordErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
          {errors.newPassword && <small style={{ color: '#f44336', display: 'block', marginTop: '5px' }}>{errors.newPassword}</small>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="Confirm New Password" 
            value={form.confirmPassword} 
            onChange={e => setForm({...form, confirmPassword: e.target.value})} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.confirmPassword ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {errors.confirmPassword && <small style={{ color: '#f44336' }}>{errors.confirmPassword}</small>}
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
          {loading ? 'Resetting...' : 'Reset Password'}
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
        <a href="#login" style={{ color: '#2196f3', textDecoration: 'none' }}>← Back to Login</a>
      </div>
    </div>
  );
}
