// Sales Analytics Dashboard Component
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
const STATUS_COLORS = ['#fbbf24', '#34d399', '#f87171', '#60a5fa', '#a78bfa'];

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
  .dark-date-input::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.7;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .dark-date-input::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '32px',
      position: 'relative',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px 40px',
      marginBottom: '28px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      animation: 'fadeIn 0.6s ease-out'
    },
    title: {
      fontSize: '36px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '12px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '15px',
      color: '#94a3b8',
      fontWeight: '500',
      letterSpacing: '0.3px'
    },
    filtersCard: {
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '28px 32px',
      marginBottom: '28px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
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
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '12px 16px',
      fontSize: '14px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      color: '#f8fafc',
      fontWeight: '500',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      cursor: 'pointer'
    },
    select: {
      padding: '10px 14px',
      fontSize: '14px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      outline: 'none',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      color: '#f8fafc',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    applyBtn: {
      padding: '14px 32px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      alignSelf: 'flex-end',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
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
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '28px 24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'fadeIn 0.6s ease-out',
      position: 'relative',
      overflow: 'hidden'
    },
    statLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '40px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px',
      letterSpacing: '-1px',
      animation: 'countUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
    statSubtext: {
      fontSize: '13px',
      color: '#94a3b8'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
    },
    tab: {
      padding: '14px 28px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#94a3b8',
      background: 'rgba(30, 41, 59, 0.4)',
      border: '1px solid transparent',
      borderRadius: '12px 12px 0 0',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '-2px',
      position: 'relative',
      letterSpacing: '0.3px'
    },
    tabActive: {
      color: '#60a5fa',
      background: 'rgba(30, 41, 59, 0.9)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      borderBottom: '2px solid rgba(30, 41, 59, 0.9)',
      fontWeight: '700',
      transform: 'translateY(1px)' // cover the border line smoothly
    },
    chartCard: {
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '28px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      animation: 'fadeIn 0.6s ease-out 0.2s backwards'
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f8fafc',
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
      background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
      borderRadius: '8px 8px 0 0',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      minWidth: '40px',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      animation: 'slideIn 0.6s ease-out'
    },
    barLabel: {
      position: 'absolute',
      bottom: '-24px',
      left: '50%',
      transform: 'translateX(-50%) rotate(-45deg)',
      fontSize: '11px',
      color: '#94a3b8',
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
      color: '#f8fafc',
      whiteSpace: 'nowrap'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '16px 14px',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      fontSize: '12px',
      fontWeight: '700',
      color: '#60a5fa',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.05), transparent)'
    },
    td: {
      padding: '18px 14px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      fontSize: '15px',
      color: '#cbd5e1',
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
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    error: {
      background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.2) 0%, rgba(127, 29, 29, 0.3) 100%)',
      color: '#fca5a5',
      padding: '20px 24px',
      borderRadius: '16px',
      marginBottom: '24px',
      border: '1px solid rgba(248, 113, 113, 0.3)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      fontWeight: '600',
      animation: 'fadeIn 0.4s ease-out',
      backdropFilter: 'blur(20px)'
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      fontSize: '16px',
      color: '#94a3b8'
    }
  };

  if (loading && !summary) {
    return (
      <div style={styles.container}>
        <div style={{
          ...styles.loading,
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '60px 40px',
          margin: '100px auto',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>📊</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#60a5fa',
            letterSpacing: '0.5px'
          }}>Loading analytics data...</div>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
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
        <div style={styles.filtersGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              className="dark-date-input"
              style={styles.input}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.2)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              className="dark-date-input"
              style={styles.input}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.2)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
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
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.2)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <option value="daily" style={{ background: '#1e293b' }}>📅 Daily</option>
              <option value="weekly" style={{ background: '#1e293b' }}>📆 Weekly</option>
              <option value="monthly" style={{ background: '#1e293b' }}>🗓️ Monthly</option>
            </select>
          </div>

          <button
            style={styles.applyBtn}
            onClick={fetchAnalytics}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
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
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
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
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
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
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
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
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
              }}
            >
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: '0.1' }}>✅</div>
              <div style={styles.statLabel}>Order Status</div>
              <div style={{ fontSize: '14px', marginTop: '12px' }}>
                {Object.entries(summary.salesByStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                    <span style={{ textTransform: 'capitalize', color: '#94a3b8', fontWeight: '600' }}>{status}:</span>
                    <span style={{ fontWeight: '700', color: '#60a5fa' }}>{count}</span>
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
              <h3 style={styles.chartTitle}>Revenue Overview & Order Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                <div style={{
                  textAlign: 'center',
                  padding: '60px 40px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '120px', opacity: '0.03' }}>💰</div>
                  <div style={{
                    fontSize: '80px',
                    marginBottom: '24px',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>💰</div>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
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
                    color: '#94a3b8',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                  }}>
                    From <span style={{ color: '#60a5fa', fontWeight: '700' }}>{summary.totalOrders}</span> orders
                  </div>
                </div>

                <div style={{ height: 380, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <h4 style={{ color: '#cbd5e1', marginBottom: '8px', fontWeight: '600', fontSize: '15px' }}>Orders by Status</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(summary.salesByStatus).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(summary.salesByStatus).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', color: '#f8fafc' }}
                        itemStyle={{ color: '#cbd5e1' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && trends.length > 0 && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Sales Trends ({filters.interval})</h3>
              <div style={{ height: 400, width: '100%', marginTop: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${value}`} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
                    <RechartsTooltip
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label) => formatDate(label)}
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', color: '#f8fafc' }}
                      itemStyle={{ color: '#cbd5e1' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Top Selling Products</h3>

              <div style={{ height: 400, width: '100%', marginBottom: '40px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...summary.topProducts].slice(0, 10).sort((a, b) => a.revenue - b.revenue)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${value}`} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                    <RechartsTooltip
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', color: '#f8fafc' }}
                      itemStyle={{ color: '#cbd5e1' }}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Revenue" barSize={20}>
                      {[...summary.topProducts].slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

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
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        style={{ transition: 'background 0.2s ease' }}
                      >
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: index < 3
                              ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%)'
                              : 'rgba(255,255,255,0.1)',
                            color: index < 3 ? '#fbbf24' : '#cbd5e1',
                            border: index < 3 ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(255,255,255,0.1)'
                          }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                        </td>
                        <td style={styles.td}>{product.name}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '40px', alignItems: 'center' }}>
                <div style={{ height: 350, width: '100%', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="revenue"
                        nameKey="category"
                      >
                        {categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', color: '#f8fafc' }}
                        itemStyle={{ color: '#cbd5e1' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          style={{ transition: 'background 0.2s ease' }}
                        >
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              background: 'rgba(99, 102, 241, 0.1)',
                              color: '#818cf8',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
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
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)'
                              }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                                  borderRadius: '10px',
                                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
                                }}></div>
                              </div>
                              <span style={{ fontWeight: '700', color: '#60a5fa', minWidth: '50px' }}>{percentage}%</span>
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
