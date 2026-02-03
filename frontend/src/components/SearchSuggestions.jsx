/**
 * Search Suggestions Component
 * Provides autocomplete and search suggestions
 */

import React, { useState, useEffect, useRef } from 'react';

export default function SearchSuggestions({ 
  searchTerm, 
  onSelectSuggestion,
  products = [],
  categories = [],
  show = false
}) {
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (!searchTerm || !show) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Filter products matching search term
    const productSuggestions = products
      .filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(p => ({
        type: 'product',
        value: p.name,
        category: p.category,
        price: p.price,
        image: p.imageUrl
      }));

    // Filter matching categories
    const categorySuggestions = categories
      .filter(c => c.toLowerCase().includes(term))
      .slice(0, 3)
      .map(c => ({
        type: 'category',
        value: c
      }));

    setSuggestions([...categorySuggestions, ...productSuggestions]);
  }, [searchTerm, products, categories, show]);

  if (!show || suggestions.length === 0) {
    return null;
  }

  return (
    <div style={styles.container} ref={suggestionsRef}>
      <div style={styles.header}>
        <span style={styles.headerText}>Suggestions</span>
        <span style={styles.count}>{suggestions.length}</span>
      </div>
      
      <div style={styles.list}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            style={styles.item}
            onClick={() => onSelectSuggestion(suggestion)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--glass-background)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {suggestion.type === 'category' ? (
              <div style={styles.categoryItem}>
                <span style={styles.icon}>📂</span>
                <div>
                  <div style={styles.suggestionText}>{suggestion.value}</div>
                  <div style={styles.suggestionType}>Category</div>
                </div>
              </div>
            ) : (
              <div style={styles.productItem}>
                <img 
                  src={suggestion.image || 'https://placehold.co/40x40'} 
                  alt={suggestion.value}
                  style={styles.productImage}
                />
                <div style={styles.productInfo}>
                  <div style={styles.suggestionText}>{suggestion.value}</div>
                  <div style={styles.productMeta}>
                    <span style={styles.productCategory}>{suggestion.category}</span>
                    <span style={styles.productPrice}>${suggestion.price}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>Press Enter to search</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '8px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    overflow: 'hidden',
    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'rgba(102, 126, 234, 0.05)'
  },
  headerText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  count: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent-blue-primary)',
    background: 'rgba(102, 126, 234, 0.1)',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  list: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  item: {
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '1px solid var(--border-subtle)'
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  icon: {
    fontSize: '24px'
  },
  suggestionText: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  suggestionType: {
    fontSize: '12px',
    color: 'var(--text-tertiary)'
  },
  productItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  productImage: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover',
    background: 'var(--skeleton-base)'
  },
  productInfo: {
    flex: 1
  },
  productMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  productCategory: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    background: 'rgba(102, 126, 234, 0.1)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  productPrice: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent-blue-primary)'
  },
  footer: {
    padding: '8px 16px',
    background: 'rgba(102, 126, 234, 0.05)',
    borderTop: '1px solid var(--border-subtle)'
  },
  footerText: {
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    fontStyle: 'italic'
  }
};

// Inject animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dark-navy-theme .search-suggestions {
    background: rgba(30, 41, 59, 0.95);
  }
`;

if (!document.querySelector('[data-search-suggestions-styles]')) {
  styleSheet.setAttribute('data-search-suggestions-styles', 'true');
  document.head.appendChild(styleSheet);
}
