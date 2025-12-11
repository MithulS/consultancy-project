/**
 * HEADER COMPONENT
 * Conversion-optimized navigation with mega-menu
 * Implements: Logo | Mega Menu | Search | Account | Wishlist | Cart
 */

import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EcommerceHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showMegaMenu, setShowMegaMenu] = useState(null);
  const [showPromo, setShowPromo] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load cart count
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  const megaMenuCategories = [
    {
      name: 'Electrical',
      icon: '⚡',
      subcategories: ['Wiring & Cables', 'Switches & Sockets', 'Circuit Breakers', 'LED Bulbs', 'Fans & Appliances']
    },
    {
      name: 'Plumbing',
      icon: '🚰',
      subcategories: ['Pipes & Fittings', 'Taps & Faucets', 'Bathroom Fixtures', 'Water Heaters', 'Drainage Systems']
    },
    {
      name: 'Hardware',
      icon: '🔧',
      subcategories: ['Door & Window Fittings', 'Locks & Handles', 'Hinges & Brackets', 'Fasteners', 'Furniture Hardware']
    },
    {
      name: 'Tools',
      icon: '🛠️',
      subcategories: ['Power Tools', 'Hand Tools', 'Measuring Tools', 'Cutting Tools', 'Tool Kits']
    },
    {
      name: 'Lighting',
      icon: '💡',
      subcategories: ['LED Lights', 'Chandeliers', 'Wall Lamps', 'Outdoor Lighting', 'Smart Lighting']
    },
    {
      name: 'Paints',
      icon: '🎨',
      subcategories: ['Interior Paint', 'Exterior Paint', 'Wood Finishes', 'Primers', 'Painting Tools']
    },
    {
      name: 'Heating',
      icon: '🔥',
      subcategories: ['Water Heaters', 'Room Heaters', 'Geysers', 'Thermostats', 'Boilers']
    },
    {
      name: 'Safety',
      icon: '🦺',
      subcategories: ['Safety Gear', 'First Aid', 'Fire Safety', 'Security Systems', 'Protective Equipment']
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.hash = `#products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const styles = {
    // Promotional Strip
    promoBar: {
      backgroundColor: '#1F2937',
      color: '#FFFFFF',
      padding: '8px 0',
      fontSize: '14px',
      textAlign: 'center',
      position: 'relative',
      zIndex: 1031
    },
    promoText: {
      margin: 0,
      fontWeight: 500
    },
    promoClose: {
      position: 'absolute',
      right: '24px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      color: '#FFFFFF',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '4px 8px'
    },

    // Main Header
    header: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      position: 'sticky',
      top: 0,
      zIndex: 1030,
      transition: 'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
    },
    headerContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '32px'
    },

    // Logo Section
    logo: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: '#0B74FF',
      fontSize: '24px',
      fontWeight: 700,
      gap: '8px',
      minWidth: '180px'
    },

    // Navigation Section
    nav: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center'
    },
    navList: {
      display: 'flex',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      gap: '8px'
    },
    navItem: {
      position: 'relative'
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '12px 16px',
      fontSize: '16px',
      fontWeight: 500,
      color: '#374151',
      textDecoration: 'none',
      borderRadius: '8px',
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    },
    navLinkHover: {
      backgroundColor: '#F3F4F6',
      color: '#0B74FF'
    },

    // Mega Menu
    megaMenu: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '8px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      minWidth: '800px',
      zIndex: 1060,
      animation: 'fadeInDown 250ms ease-out'
    },
    megaMenuGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px'
    },
    megaMenuCategory: {
      textDecoration: 'none'
    },
    megaMenuTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: 600,
      color: '#0B74FF',
      marginBottom: '12px'
    },
    megaMenuList: {
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    megaMenuLink: {
      display: 'block',
      padding: '6px 0',
      fontSize: '14px',
      color: '#6B7280',
      textDecoration: 'none',
      transition: 'color 150ms'
    },

    // Search Section
    searchContainer: {
      flex: '0 0 400px',
      position: 'relative'
    },
    searchForm: {
      position: 'relative',
      width: '100%'
    },
    searchInput: {
      width: '100%',
      padding: '12px 48px 12px 16px',
      fontSize: '16px',
      border: '1px solid #D1D5DB',
      borderRadius: '9999px',
      outline: 'none',
      transition: 'all 250ms',
      backgroundColor: '#F9FAFB'
    },
    searchButton: {
      position: 'absolute',
      right: '4px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#0B74FF',
      border: 'none',
      borderRadius: '9999px',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#FFFFFF',
      fontSize: '18px',
      transition: 'background-color 250ms'
    },

    // Actions Section
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      minWidth: '180px',
      justifyContent: 'flex-end'
    },
    actionButton: {
      position: 'relative',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '24px',
      color: '#374151',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 250ms',
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none'
    },
    badge: {
      position: 'absolute',
      top: '0',
      right: '0',
      backgroundColor: '#FF6A00',
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: 600,
      padding: '2px 6px',
      borderRadius: '9999px',
      minWidth: '20px',
      textAlign: 'center'
    }
  };

  return (
    <>
      {/* Promotional Strip */}
      {showPromo && (
        <div style={styles.promoBar}>
          <p style={styles.promoText}>
            ⚡ FREE SHIPPING on orders above ₹999 | Use code: FREESHIP | Limited Time Offer!
          </p>
          <button 
            style={styles.promoClose}
            onClick={() => setShowPromo(false)}
            aria-label="Close promotional banner"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Logo */}
          <a href="#dashboard" style={styles.logo} aria-label="Homepage">
            <span>🏠</span>
            <span>Hardware Store</span>
          </a>

          {/* Navigation with Mega Menu */}
          <nav style={styles.nav} role="navigation">
            <ul style={styles.navList}>
              <li style={styles.navItem}>
                <a 
                  style={styles.navLink}
                  onMouseEnter={() => setShowMegaMenu('categories')}
                  onMouseLeave={() => setShowMegaMenu(null)}
                >
                  Categories ▾
                </a>
                {showMegaMenu === 'categories' && (
                  <div 
                    style={styles.megaMenu}
                    onMouseEnter={() => setShowMegaMenu('categories')}
                    onMouseLeave={() => setShowMegaMenu(null)}
                  >
                    <div style={styles.megaMenuGrid}>
                      {megaMenuCategories.map((category, idx) => (
                        <div key={idx}>
                          <div style={styles.megaMenuTitle}>
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          <ul style={styles.megaMenuList}>
                            {category.subcategories.map((sub, subIdx) => (
                              <li key={subIdx}>
                                <a 
                                  href={`#products?category=${category.name}&sub=${sub}`}
                                  style={styles.megaMenuLink}
                                >
                                  {sub}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
              <li style={styles.navItem}>
                <a href="#products" style={styles.navLink}>All Products</a>
              </li>
              <li style={styles.navItem}>
                <a href="#deals" style={styles.navLink}>🏷️ Deals</a>
              </li>
              <li style={styles.navItem}>
                <a href="#new-arrivals" style={styles.navLink}>✨ New</a>
              </li>
            </ul>
          </nav>

          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <form onSubmit={handleSearch} style={styles.searchForm}>
              <input
                type="search"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
                aria-label="Search products"
              />
              <button 
                type="submit" 
                style={styles.searchButton}
                aria-label="Search"
              >
                🔍
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <a 
              href="#profile" 
              style={styles.actionButton}
              aria-label="My Account"
              title="My Account"
            >
              👤
            </a>
            <a 
              href="#wishlist" 
              style={{...styles.actionButton, position: 'relative'}}
              aria-label="Wishlist"
              title="Wishlist"
            >
              ❤️
              {wishlistCount > 0 && <span style={styles.badge}>{wishlistCount}</span>}
            </a>
            <a 
              href="#cart" 
              style={{...styles.actionButton, position: 'relative'}}
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              🛒
              {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
            </a>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
