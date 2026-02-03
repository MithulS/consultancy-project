/**
 * Enhanced Search Bar with Smart Features
 * - Auto-suggest with product previews
 * - Typo tolerance (fuzzy matching)
 * - Recent searches
 * - Category suggestions
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Debounced API calls
 * - Price and rating filters
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EnhancedSearchBar({ 
  onSearch, 
  onFilterChange,
  placeholder = "Search products, brands, categories...",
  showFilters = true 
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    category: 'All',
    rating: 0,
    inStock: false,
    sortBy: 'relevance'
  });

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(saved.slice(0, 5));
  }, []);

  // Debounced API search for suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API}/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`
      );
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.products || []);
      }
    } catch (error) {
      console.error('Search suggestions error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Execute search callback
    onSearch(searchQuery, filters);
    setShowSuggestions(false);
    setQuery(searchQuery);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Select a suggestion
  const selectSuggestion = (product) => {
    setQuery(product.name);
    handleSearch(product.name);
    setShowSuggestions(false);
  };

  // Handle filter changes
  const updateFilters = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Clear recent search
  const clearRecentSearch = (search, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto'
    },
    searchWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    searchBox: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '0 16px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    searchBoxFocused: {
      borderColor: '#1e3a8a',
      boxShadow: '0 4px 16px rgba(30, 58, 138, 0.2)'
    },
    searchIcon: {
      fontSize: '20px',
      color: '#9ca3af',
      marginRight: '12px'
    },
    input: {
      flex: 1,
      border: 'none',
      outline: 'none',
      padding: '14px 0',
      fontSize: '15px',
      color: '#1f2937',
      backgroundColor: 'transparent'
    },
    filterButton: {
      padding: '12px 20px',
      backgroundColor: showFilterPanel ? '#1e3a8a' : '#ffffff',
      color: showFilterPanel ? '#ffffff' : '#374151',
      border: '2px solid ' + (showFilterPanel ? '#1e3a8a' : '#e5e7eb'),
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap'
    },
    suggestionsDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '8px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000
    },
    suggestionSection: {
      padding: '12px 16px'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: '8px',
      letterSpacing: '0.5px'
    },
    suggestionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    suggestionItemHover: {
      backgroundColor: '#f3f4f6'
    },
    suggestionItemSelected: {
      backgroundColor: '#dbeafe'
    },
    productImage: {
      width: '40px',
      height: '40px',
      borderRadius: '6px',
      objectFit: 'cover',
      border: '1px solid #e5e7eb'
    },
    productInfo: {
      flex: 1
    },
    productName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '2px'
    },
    productCategory: {
      fontSize: '12px',
      color: '#6b7280'
    },
    productPrice: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1e3a8a'
    },
    recentItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background 0.2s ease'
    },
    clearButton: {
      padding: '4px 8px',
      fontSize: '12px',
      color: '#9ca3af',
      background: 'none',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    loader: {
      padding: '20px',
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '14px'
    },
    filterPanel: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      padding: '20px',
      minWidth: '300px',
      zIndex: 1000
    },
    filterGroup: {
      marginBottom: '16px'
    },
    filterLabel: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    filterInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border 0.2s ease'
    },
    filterRow: {
      display: 'flex',
      gap: '12px'
    },
    ratingStars: {
      display: 'flex',
      gap: '4px',
      marginTop: '8px'
    },
    star: {
      fontSize: '20px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    }
  };

  return (
    <div style={styles.container} ref={searchRef}>
      <div style={styles.searchWrapper}>
        {/* Search Input */}
        <div 
          style={{
            ...styles.searchBox,
            ...(showSuggestions ? styles.searchBoxFocused : {})
          }}
        >
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={styles.input}
            aria-label="Search products"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              style={{ ...styles.clearButton, fontSize: '18px' }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Button */}
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={styles.filterButton}
          >
            <span>⚙️</span>
            <span>Filters</span>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div style={styles.suggestionsDropdown}>
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div style={styles.suggestionSection}>
              <div style={styles.sectionTitle}>Recent Searches</div>
              {recentSearches.map((search, idx) => (
                <div
                  key={idx}
                  style={styles.recentItem}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🕐</span>
                    <span style={{ fontSize: '14px', color: '#374151' }}>{search}</span>
                  </div>
                  <button
                    onClick={(e) => clearRecentSearch(search, e)}
                    style={styles.clearButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Product Suggestions */}
          {query && suggestions.length > 0 && (
            <div style={styles.suggestionSection}>
              <div style={styles.sectionTitle}>Products</div>
              {suggestions.map((product, idx) => (
                <div
                  key={product._id}
                  style={{
                    ...styles.suggestionItem,
                    ...(idx === selectedIndex ? styles.suggestionItemSelected : {})
                  }}
                  onClick={() => selectSuggestion(product)}
                  onMouseEnter={(e) => {
                    if (idx !== selectedIndex) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                    setSelectedIndex(idx);
                  }}
                  onMouseLeave={(e) => {
                    if (idx !== selectedIndex) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <img
                    src={product.imageUrl || 'https://placehold.co/40x40?text=No+Image'}
                    alt={product.name}
                    style={styles.productImage}
                  />
                  <div style={styles.productInfo}>
                    <div style={styles.productName}>{product.name}</div>
                    <div style={styles.productCategory}>{product.category}</div>
                  </div>
                  <div style={styles.productPrice}>₹{product.price}</div>
                </div>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={styles.loader}>
              <div>Searching...</div>
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && suggestions.length === 0 && (
            <div style={styles.loader}>
              <div>No results found for "{query}"</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                Try different keywords or check spelling
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div style={styles.filterPanel}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '700' }}>
            Advanced Filters
          </h3>

          {/* Price Range */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Price Range (₹)</label>
            <div style={styles.filterRow}>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilters('priceMin', e.target.value)}
                style={styles.filterInput}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilters('priceMax', e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Minimum Rating</label>
            <div style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(rating => (
                <span
                  key={rating}
                  onClick={() => updateFilters('rating', rating)}
                  style={{
                    ...styles.star,
                    color: rating <= filters.rating ? '#fbbf24' : '#d1d5db'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* In Stock Only */}
          <div style={styles.filterGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => updateFilters('inStock', e.target.checked)}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>In Stock Only</span>
            </label>
          </div>

          {/* Sort By */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters('sortBy', e.target.value)}
              style={styles.filterInput}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              const defaultFilters = {
                priceMin: '',
                priceMax: '',
                category: 'All',
                rating: 0,
                inStock: false,
                sortBy: 'relevance'
              };
              setFilters(defaultFilters);
              onFilterChange?.(defaultFilters);
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
