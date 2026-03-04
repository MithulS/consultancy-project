// Product Filters and Sort Component
import React, { useState } from 'react';

export default function ProductFilters({
  onFilterChange,
  onSortChange,
  categories = [],
  selectedCategory,
  totalProducts = 0
}) {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [isExpanded, setIsExpanded] = useState(false);

  const sortOptions = [
    { value: 'featured', label: '✨ Featured' },
    { value: 'price-low', label: '💰 Price: Low to High' },
    { value: 'price-high', label: '💎 Price: High to Low' },
    { value: 'rating', label: '⭐ Top Rated' },
    { value: 'newest', label: '🆕 Newest First' },
    { value: 'popular', label: '🔥 Most Popular' }
  ];

  const handleSortChange = (value) => {
    setSortBy(value);
    onSortChange(value);
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = Number(e.target.value);
    setPriceRange(newRange);
  };

  const applyFilters = () => {
    onFilterChange({
      priceRange,
      rating: selectedRating,
      inStockOnly
    });
  };

  const resetFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedRating(0);
    setInStockOnly(false);
    onFilterChange({
      priceRange: [0, 10000],
      rating: 0,
      inStockOnly: false
    });
  };

  const styles = {
    container: {
      marginBottom: '24px'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      padding: '16px 24px',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
    },
    resultCount: {
      fontSize: '15px',
      color: '#cbd5e1',
      fontWeight: '600',
      letterSpacing: '0.3px'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    sortDropdown: {
      padding: '10px 40px 10px 16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      fontSize: '14px',
      fontWeight: '500',
      color: '#e2e8f0',
      cursor: 'pointer',
      appearance: 'none',
      minWidth: '200px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23cbd5e1\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 16px center',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
    },
    filterBtn: {
      padding: '10px 20px',
      border: '1px solid ' + (isExpanded ? 'transparent' : 'rgba(255, 255, 255, 0.08)'),
      borderRadius: '12px',
      background: isExpanded ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
      color: '#e2e8f0',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isExpanded ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none'
    },
    filterPanel: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      display: isExpanded ? 'block' : 'none',
      animation: isExpanded ? 'slideDown 0.3s ease' : 'none'
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px'
    },
    filterGroup: {
      marginBottom: '0',
      animation: 'staggeredGlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      opacity: 0
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '12px',
      display: 'block'
    },
    priceInputs: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    priceInput: {
      flex: 1,
      padding: '8px 12px',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)'
    },
    ratingOptions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    ratingOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: 'var(--glass-background)'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 12px',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: inStockOnly ? 'var(--accent-blue-subtle)' : 'var(--glass-background)'
    },
    checkboxInput: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--text-primary)',
      cursor: 'pointer'
    },
    filterActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid var(--border-color)'
    },
    applyBtn: {
      flex: 1,
      padding: '12px',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    resetBtn: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.98);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 1000px;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .sort-dropdown:hover, .sort-dropdown:focus {
          border-color: var(--accent-blue-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .rating-option:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--accent-blue-primary) !important;
        }
        .rating-option.selected {
          background: var(--accent-blue-subtle) !important;
          border-color: var(--accent-blue-primary) !important;
        }
        .apply-btn:hover {
          background-color: var(--accent-blue-primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .reset-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--text-primary) !important;
          color: var(--text-primary) !important;
        }
        @media (max-width: 768px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.resultCount}>
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
          </div>
          <div style={styles.controls}>
            <select
              style={styles.sortDropdown}
              className="sort-dropdown"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              style={styles.filterBtn}
              className="filter-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              🔍 {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        <div style={styles.filterPanel}>
          <div style={styles.filterGrid} className="filter-grid">
            {/* Price Range */}
            <div style={{ ...styles.filterGroup, animationDelay: '0.1s' }}>
              <label style={styles.filterLabel}>Price Range</label>
              <div style={styles.priceInputs}>
                <input
                  type="number"
                  style={styles.priceInput}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  placeholder="Min"
                  min="0"
                />
                <span style={{ color: '#9ca3af' }}>-</span>
                <input
                  type="number"
                  style={styles.priceInput}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div style={{ ...styles.filterGroup, animationDelay: '0.2s' }}>
              <label style={styles.filterLabel}>Minimum Rating</label>
              <div style={styles.ratingOptions}>
                {[4, 3, 2, 1].map(rating => (
                  <div
                    key={rating}
                    style={styles.ratingOption}
                    className={`rating-option ${selectedRating === rating ? 'selected' : ''}`}
                    onClick={() => setSelectedRating(rating === selectedRating ? 0 : rating)}
                  >
                    <span>{'⭐'.repeat(rating)} & up</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Filter */}
            <div style={{ ...styles.filterGroup, animationDelay: '0.3s' }}>
              <label style={styles.filterLabel}>Availability</label>
              <div
                style={styles.checkbox}
                onClick={() => setInStockOnly(!inStockOnly)}
              >
                <input
                  type="checkbox"
                  style={styles.checkboxInput}
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                />
                <span style={styles.checkboxLabel}>In Stock Only</span>
              </div>
            </div>
          </div>

          <div style={styles.filterActions}>
            <button
              style={styles.applyBtn}
              className="apply-btn"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button
              style={styles.resetBtn}
              className="reset-btn"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
