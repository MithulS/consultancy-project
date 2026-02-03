/**
 * SRI AMMAN TRADERS HOME PAGE
 * Hardware, Electrical, Plumbing & Paint Materials Store
 * Serving retail and wholesale customers with genuine branded products
 */

import React, { useState, useEffect } from 'react';
import CommercialHardwareHeader from './CommercialHardwareHeader';
import CommercialHeroBanner from './CommercialHeroBanner';
import SmartButton from './SmartButton';
import Footer from './Footer';
import SkeletonLoader from './SkeletonLoader';
import ProductRating from './ProductRating';
import EmptyState from './EmptyState';
import OptimizedImage from './OptimizedImage';
import { getImageUrl } from '../utils/imageHandling';
import Loader from './Loader';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { FEATURED_BRANDS } from '../utils/constants';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CommercialHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Animation hooks
  const [titleRef, titleVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [selectedCategory]);

  async function fetchFeaturedProducts() {
    try {
      setLoading(true);
      const query = selectedCategory !== 'All' ? `?category=${selectedCategory}` : '';
      const separator = query ? '&' : '?';
      const res = await fetch(`${API}/api/products${query}${separator}limit=12`);
      const data = await res.json();
      if (res.ok) {
        setFeaturedProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: {
      minHeight: '100vh',
      // Background handled by .dark-navy-theme class on body
    },

    // Featured Products Section
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 24px'
    },
    sectionTitle: {
      fontSize: '42px',
      fontWeight: 800,
      color: 'var(--text-primary)',
      textAlign: 'center',
      marginBottom: '64px',
      letterSpacing: '-0.02em',
      opacity: 0,
      transform: 'translateY(20px)',
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      ...(titleVisible && { opacity: 1, transform: 'translateY(0)' })
    },
    productsSection: {
      padding: '64px 0',
      position: 'relative',
      overflow: 'hidden'
      // Transparent to show body gradient
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      opacity: 0,
      transform: 'translateY(30px)',
      transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
      ...(gridVisible && { opacity: 1, transform: 'translateY(0)' })
    },

    // About Section
    aboutSection: {
      padding: '80px 0',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
      borderTop: '1px solid #E5E7EB',
      borderBottom: '1px solid #E5E7EB'
    },
    aboutContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '48px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    aboutCard: {
      textAlign: 'center',
      padding: '32px',
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease'
    },
    aboutIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    aboutTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#111827',
      marginBottom: '12px'
    },
    aboutText: {
      fontSize: '15px',
      color: '#6B7280',
      lineHeight: 1.6
    },

    // Featured Brands Section
    brandsSection: {
      padding: '80px 0',
      background: '#FFFFFF'
    },
    brandsTitle: {
      fontSize: '36px',
      fontWeight: 800,
      color: '#111827',
      textAlign: 'center',
      marginBottom: '16px'
    },
    brandsSubtitle: {
      fontSize: '18px',
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: '48px'
    },
    brandsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    brandCard: {
      background: '#F9FAFB',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    brandLogo: {
      fontSize: '48px',
      marginBottom: '12px'
    },
    brandName: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#111827',
      marginBottom: '4px'
    },
    brandCategory: {
      fontSize: '13px',
      color: '#EF4444',
      fontWeight: 600,
      marginBottom: '8px'
    },
    brandDescription: {
      fontSize: '14px',
      color: '#6B7280',
      lineHeight: 1.5
    },

    productCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    },
    // Hover state handled by class .hover-lift in global css, or inline:
    // We can add simple inline hover logic if needed, but CSS class is better.

    productImage: {
      width: '100%',
      height: '240px',
      objectFit: 'cover',
      backgroundColor: '#f9fafb'
    },
    productInfo: {
      padding: '20px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    productCategory: {
      fontSize: '11px',
      fontWeight: 600,
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      padding: '4px 8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px',
      width: 'fit-content'
    },
    productName: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      lineHeight: 1.5,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: '48px'
    },
    productPrice: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#111827',
      marginTop: 'auto',
      paddingTop: '12px'
    },
    addToCartButton: {
      width: '100%',
      padding: '12px 16px',
      background: '#4285F4',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '12px'
    },


    // Loading State
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '64px 0'
    },
    // Spinner replaced by Loader component

    // CTA Section
    ctaSection: {
      background: 'var(--gradient-navy-secondary)',
      color: 'var(--text-primary)',
      padding: '100px 0',
      textAlign: 'center',
      marginTop: '64px',
      borderTop: '1px solid var(--border-subtle)',
      position: 'relative',
      overflow: 'hidden'
    },
    ctaTitle: {
      fontSize: '48px',
      fontWeight: 800,
      marginBottom: '24px',
      background: 'linear-gradient(135deg, #ffffff 0%, var(--accent-blue-primary) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    ctaSubtitle: {
      fontSize: '20px',
      marginBottom: '40px',
      color: 'var(--text-secondary)',
      maxWidth: '600px',
      margin: '0 auto 40px'
    },
    ctaButton: {
      padding: '16px 48px',
      background: 'linear-gradient(135deg, #ff4757 0%, #ee2a3a 100%)', // Red gradient
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px var(--accent-red-glow)'
    },

    // Footer
    footer: {
      background: 'var(--navy-darkest)',
      color: 'var(--text-secondary)',
      padding: '64px 0 32px',
      borderTop: '1px solid var(--border-subtle)'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '48px',
      marginBottom: '48px'
    },
    footerColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    footerTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: 'var(--text-primary)',
      marginBottom: '8px'
    },
    footerLink: {
      fontSize: '15px',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      transition: 'color 0.2s'
    },
    footerBottom: {
      borderTop: '1px solid var(--border-secondary)',
      paddingTop: '32px',
      textAlign: 'center',
      fontSize: '14px',
      color: 'var(--text-tertiary)'
    }
  };

  // Add CSS animation for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('Product added to cart!');
  };

  return (
    <div style={styles.page}>
      <CommercialHardwareHeader />
      <CommercialHeroBanner />

      {/* About Sri Amman Traders */}
      <section style={styles.aboutSection}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, opacity: 1, transform: 'none', marginBottom: '48px' }}>
            Why Choose Sri Amman Traders?
          </h2>
          <div style={styles.aboutContent}>
            <div 
              style={styles.aboutCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={styles.aboutIcon}>✅</div>
              <h3 style={styles.aboutTitle}>Genuine Products</h3>
              <p style={styles.aboutText}>
                100% authentic products from authorized dealers of leading brands like Finolex, Crompton, Asian Paints, Havells, Anchor, and Sintex.
              </p>
            </div>
            <div 
              style={styles.aboutCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={styles.aboutIcon}>💰</div>
              <h3 style={styles.aboutTitle}>Fair Pricing</h3>
              <p style={styles.aboutText}>
                Competitive prices for both retail and wholesale customers. Special bulk discounts available for contractors and businesses.
              </p>
            </div>
            <div 
              style={styles.aboutCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={styles.aboutIcon}>🤝</div>
              <h3 style={styles.aboutTitle}>Reliable Service</h3>
              <p style={styles.aboutText}>
                Expert guidance, prompt delivery, and dedicated customer support. Building long-term relationships with our customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section style={styles.brandsSection}>
        <div style={styles.container}>
          <h2 style={styles.brandsTitle}>Trusted Brands We Carry</h2>
          <p style={styles.brandsSubtitle}>
            Authorized dealer of India's leading manufacturers
          </p>
          <div style={styles.brandsGrid}>
            {FEATURED_BRANDS.map((brand, index) => (
              <div
                key={index}
                style={styles.brandCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#EF4444';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.brandLogo}>{brand.logo}</div>
                <div style={styles.brandName}>{brand.name}</div>
                <div style={styles.brandCategory}>{brand.category}</div>
                <div style={styles.brandDescription}>{brand.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={styles.productsSection} id="products-section">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle} ref={titleRef}>
            {selectedCategory === 'All' ? 'Featured Products' : `${selectedCategory} Products`}
          </h2>

          {loading ? (
            <div style={styles.loadingContainer}>
              <Loader size={60} />
            </div>
          ) : (
            <div className="products-grid" style={styles.productsGrid} ref={gridRef}>
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  style={styles.productCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <OptimizedImage
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      width={280}
                      height={280}
                      priority={featuredProducts.indexOf(product) < 3}
                      style={styles.productImage}
                    />
                    <div className="card-overlay" style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.05) 0%, transparent 100%)',
                      pointerEvents: 'none'
                    }} />
                  </div>
                  <div style={styles.productInfo}>
                    <div style={styles.productCategory}>{product.category}</div>
                    <div style={styles.productName}>{product.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
                      <div style={styles.productPrice}>
                        ${product.price?.toFixed(2) || '0.00'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#059669',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>📦</span> Wholesale rates available
                      </div>
                    </div>
                    <SmartButton
                      onClick={async (e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                        return true; // Show success animation
                      }}
                      variant="primary"
                      size="medium"
                      style={{ width: '100%' }}
                    >
                      Add to Cart
                    </SmartButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Wholesale Inquiry */}
      <section id="wholesale" style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Looking for Wholesale Pricing?</h2>
          <p style={styles.ctaSubtitle}>
            We serve contractors, builders, and businesses with special bulk pricing and dedicated support. Contact us for wholesale rates and custom orders.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={{
                ...styles.ctaButton,
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
              }}
              onClick={() => {
                window.location.href = 'tel:+917904212501';
              }}
              aria-label="Call for wholesale inquiry"
              title="Call us for wholesale pricing"
            >
              📞 Call for Wholesale Inquiry
            </button>
            <button
              style={{
                ...styles.ctaButton,
                background: 'transparent',
                border: '2px solid #EF4444',
                color: '#EF4444'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.background = '#EF4444';
                e.target.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.background = 'transparent';
                e.target.style.color = '#EF4444';
              }}
              onClick={() => {
                window.location.hash = '#contact';
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
              aria-label="Contact for bulk orders"
              title="Submit wholesale inquiry form"
            >
              📧 Submit Wholesale Inquiry
            </button>
          </div>
          <div style={{
            marginTop: '32px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div>✅ Bulk Discounts Available</div>
            <div>✅ Credit Terms for Regular Customers</div>
            <div>✅ Direct Factory Prices</div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <Footer theme="dark" />
    </div>
  );
}
