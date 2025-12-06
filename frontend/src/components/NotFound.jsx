// 404 Not Found Page
import React from 'react';

export default function NotFound() {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '20px',
      textAlign: 'center'
    },
    errorCode: {
      fontSize: '120px',
      fontWeight: '900',
      color: 'white',
      margin: '0',
      textShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'pulse 2s ease-in-out infinite'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: 'white',
      margin: '20px 0',
      opacity: 0.9
    },
    message: {
      fontSize: '18px',
      color: 'white',
      opacity: 0.8,
      maxWidth: '500px',
      marginBottom: '40px'
    },
    btnGroup: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    btn: {
      padding: '14px 28px',
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#667eea',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    },
    illustration: {
      fontSize: '80px',
      marginBottom: '20px',
      animation: 'float 3s ease-in-out infinite'
    }
  };

  // Add keyframes
  if (!document.querySelector('[data-notfound-styles]')) {
    const styleSheet = document.createElement('style');
    styleSheet.setAttribute('data-notfound-styles', 'true');
    styleSheet.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  function goHome() {
    window.location.hash = '#dashboard';
  }

  function goBack() {
    window.history.back();
  }

  return (
    <div style={styles.container}>
      <div style={styles.illustration}>🔍</div>
      <h1 style={styles.errorCode}>404</h1>
      <h2 style={styles.title}>Page Not Found</h2>
      <p style={styles.message}>
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <div style={styles.btnGroup}>
        <button 
          style={styles.btn}
          onClick={goHome}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🏠 Go Home
        </button>
        <button 
          style={styles.btn}
          onClick={goBack}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}
