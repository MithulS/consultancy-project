// Sales Analytics Dashboard Component
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Inject CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.05); }
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;
if (!document.querySelector('[data-analytics-styles]')) {
  styleSheet.setAttribute('data-analytics-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default function SalesAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    interval: 'daily'
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  async function fetchAnalytics() {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Admin authentication required');
      }

      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.category) queryParams.append('category', filters.category);

      // Fetch summary
      const summaryRes = await fetch(`${API}/api/analytics/sales-summary?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();

      if (!summaryRes.ok) throw new Error(summaryData.msg || 'Failed to fetch summary');
      setSummary(summaryData.data);

      // Fetch trends
      const trendParams = new URLSearchParams(queryParams);
      trendParams.append('interval', filters.interval);
      const trendsRes = await fetch(`${API}/api/analytics/sales-trends?${trendParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const trendsData = await trendsRes.json();

      if (!trendsRes.ok) throw new Error(trendsData.msg || 'Failed to fetch trends');
      setTrends(trendsData.data.trends);

      // Fetch category sales
      const categoryRes = await fetch(`${API}/api/analytics/category-sales?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const categoryData = await categoryRes.json();

      if (!categoryRes.ok) throw new Error(categoryData.msg || 'Failed to fetch category sales');
      setCategorySales(categoryData.data);

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 75%, #764ba2 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      padding: '32px',
      position: 'relative'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px 40px',
      marginBottom: '28px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      animation: 'fadeIn 0.6s ease-out'
    },
    title: {
      fontSize: '36px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '12px',
      letterSpacing: '-0.5px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    subtitle: {
      fontSize: '15px',
      color: '#6b7280',
      fontWeight: '500',
      letterSpacing: '0.3px'
    },
    filtersCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '28px 32px',
      marginBottom: '28px',
      boxShadow: '0 4px 24px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      animation: 'fadeIn 0.6s ease-out 0.1s backwards'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '12px 16px',
      fontSize: '14px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
      cursor: 'pointer'
    },
    select: {
      padding: '10px 14px',
      fontSize: '14px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      backgroundColor: '#f8fafc',
      cursor: 'pointer'
    },
    applyBtn: {
      padding: '14px 32px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      alignSelf: 'flex-end',
      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      letterSpacing: '0.5px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '24px',
      marginBottom: '28px'
    },
    statCard: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '28px 24px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'fadeIn 0.6s ease-out',
      position: 'relative',
      overflow: 'hidden'
    },
    statLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '40px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px',
      letterSpacing: '-1px',
      animation: 'countUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
    statSubtext: {
      fontSize: '13px',
      color: '#64748b'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '2px solid #e2e8f0'
    },
    tab: {
      padding: '14px 28px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#6b7280',
      background: 'rgba(255, 255, 255, 0.5)',
      border: 'none',
      borderRadius: '12px 12px 0 0',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '0',
      position: 'relative',
      letterSpacing: '0.3px'
    },
    tabActive: {
      color: '#667eea',
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 -4px 12px rgba(102, 126, 234, 0.15)',
      fontWeight: '700',
      transform: 'translateY(-2px)'
    },
    chartCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '28px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      animation: 'fadeIn 0.6s ease-out 0.2s backwards'
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '20px'
    },
    barChart: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      height: '300px',
      padding: '20px 0'
    },
    bar: {
      flex: 1,
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '8px 8px 0 0',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      minWidth: '40px',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
      animation: 'slideIn 0.6s ease-out'
    },
    barLabel: {
      position: 'absolute',
      bottom: '-24px',
      left: '50%',
      transform: 'translateX(-50%) rotate(-45deg)',
      fontSize: '11px',
      color: '#64748b',
      whiteSpace: 'nowrap',
      transformOrigin: 'left'
    },
    barValue: {
      position: 'absolute',
      top: '-24px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '11px',
      fontWeight: '600',
      color: '#0f172a',
      whiteSpace: 'nowrap'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '16px 14px',
      borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
      fontSize: '12px',
      fontWeight: '700',
      color: '#667eea',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.05), transparent)'
    },
    td: {
      padding: '18px 14px',
      borderBottom: '1px solid rgba(102, 126, 234, 0.08)',
      fontSize: '15px',
      color: '#374151',
      fontWeight: '500',
      transition: 'background 0.2s ease'
    },
    badge: {
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    error: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      color: '#991b1b',
      padding: '20px 24px',
      borderRadius: '16px',
      marginBottom: '24px',
      border: '2px solid #fca5a5',
      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)',
      fontWeight: '600',
      animation: 'fadeIn 0.4s ease-out'
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      fontSize: '16px',
      color: '#64748b'
    }
  };

  if (loading && !summary) {
    return (
      <div style={styles.container}>
        <div style={{
          ...styles.loading,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '60px 40px',
          margin: '100px auto',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>📊</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#667eea',
            letterSpacing: '0.5px'
          }}>Loading analytics data...</div>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '2px',
            margin: '24px auto 0',
            animation: 'shimmer 2s infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Sales Analytics</h1>
        <p style={styles.subtitle}>Comprehensive product sales analysis and insights</p>
      </div>

      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      <div style={styles.filtersCard}>
        <div style={styles.filterGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              style={styles.input}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.04)';
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              style={styles.input}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.04)';
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Interval</label>
            <select
              style={styles.select}
              value={filters.interval}
              onChange={(e) => setFilters({ ...filters, interval: e.target.value })}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.04)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <option value="daily">📅 Daily</option>
              <option value="weekly">📆 Weekly</option>
              <option value="monthly">🗓️ Monthly</option>
            </select>
          </div>

          <button
            style={styles.applyBtn}
            onClick={fetchAnalytics}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {summary && (
        <div aria-live="polite" aria-atomic="true">
          <div style={styles.statsGrid}>
            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
              }}
            >
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: '0.1' }}>💰</div>
              <div style={styles.statLabel}>Total Revenue</div>
              <div style={styles.statValue}>{formatCurrency(summary.totalRevenue)}</div>
              <div style={styles.statSubtext}>All completed orders</div>
            </div>

            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
              }}
            >
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: '0.1' }}>📎</div>
              <div style={styles.statLabel}>Total Orders</div>
              <div style={styles.statValue}>{summary.totalOrders}</div>
              <div style={styles.statSubtext}>{summary.totalProducts} unique products</div>
            </div>

            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
              }}
            >
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: '0.1' }}>📈</div>
              <div style={styles.statLabel}>Average Order Value</div>
              <div style={styles.statValue}>{formatCurrency(summary.averageOrderValue)}</div>
              <div style={styles.statSubtext}>Per order</div>
            </div>

            <div
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
              }}
            >
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: '0.1' }}>✅</div>
              <div style={styles.statLabel}>Order Status</div>
              <div style={{ fontSize: '14px', marginTop: '12px' }}>
                {Object.entries(summary.salesByStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px', background: 'rgba(102, 126, 234, 0.05)', borderRadius: '8px' }}>
                    <span style={{ textTransform: 'capitalize', color: '#6b7280', fontWeight: '600' }}>{status}:</span>
                    <span style={{ fontWeight: '700', color: '#667eea' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'trends' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('trends')}
            >
              Sales Trends
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'products' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('products')}
            >
              Top Products
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'categories' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
          </div>

          {activeTab === 'overview' && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Revenue Overview</h3>
              <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '15px', fontWeight: '500' }}>
                Total revenue breakdown across all orders
              </p>
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(244, 114, 182, 0.05) 100%)',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '120px', opacity: '0.03' }}>💰</div>
                <div style={{
                  fontSize: '80px',
                  marginBottom: '24px',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>💰</div>
                <div style={{
                  fontSize: '56px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-2px',
                  marginBottom: '16px'
                }}>
                  {formatCurrency(summary.totalRevenue)}
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  From <span style={{ color: '#667eea', fontWeight: '700' }}>{summary.totalOrders}</span> orders
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && trends.length > 0 && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Sales Trends ({filters.interval})</h3>
              <div style={styles.barChart}>
                {trends.map((trend, index) => {
                  const maxRevenue = Math.max(...trends.map(t => t.revenue));
                  const height = (trend.revenue / maxRevenue) * 100;

                  return (
                    <div
                      key={index}
                      style={{
                        ...styles.bar,
                        height: `${height}%`,
                        background: index % 2 === 0
                          ? 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)',
                        animationDelay: `${index * 0.05}s`
                      }}
                      title={`${trend.date}: ${formatCurrency(trend.revenue)}`}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.filter = 'brightness(1.2)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      <div style={styles.barValue}>{formatCurrency(trend.revenue)}</div>
                      <div style={styles.barLabel}>{formatDate(trend.date)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Top Selling Products</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Product Name</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Quantity Sold</th>
                      <th style={styles.th}>Revenue</th>
                      <th style={styles.th}>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.topProducts.slice(0, 10).map((product, index) => (
                      <tr
                        key={product.productId}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        style={{ transition: 'background 0.2s ease' }}
                      >
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: index < 3
                              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                              : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                            color: index < 3 ? '#78350f' : '#4b5563'
                          }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                        </td>
                        <td style={styles.td}>{product.name}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            color: '#1e40af'
                          }}>
                            {product.category}
                          </span>
                        </td>
                        <td style={styles.td}>{product.quantity}</td>
                        <td style={styles.td}>
                          <strong>{formatCurrency(product.revenue)}</strong>
                        </td>
                        <td style={styles.td}>{product.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Sales by Category</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Quantity Sold</th>
                      <th style={styles.th}>Revenue</th>
                      <th style={styles.th}>Orders</th>
                      <th style={styles.th}>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySales.map((category) => {
                      const percentage = ((category.revenue / summary.totalRevenue) * 100).toFixed(1);
                      return (
                        <tr
                          key={category.category}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          style={{ transition: 'background 0.2s ease' }}
                        >
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                              color: '#3730a3',
                              fontSize: '13px'
                            }}>
                              🏷️ {category.category}
                            </span>
                          </td>
                          <td style={styles.td}>{category.quantity}</td>
                          <td style={styles.td}>
                            <strong>{formatCurrency(category.revenue)}</strong>
                          </td>
                          <td style={styles.td}>{category.orderCount}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '120px',
                                height: '10px',
                                background: 'linear-gradient(to right, #e5e7eb, #f3f4f6)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
                              }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                  borderRadius: '10px',
                                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: '0 0 8px rgba(102, 126, 234, 0.4)'
                                }}></div>
                              </div>
                              <span style={{ fontWeight: '700', color: '#667eea', minWidth: '50px' }}>{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
