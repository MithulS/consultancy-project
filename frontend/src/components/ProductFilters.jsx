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
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    resultCount: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    sortDropdown: {
      padding: '10px 16px',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      minWidth: '180px',
      transition: 'all 0.2s ease'
    },
    filterBtn: {
      padding: '10px 20px',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      backgroundColor: isExpanded ? '#1e3a8a' : '#ffffff',
      color: isExpanded ? '#ffffff' : '#374151',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    filterPanel: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
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
      animation: 'slideIn 0.3s ease-out',
      animationFillMode: 'backwards'
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
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
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#f9fafb'
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
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: '#ffffff'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: inStockOnly ? '#eff6ff' : '#ffffff'
    },
    checkboxInput: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer'
    },
    filterActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb'
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
      color: '#6b7280',
      border: '1px solid #e5e7eb',
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
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .rating-option:hover {
          background-color: #f9fafb !important;
          border-color: #3b82f6 !important;
        }
        .rating-option.selected {
          background-color: #eff6ff !important;
          border-color: #3b82f6 !important;
        }
        .apply-btn:hover {
          background-color: #2563eb !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .reset-btn:hover {
          background-color: #f9fafb !important;
          border-color: #9ca3af !important;
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
            <div style={styles.filterGroup}>
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
            <div style={styles.filterGroup}>
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
            <div style={styles.filterGroup}>
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
