// Admin Settings Component - Secure credential management
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminSettings() {
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
    if (!formData.newEmail && !formData.newUsername && !formData.newPassword) {
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
  // STYLES
  // ============================================================
  
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f7fa'
    },
    header: {
      backgroundColor: '#1e1b4b',
      color: 'white',
      padding: '20px 32px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      margin: 0
    },
    backBtn: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: '#3b82f6',
      color: 'white',
      transition: 'all 0.2s'
    },
    content: {
      maxWidth: '800px',
      margin: '40px auto',
      padding: '0 20px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e1b4b',
      marginBottom: '24px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '12px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    infoItem: {
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    label: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: '4px'
    },
    value: {
      fontSize: '16px',
      color: '#1f2937',
      fontWeight: '500'
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
      padding: '12px 40px 12px 12px',
      borderRadius: '8px',
      border: '2px solid #e5e7eb',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
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
      height: '4px',
      backgroundColor: '#e5e7eb',
      borderRadius: '2px',
      overflow: 'hidden',
      marginTop: '8px'
    },
    strengthFill: {
      height: '100%',
      transition: 'all 0.3s'
    },
    strengthLabel: {
      fontSize: '12px',
      marginTop: '4px',
      fontWeight: '500'
    },
    hint: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    message: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    submitBtn: {
      padding: '14px 28px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      backgroundColor: '#10b981',
      color: 'white',
      transition: 'all 0.2s',
      marginTop: '8px'
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>⏳ Loading settings...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Settings</h1>
        <button style={styles.backBtn} onClick={goToDashboard}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {/* Current Profile Information */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📋 Current Profile</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.label}>Username</div>
              <div style={styles.value}>{admin?.username}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.label}>Name</div>
              <div style={styles.value}>{admin?.name}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.label}>Email</div>
              <div style={styles.value}>{admin?.email}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.label}>Account Status</div>
              <div style={{...styles.value, color: '#10b981'}}>
                {admin?.isVerified ? '✓ Verified' : '⚠ Not Verified'}
              </div>
            </div>
          </div>
        </div>

        {/* Update Credentials Form */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>🔐 Update Credentials</h2>
          
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
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => togglePasswordVisibility('current')}
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
              />
              <div style={styles.hint}>At least 3 characters, letters, numbers, and underscores only</div>
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
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => togglePasswordVisibility('new')}
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
                  />
                  <button
                    type="button"
                    style={styles.eyeButton}
                    onClick={() => togglePasswordVisibility('confirm')}
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
            >
              {updating ? '⏳ Updating...' : '💾 Update Credentials'}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div style={{
          ...styles.card,
          backgroundColor: '#fef3c7',
          border: '2px solid #fbbf24'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#92400e' }}>🔒 Security Notice</h3>
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
