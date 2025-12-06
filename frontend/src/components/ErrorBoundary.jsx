// Error Boundary Component
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Log to analytics service (if available)
    if (window.analytics) {
      window.analytics.track('error', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#dashboard';
  };

  render() {
    if (this.state.hasError) {
      const styles = {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        },
        card: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '600px',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2)',
          textAlign: 'center'
        },
        icon: {
          fontSize: '80px',
          marginBottom: '24px',
          animation: 'bounce 1s infinite'
        },
        title: {
          fontSize: '32px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '16px'
        },
        message: {
          fontSize: '16px',
          color: '#64748b',
          marginBottom: '32px',
          lineHeight: '1.6'
        },
        errorDetails: {
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        },
        errorText: {
          fontSize: '14px',
          color: '#991b1b',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        },
        buttonGroup: {
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        },
        button: {
          padding: '14px 28px',
          borderRadius: '12px',
          border: 'none',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        },
        primaryButton: {
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white'
        },
        secondaryButton: {
          background: 'linear-gradient(135deg, #6b7280, #4b5563)',
          color: 'white'
        }
      };

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>😕</div>
            <h1 style={styles.title}>Oops! Something went wrong</h1>
            <p style={styles.message}>
              We encountered an unexpected error. Don't worry, we've logged the issue 
              and our team will look into it.
            </p>
            
            {this.state.error && (
              <div style={styles.errorDetails}>
                <p style={styles.errorText}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <div style={styles.buttonGroup}>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={this.handleReset}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                🔄 Reload Page
              </button>
              <button 
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={this.handleGoHome}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
