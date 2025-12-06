// Password Strength Indicator Component
import React from 'react';

export default function PasswordStrength({ password }) {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#e5e7eb' };
    
    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    
    // Character variety
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
    
    // Determine strength
    if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 5) return { score: 3, label: 'Good', color: '#3b82f6' };
    return { score: 4, label: 'Strong', color: '#10b981' };
  };

  const strength = calculateStrength(password);

  const styles = {
    container: {
      marginTop: '8px'
    },
    bars: {
      display: 'flex',
      gap: '4px',
      height: '4px',
      marginBottom: '4px'
    },
    bar: (index) => ({
      flex: 1,
      background: index < strength.score ? strength.color : '#e5e7eb',
      borderRadius: '2px',
      transition: 'background 0.3s ease'
    }),
    label: {
      fontSize: '12px',
      color: strength.color,
      fontWeight: '600'
    },
    tips: {
      fontSize: '11px',
      color: '#64748b',
      marginTop: '4px',
      lineHeight: '1.4'
    }
  };

  const getTips = () => {
    const tips = [];
    if (password.length < 8) tips.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) tips.push('uppercase letter');
    if (!/[a-z]/.test(password)) tips.push('lowercase letter');
    if (!/[0-9]/.test(password)) tips.push('number');
    if (!/[^a-zA-Z0-9]/.test(password)) tips.push('special character');
    
    return tips.length > 0 ? `Add: ${tips.join(', ')}` : 'Excellent password!';
  };

  if (!password) return null;

  return (
    <div style={styles.container}>
      <div style={styles.bars}>
        <div style={styles.bar(0)} />
        <div style={styles.bar(1)} />
        <div style={styles.bar(2)} />
        <div style={styles.bar(3)} />
      </div>
      <div style={styles.label}>{strength.label}</div>
      <div style={styles.tips}>{getTips()}</div>
    </div>
  );
}
