import React, { useState, useEffect } from 'react';

export default function AdminLayout({ children, currentPage }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
        setAdminUser(user);

        // Auto-collapse on smaller screens
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.hash = '#secret-admin-login';
    };

    const navItems = [
        { id: 'admin-dashboard', icon: '📦', label: 'Inventory' },
        { id: 'sales-analytics', icon: '📈', label: 'Analytics' },
        { id: 'admin-order-tracking', icon: '🚚', label: 'Orders' },
        { id: 'admin-settings', icon: '⚙️', label: 'Settings' }
    ];

    const styles = {
        layout: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        sidebar: {
            width: isCollapsed ? '80px' : '260px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 100
        },
        header: {
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            gap: '12px'
        },
        logoText: {
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: isCollapsed ? 'none' : 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
        },
        collapseBtn: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
        },
        nav: {
            padding: '24px 16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            gap: '12px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        },
        navItemActive: {
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            color: '#38bdf8',
            fontWeight: '600'
        },
        navIcon: {
            fontSize: '20px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        navLabel: {
            display: isCollapsed ? 'none' : 'block',
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.2s ease'
        },
        footer: {
            padding: '24px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
        userInfo: {
            display: isCollapsed ? 'none' : 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
        },
        avatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#38bdf8'
        },
        userDetails: {
            display: 'flex',
            flexDirection: 'column'
        },
        logoutBtn: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#f87171',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            border: 'none',
            width: '100%',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            gap: '8px'
        },
        mainContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)',
            overflowX: 'hidden'
        }
    };

    return (
        <div style={styles.layout}>
            {/* Sidebar Navigation */}
            <aside style={styles.sidebar}>
                <div style={styles.header}>
                    {!isCollapsed && <div style={styles.logoText}>Admin Portal</div>}
                    <button
                        style={styles.collapseBtn}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        {isCollapsed ? '➡' : '⬅'}
                    </button>
                </div>

                <nav style={styles.nav}>
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.navItem,
                                ...(currentPage === item.id ? styles.navItemActive : {})
                            }}
                            onClick={() => window.location.hash = '#' + item.id}
                            onMouseOver={(e) => {
                                if (currentPage !== item.id) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = '#ffffff';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (currentPage !== item.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#cbd5e1';
                                }
                            }}
                        >
                            <div style={styles.navIcon}>{item.icon}</div>
                            <span style={styles.navLabel}>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={styles.footer}>
                    {!isCollapsed && (
                        <div style={styles.userInfo}>
                            <div style={styles.avatar}>
                                {adminUser?.username?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div style={styles.userDetails}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>
                                    {adminUser?.username || 'Admin'}
                                </span>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    System Administrator
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        style={styles.logoutBtn}
                        onClick={handleLogout}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(248, 113, 113, 0.2)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
                    >
                        <span>🚪</span>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Page Content */}
            <main style={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
