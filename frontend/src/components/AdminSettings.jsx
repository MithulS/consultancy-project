// Admin Settings Component - Secure credential management with modern UI
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminSettings() {
  // Inject CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form fields
  const [formData, setFormData] = useState({
    currentPassword: '',
    newEmail: '',
    newUsername: '',
    newPhoneNumber: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password visibility toggles
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // ============================================================
  // LOAD ADMIN PROFILE ON MOUNT
  // ============================================================
  
  useEffect(() => {
    // Check admin authentication
    const isAdmin = localStorage.getItem('isAdmin');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!isAdmin || !adminToken) {
      window.location.hash = '#secret-admin-login';
      return;
    }

    fetchAdminProfile();
  }, []);

  /**
   * Fetch current admin profile details from backend
   */
  async function fetchAdminProfile() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/api/admin/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      
      if (data.success) {
        setAdmin(data.admin);
      } else {
        showMessage('error', data.msg || 'Failed to load profile');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch profile error:', err);
      showMessage('error', 'Network error. Please check your connection.');
      setLoading(false);
    }
  }

  // ============================================================
  // FORM SUBMISSION - Update Credentials
  // ============================================================
  
  /**
   * Handle form submission to update admin credentials
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    // CLIENT-SIDE VALIDATION
    // Ensure current password is provided
    if (!formData.currentPassword) {
      showMessage('error', 'Current password is required for security verification');
      setUpdating(false);
      return;
    }

    // At least one field must be filled
    if (!formData.newEmail && !formData.newUsername && !formData.newPhoneNumber && !formData.newPassword) {
      showMessage('error', 'Please fill at least one field to update');
      setUpdating(false);
      return;
    }

    // Check if user is trying to update to the same values
    if (formData.newEmail && formData.newEmail.toLowerCase() === admin.email.toLowerCase()) {
      showMessage('error', 'New email is the same as your current email. Please enter a different email or leave it empty.');
      setUpdating(false);
      return;
    }

    if (formData.newUsername && formData.newUsername === admin.username) {
      showMessage('error', 'New username is the same as your current username. Please enter a different username or leave it empty.');
      setUpdating(false);
      return;
    }

    // If changing password, validate confirmation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showMessage('error', 'New password and confirm password do not match');
      setUpdating(false);
      return;
    }

    // Password strength check (client-side)
    if (formData.newPassword && formData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      setUpdating(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      // Build request body with only non-empty fields
      const requestBody = {
        currentPassword: formData.currentPassword
      };
      
      // Only add fields that have values
      if (formData.newEmail && formData.newEmail.trim()) {
        requestBody.newEmail = formData.newEmail.trim();
      }
      if (formData.newUsername && formData.newUsername.trim()) {
        requestBody.newUsername = formData.newUsername.trim();
      }
      if (formData.newPhoneNumber && formData.newPhoneNumber.trim()) {
        requestBody.newPhoneNumber = formData.newPhoneNumber.trim();
      }
      if (formData.newPassword && formData.newPassword.trim()) {
        requestBody.newPassword = formData.newPassword.trim();
        requestBody.confirmPassword = formData.confirmPassword.trim();
      }
      
      console.log('📤 Sending update request:', requestBody);
      
      const res = await fetch(`${API}/api/admin/update-credentials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();
      
      console.log('📥 Server response:', data);

      if (data.success) {
        showMessage('success', data.msg);
        
        // Update local admin data
        setAdmin(data.admin);
        
        // Update localStorage if email changed
        if (formData.newEmail) {
          const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
          adminUser.email = data.admin.email;
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
        }

        // Clear form
        setFormData({
          currentPassword: '',
          newEmail: '',
          newUsername: '',
          newPhoneNumber: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Optionally redirect to login if password changed
        if (formData.newPassword) {
          setTimeout(() => {
            showMessage('info', 'Password changed! Please login again with new credentials...');
            setTimeout(() => {
              logout();
            }, 2000);
          }, 2000);
        }
      } else {
        showMessage('error', data.msg || 'Failed to update credentials');
      }

    } catch (err) {
      console.error('Update credentials error:', err);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  
  /**
   * Display success/error messages with auto-hide
   */
  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  }

  /**
   * Handle input changes
   */
  function handleInputChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Toggle password visibility
   */
  function togglePasswordVisibility(field) {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  }

  /**
   * Logout and return to admin login
   */
  function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    window.location.hash = '#secret-admin-login';
  }

  /**
   * Go back to admin dashboard
   */
  function goToDashboard() {
    window.location.hash = '#admin-dashboard';
  }

  // ============================================================
  // PASSWORD STRENGTH INDICATOR
  // ============================================================
  
  /**
   * Calculate password strength score (0-4)
   */
  function getPasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    return Math.min(strength, 4);
  }

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  // ============================================================
  // MODERN DESIGN SYSTEM STYLES
  // ============================================================
  
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientFlow 15s ease infinite'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      color: '#1e1b4b',
      padding: '24px 40px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      margin: 0,
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    backBtn: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease',
      transition: 'all 0.2s'
    },
    content: {
      maxWidth: '900px',
      margin: '48px auto',
      padding: '0 24px',
      animation: 'fadeIn 0.6s ease-out'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2), 0 2px 8px rgba(0, 0, 0, 0.05)',
      marginBottom: '28px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      animation: 'slideUp 0.7s ease-out'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '28px',
      borderBottom: '3px solid',
      borderImage: 'linear-gradient(90deg, #667eea, #764ba2, transparent) 1',
      paddingBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    infoItem: {
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(244, 147, 251, 0.05))',
      borderRadius: '16px',
      border: '2px solid rgba(102, 126, 234, 0.15)',
      transition: 'all 0.3s ease',
      cursor: 'default'
    },
    label: {
      fontSize: '11px',
      color: '#667eea',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '8px'
    },
    value: {
      fontSize: '18px',
      color: '#1e1b4b',
      fontWeight: '600',
      wordBreak: 'break-word'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    formLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '14px 40px 14px 16px',
      borderRadius: '12px',
      border: '2px solid rgba(102, 126, 234, 0.2)',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500'
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '18px',
      color: '#6b7280'
    },
    strengthBar: {
      height: '6px',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginTop: '12px',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    strengthFill: {
      height: '100%',
      transition: 'all 0.4s ease',
      borderRadius: '8px'
    },
    strengthLabel: {
      fontSize: '13px',
      marginTop: '8px',
      fontWeight: '600'
    },
    hint: {
      fontSize: '13px',
      color: '#764ba2',
      marginTop: '8px',
      fontWeight: '500',
      opacity: 0.8
    },
    message: {
      padding: '16px 20px',
      borderRadius: '16px',
      marginBottom: '24px',
      fontSize: '15px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      animation: 'scaleIn 0.3s ease-out'
    },
    submitBtn: {
      padding: '16px 32px',
      borderRadius: '14px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      transition: 'all 0.3s ease',
      marginTop: '12px',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  if (loading) {
    return (
      <div style={{ 
        ...styles.container, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '6px solid rgba(255, 255, 255, 0.3)',
          borderTop: '6px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h2 style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: '600',
          animation: 'pulse 2s ease-in-out infinite'
        }}>⏳ Loading settings...</h2>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={{
            fontSize: '36px',
            filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
          }}>⚙️</span>
          Admin Settings
        </h1>
        <button 
          style={styles.backBtn} 
          onClick={goToDashboard}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {/* Current Profile Information */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <span style={{ fontSize: '28px' }}>📋</span>
            Current Profile
          </h2>
          <div style={styles.infoGrid}>
            <div 
              style={styles.infoItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)';
              }}
            >
              <div style={styles.label}>👤 Username</div>
              <div style={styles.value}>{admin?.username}</div>
            </div>
            <div 
              style={styles.infoItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)';
              }}
            >
              <div style={styles.label}>✨ Name</div>
              <div style={styles.value}>{admin?.name}</div>
            </div>
            <div 
              style={styles.infoItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)';
              }}
            >
              <div style={styles.label}>📧 Email</div>
              <div style={styles.value}>{admin?.email}</div>
            </div>
            <div 
              style={styles.infoItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)';
              }}
            >
              <div style={styles.label}>📞 Phone Number</div>
              <div style={styles.value}>{admin?.phoneNumber || <span style={{opacity: 0.5, fontStyle: 'italic'}}>Not set</span>}</div>
            </div>
            <div 
              style={styles.infoItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)';
              }}
            >
              <div style={styles.label}>🛡️ Account Status</div>
              <div style={{...styles.value, color: '#10b981'}}>
                {admin?.isVerified ? '✓ Verified' : '⚠ Not Verified'}
              </div>
            </div>
          </div>
        </div>

        {/* Update Credentials Form */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <span style={{ fontSize: '28px' }}>🔐</span>
            Update Credentials
          </h2>
          
          {/* Success/Error Messages */}
          {message.text && (
            <div style={{
              ...styles.message,
              backgroundColor: message.type === 'success' ? '#d1fae5' : message.type === 'info' ? '#dbeafe' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : message.type === 'info' ? '#1e40af' : '#991b1b'
            }}>
              {message.type === 'success' && '✅ '}
              {message.type === 'error' && '❌ '}
              {message.type === 'info' && 'ℹ️ '}
              {message.text}
            </div>
          )}

          <form style={styles.form} onSubmit={handleSubmit}>
            {/* Current Password - Required for Security */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Current Password *</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  style={styles.input}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    e.target.style.transform = 'scale(1.01)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => togglePasswordVisibility('current')}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.color = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div style={styles.hint}>Required to verify your identity</div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

            {/* New Email */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>New Email (optional)</label>
              <input
                type="email"
                name="newEmail"
                style={styles.input}
                value={formData.newEmail}
                onChange={handleInputChange}
                placeholder="Enter new email address"
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'scale(1.01)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'scale(1)';
                }}
              />
              <div style={styles.hint}>Must be a valid email format (e.g., admin@example.com)</div>
            </div>

            {/* New Username */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>New Username (optional)</label>
              <input
                type="text"
                name="newUsername"
                style={styles.input}
                value={formData.newUsername}
                onChange={handleInputChange}
                placeholder="Enter new username"
                minLength={3}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'scale(1.01)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'scale(1)';
                }}
              />
              <div style={styles.hint}>At least 3 characters, letters, numbers, and underscores only</div>
            </div>

            {/* New Phone Number */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>📞 Phone Number (optional)</label>
              <input
                type="tel"
                name="newPhoneNumber"
                style={styles.input}
                value={formData.newPhoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number (e.g., +91-9876543210)"
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  e.target.style.transform = 'scale(1.01)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'scale(1)';
                }}
              />
              <div style={styles.hint}>Used for out-of-stock notifications. Format: +country-number or any format</div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

            {/* New Password */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>New Password (optional)</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  style={styles.input}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  minLength={6}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    e.target.style.transform = 'scale(1.01)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => togglePasswordVisibility('new')}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.color = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <>
                  <div style={styles.strengthBar}>
                    <div style={{
                      ...styles.strengthFill,
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: strengthColors[passwordStrength]
                    }}></div>
                  </div>
                  <div style={{
                    ...styles.strengthLabel,
                    color: strengthColors[passwordStrength]
                  }}>
                    Strength: {strengthLabels[passwordStrength]}
                  </div>
                </>
              )}
              
              <div style={styles.hint}>
                Must contain: Uppercase, lowercase, number. Minimum 6 characters.
              </div>
            </div>

            {/* Confirm New Password */}
            {formData.newPassword && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Confirm New Password *</label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    style={{
                      ...styles.input,
                      borderColor: formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? '#ef4444' : '#e5e7eb'
                    }}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter new password"
                    required={!!formData.newPassword}
                    onFocus={(e) => {
                      const isMatch = formData.newPassword === formData.confirmPassword;
                      e.target.style.borderColor = isMatch ? '#667eea' : '#ef4444';
                      e.target.style.boxShadow = isMatch ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : '0 0 0 3px rgba(239, 68, 68, 0.1)';
                      e.target.style.transform = 'scale(1.01)';
                    }}
                    onBlur={(e) => {
                      const isMatch = formData.newPassword === formData.confirmPassword;
                      e.target.style.borderColor = isMatch ? 'rgba(102, 126, 234, 0.2)' : '#ef4444';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  <button
                    type="button"
                    style={styles.eyeButton}
                    onClick={() => togglePasswordVisibility('confirm')}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.color = '#6b7280';
                    }}
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <div style={{ ...styles.hint, color: '#ef4444' }}>
                    ⚠️ Passwords do not match
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{
                ...styles.submitBtn,
                opacity: updating ? 0.7 : 1,
                cursor: updating ? 'not-allowed' : 'pointer'
              }}
              disabled={updating}
              onMouseEnter={(e) => {
                if (!updating) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.4)';
                  e.target.style.background = 'linear-gradient(135deg, #059669, #10b981)';
                }
              }}
              onMouseLeave={(e) => {
                if (!updating) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
                  e.target.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
                }
              }}
            >
              {updating ? '⏳ Updating...' : '💾 Update Credentials'}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div style={{
          ...styles.card,
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: '#92400e',
            fontSize: '20px',
            fontWeight: 700
          }}>
            <span style={{ fontSize: '24px' }}>🔒</span>
            {' '}Security Notice
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
            <li>Always use a strong, unique password for your admin account</li>
            <li>If you change your password, you'll be logged out and need to login again</li>
            <li>Email changes require the current password for verification</li>
            <li>All credential updates are logged for security audit purposes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
