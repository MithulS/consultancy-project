// Global Navigation Component with Breadcrumbs
import React, { useState, useEffect } from 'react';

export default function Navigation({ currentPage, userName, isAdmin }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    generateBreadcrumbs(currentPage);
  }, [currentPage]);

  function generateBreadcrumbs(page) {
    const breadcrumbMap = {
      'dashboard': [{ label: 'Home', path: '#home' }],
      'cart': [{ label: 'Home', path: '#home' }, { label: 'Cart', path: '#cart' }],
      'checkout': [{ label: 'Home', path: '#home' }, { label: 'Cart', path: '#cart' }, { label: 'Checkout', path: '#checkout' }],
      'my-orders': [{ label: 'Home', path: '#home' }, { label: 'My Orders', path: '#my-orders' }],
      'admin-dashboard': [{ label: 'Admin Home', path: '#admin-dashboard' }],
      'admin-settings': [{ label: 'Admin Home', path: '#admin-dashboard' }, { label: 'Settings', path: '#admin-settings' }],
      'sales-analytics': [{ label: 'Admin Home', path: '#admin-dashboard' }, { label: 'Analytics', path: '#sales-analytics' }]
    };
    setBreadcrumbs(breadcrumbMap[page] || []);
  }

  function logout() {
    // Clear cart so it doesn't persist to the next user on shared devices
    localStorage.removeItem('cart');
    if (isAdmin) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminUser');
      window.location.hash = '#secret-admin-login';
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#login';
    }
  }

  const styles = {
    nav: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      boxShadow: 'var(--shadow-md)',
      padding: '16px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid var(--border-color)'
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px'
    },
    logo: {
      fontSize: '24px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    breadcrumbs: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: 'var(--text-secondary)',
      flexWrap: 'wrap'
    },
    breadcrumbLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.2s',
      cursor: 'pointer'
    },
    breadcrumbSeparator: {
      color: 'var(--text-secondary)',
      margin: '0 4px'
    },
    breadcrumbCurrent: {
      color: 'var(--text-primary)',
      fontWeight: '600'
    },
    menuButton: {
      display: 'none',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '8px',
      color: '#667eea'
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    navButton: {
      padding: '10px 20px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white'
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white'
    },
    warningButton: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white'
    },
    dangerButton: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white'
    },
    userName: {
      fontSize: '14px',
      color: 'var(--text-primary)',
      fontWeight: '500',
      padding: '8px 16px',
      background: 'rgba(102, 126, 234, 0.1)',
      borderRadius: '8px'
    },
    badge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '700'
    },
    mobileMenu: {
      display: 'none',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      padding: '16px',
      gap: '8px',
      flexDirection: 'column',
      animation: 'menuBloom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    },
    mobileMenuVisible: {
      display: 'flex'
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1
              style={styles.logo}
              onClick={() => window.location.hash = isAdmin ? '#admin-dashboard' : '#home'}
            >
              {isAdmin ? '🛡️ Admin Panel' : '🏪 Sri Amman Traders'}
            </h1>

            <button
              className="nav-burger-btn"
              style={styles.menuButton}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>
          </div>

          {breadcrumbs.length > 0 && (
            <div style={styles.breadcrumbs} role="navigation" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span style={styles.breadcrumbSeparator}>›</span>}
                  {index < breadcrumbs.length - 1 ? (
                    <a
                      href={crumb.path}
                      style={styles.breadcrumbLink}
                      onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                      onMouseLeave={(e) => e.target.style.color = '#667eea'}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span style={styles.breadcrumbCurrent}>{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="nav-links-desktop" style={{ ...styles.navLinks, display: showMobileMenu ? 'none' : 'flex' }}>
          {userName && <span style={styles.userName}>👤 {userName}</span>}
          {!isAdmin && (
            <>
              <button
                className={`nav-link-btn ${currentPage === 'my-orders' ? 'active' : ''}`}
                style={styles.navButton}
                onClick={() => window.location.hash = '#my-orders'}
              >
                📦 Orders
              </button>
              <button
                className={`nav-link-btn ${currentPage === 'cart' ? 'active' : ''}`}
                style={styles.navButton}
                onClick={() => window.location.hash = '#cart'}
              >
                🛒 Cart
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <button
                className={`nav-link-btn ${currentPage === 'sales-analytics' ? 'active' : ''}`}
                style={styles.navButton}
                onClick={() => window.location.hash = '#sales-analytics'}
              >
                📊 Analytics
              </button>
              <button
                className={`nav-link-btn ${currentPage === 'admin-settings' ? 'active' : ''}`}
                style={styles.navButton}
                onClick={() => window.location.hash = '#admin-settings'}
              >
                ⚙️ Settings
              </button>
            </>
          )}
          <button
            style={{ ...styles.navButton, ...styles.dangerButton }}
            onClick={logout}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div style={{ ...styles.mobileMenu, ...styles.mobileMenuVisible }}>
            {userName && <span style={styles.userName}>👤 {userName}</span>}
            {!isAdmin && (
              <>
                <button className={`nav-btn-mobile ${currentPage === 'my-orders' ? 'active' : ''}`} style={{ ...styles.navButton }} onClick={() => { window.location.hash = '#my-orders'; setShowMobileMenu(false); }}>📦 Orders</button>
                <button className={`nav-btn-mobile ${currentPage === 'cart' ? 'active' : ''}`} style={{ ...styles.navButton }} onClick={() => { window.location.hash = '#cart'; setShowMobileMenu(false); }}>🛒 Cart</button>
              </>
            )}
            {isAdmin && (
              <>
                <button className={`nav-btn-mobile ${currentPage === 'sales-analytics' ? 'active' : ''}`} style={{ ...styles.navButton }} onClick={() => { window.location.hash = '#sales-analytics'; setShowMobileMenu(false); }}>📊 Analytics</button>
                <button className={`nav-btn-mobile ${currentPage === 'admin-settings' ? 'active' : ''}`} style={{ ...styles.navButton }} onClick={() => { window.location.hash = '#admin-settings'; setShowMobileMenu(false); }}>⚙️ Settings</button>
              </>
            )}
            <button className="nav-btn-mobile" style={{ ...styles.navButton, ...styles.dangerButton }} onClick={logout}>🚪 Logout</button>
          </div>
        )}
      </div>

      <style>{`
        .nav-burger-btn {
          display: none;
        }
        .nav-link-btn {
          position: relative;
          background: transparent !important;
          color: var(--text-secondary) !important;
          border: 1px solid transparent !important;
          box-shadow: none !important;
        }
        .nav-link-btn:hover {
          color: var(--text-primary) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px var(--accent-blue-glow) !important;
        }
        .nav-link-btn.active {
          color: var(--accent-blue-primary) !important;
          background: rgba(59, 130, 246, 0.1) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
          box-shadow: 0 0 20px var(--accent-blue-glow) !important;
        }
        .nav-link-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 10%;
          width: 80%;
          height: 3px;
          background: var(--accent-blue-primary);
          border-radius: 4px;
          box-shadow: 0 0 10px var(--accent-blue-primary);
        }
        .nav-btn-mobile {
          background: transparent !important;
          color: var(--text-primary) !important;
        }
        .nav-btn-mobile.active {
          background: rgba(59, 130, 246, 0.1) !important;
          border-left: 3px solid var(--accent-blue-primary) !important;
        }
        @keyframes menuBloom {
          from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); transform: translateY(-10px); }
          to { opacity: 1; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .nav-burger-btn { display: block !important; }
          .nav-links-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
