/**
 * HOME PAGE - CONVERSION OPTIMIZED LAYOUT
 * Components: Hero | Categories | Featured | Promotions | Products | Trust Badges | Footer
 */

import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import { getImageUrl } from '../utils/imageHandling';
import { showToast } from './ToastNotification';

export default function EcommerceHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  async function fetchFeaturedProducts() {
    try {
      const res = await fetch(`${API}/api/products?featured=true&limit=8`);
      const data = await res.json();
      if (res.ok) {
        setFeaturedProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch featured products');
    }
  }

  const categoryCards = [
    { name: 'Electrical', icon: '⚡', color: '#FEF3C7', link: '#products?category=Electrical' },
    { name: 'Plumbing', icon: '🚰', color: '#DBEAFE', link: '#products?category=Plumbing' },
    { name: 'Hardware', icon: '🔧', color: '#FEE2E2', link: '#products?category=Hardware' },
    { name: 'Tools', icon: '🛠️', color: '#E0E7FF', link: '#products?category=Tools' },
    { name: 'Lighting', icon: '💡', color: '#FEF3C7', link: '#products?category=Lighting' },
    { name: 'Paints', icon: '🎨', color: '#FECDD3', link: '#products?category=Paints' },
    { name: 'Heating', icon: '🔥', color: '#FFEDD5', link: '#products?category=Heating' },
    { name: 'Safety', icon: '🦺', color: '#D1FAE5', link: '#products?category=Safety' }
  ];

  const trustBadges = [
    { icon: '🚚', title: 'Free Shipping', subtitle: 'On orders above ₹999' },
    { icon: '🔒', title: 'Secure Payment', subtitle: '100% Protected' },
    { icon: '↩️', title: 'Easy Returns', subtitle: '30-day return policy' },
    { icon: '⚡', title: 'Fast Delivery', subtitle: 'Same day dispatch' }
  ];

  const supportedBrands = [
    { icon: '🔌', name: 'Finolex', category: 'Wiring & Pipes', description: 'Premium wires, cables, and PVC pipes' },
    { icon: '⚡', name: 'Crompton', category: 'Electrical', description: 'Quality fans, lighting, and electrical solutions' },
    { icon: '🎨', name: 'Asian Paints', category: 'Paints', description: 'India\'s leading paint manufacturer' },
    { icon: '💡', name: 'Havells', category: 'Switches & Electricals', description: 'Modular switches and electrical products' },
    { icon: '☀️', name: 'Anchor', category: 'Switches & Sockets', description: 'Trusted switches, sockets, and accessories' },
    { icon: '💧', name: 'Sintex', category: 'Water Storage', description: 'Durable water tanks and storage solutions' }
  ];

  const styles = {
    // Hero Banner
    hero: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#FFFFFF',
      padding: '80px 0',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    heroContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      position: 'relative',
      zIndex: 1
    },
    heroTitle: {
      fontSize: '48px',
      fontWeight: 800,
      marginBottom: '16px',
      lineHeight: 1.2
    },
    heroSubtitle: {
      fontSize: '20px',
      marginBottom: '32px',
      opacity: 0.95
    },
    heroCTA: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#FF6A00',
      color: '#FFFFFF',
      padding: '16px 32px',
      fontSize: '18px',
      fontWeight: 600,
      borderRadius: '9999px',
      textDecoration: 'none',
      transition: 'transform 250ms, box-shadow 250ms',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
    },

    // Section Container
    section: {
      padding: '64px 0'
    },
    sectionTitle: {
      fontSize: '36px',
      fontWeight: 700,
      color: '#111827',
      textAlign: 'center',
      marginBottom: '48px'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px'
    },

    // Category Cards Grid
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    categoryCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      textDecoration: 'none',
      border: '1px solid #E5E7EB',
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    },
    categoryIcon: {
      fontSize: '48px',
      marginBottom: '12px',
      display: 'block'
    },
    categoryName: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#374151'
    },

    // Product Grid
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px'
    },
    productCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #E5E7EB',
      transition: 'all 250ms',
      cursor: 'pointer',
      textDecoration: 'none',
      color: 'inherit'
    },
    productImage: {
      width: '100%',
      height: '240px',
      objectFit: 'cover',
      backgroundColor: '#F9FAFB'
    },
    productBody: {
      padding: '16px'
    },
    productTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '8px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    productPrice: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#0B74FF',
      marginBottom: '12px'
    },
    addToCartBtn: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#0B74FF',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 250ms'
    },

    // Promotional Tiles
    promoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    promoTile: {
      backgroundColor: '#F5F7FA',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      border: '2px solid #E5E7EB'
    },
    promoIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    promoTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#111827',
      marginBottom: '8px'
    },
    promoText: {
      fontSize: '16px',
      color: '#6B7280'
    },

    // Trust Badges
    trustBadges: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      backgroundColor: '#F5F7FA',
      padding: '48px 0',
      marginTop: '64px'
    },
    trustBadge: {
      textAlign: 'center'
    },
    trustIcon: {
      fontSize: '48px',
      marginBottom: '12px'
    },
    trustTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '4px'
    },
    trustSubtitle: {
      fontSize: '14px',
      color: '#6B7280'
    },

    // Brands Section
    brandsSection: {
      padding: '80px 0',
      background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 50%, #ffffff 100%)',
      textAlign: 'center',
      position: 'relative'
    },
    brandsTitle: {
      fontSize: '36px',
      fontWeight: '800',
      color: '#111827',
      marginBottom: '16px',
      letterSpacing: '-0.02em'
    },
    brandsSubtitle: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '56px',
      maxWidth: '600px',
      margin: '0 auto 56px'
    },
    brandsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px'
    },
    brandCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '40px 24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    brandCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderColor: '#1e3a8a'
    },
    brandIconWrapper: {
      width: '80px',
      height: '80px',
      margin: '0 auto 20px',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.08)'
    },
    brandIcon: {
      fontSize: '56px',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
    },
    brandName: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#111827',
      marginBottom: '8px',
      letterSpacing: '-0.01em'
    },
    brandCategory: {
      color: '#ef4444',
      fontWeight: '700',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      marginBottom: '12px',
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: '#fef2f2',
      borderRadius: '6px'
    },
    brandDescription: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: '1.7',
      marginTop: '16px'
    },

    // Footer
    footer: {
      backgroundColor: '#1F2937',
      color: '#FFFFFF',
      padding: '48px 0 24px'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '32px',
      marginBottom: '32px'
    },
    footerTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '16px'
    },
    footerLinks: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    footerLink: {
      color: '#D1D5DB',
      textDecoration: 'none',
      fontSize: '14px',
      display: 'block',
      marginBottom: '8px',
      transition: 'color 250ms'
    },
    footerBottom: {
      borderTop: '1px solid #374151',
      paddingTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#9CA3AF'
    }
  };

  return (
    <>
      {/* Hero Banner - Enhanced with better copy and social proof */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          {/* Trust Badge Above Title */}
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            ⭐ Rated 4.8/5 by 10,000+ Happy Customers
          </div>

          <h1 style={styles.heroTitle}>
            India's Most Trusted Hardware Store
          </h1>
          <p style={styles.heroSubtitle}>
            Premium Building Materials at Wholesale Prices • Free Shipping Above ₹999 • Same Day Delivery Available
          </p>

          {/* Dual CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#products" style={styles.heroCTA}>
              🛍️ Shop Now
            </a>
            <a href="#products?featured=true" style={{
              ...styles.heroCTA,
              background: 'white',
              color: '#667eea',
              border: '2px solid white'
            }}>
              ⚡ Today's Deals
            </a>
          </div>

          {/* Social Proof Indicators */}
          <div style={{
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            marginTop: '32px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <span style={{ fontSize: '24px' }}>📦</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>50,000+ Orders Delivered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <span style={{ fontSize: '24px' }}>🏆</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>ISO Certified Quality</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <span style={{ fontSize: '24px' }}>💯</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>100% Genuine Products</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
          <div style={styles.categoryGrid}>
            {categoryCards.map((cat, idx) => (
              <a
                key={idx}
                href={cat.link}
                style={{
                  ...styles.categoryCard,
                  backgroundColor: cat.color
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={styles.categoryIcon}>{cat.icon}</span>
                <div style={styles.categoryName}>{cat.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ ...styles.section, backgroundColor: '#F5F7FA' }}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Featured Products</h2>
          <div style={styles.productGrid}>
            {featuredProducts.slice(0, 8).map((product) => (
              <a
                key={product._id}
                href={`#product/${product._id}`}
                style={styles.productCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  style={styles.productImage}
                  loading="lazy"
                />
                <div style={styles.productBody}>
                  <h3 style={styles.productTitle}>{product.name}</h3>
                  <div style={styles.productPrice}>₹{product.price}</div>
                  <button
                    style={styles.addToCartBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Added to cart!', 'success');
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Tiles */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Choose Us</h2>
          <div style={styles.promoGrid}>
            <div style={styles.promoTile}>
              <div style={styles.promoIcon}>✨</div>
              <div style={styles.promoTitle}>Premium Quality</div>
              <div style={styles.promoText}>
                Sourced from top brands and manufacturers
              </div>
            </div>
            <div style={styles.promoTile}>
              <div style={styles.promoIcon}>💰</div>
              <div style={styles.promoTitle}>Best Prices</div>
              <div style={styles.promoText}>
                Competitive pricing with regular discounts
              </div>
            </div>
            <div style={styles.promoTile}>
              <div style={styles.promoIcon}>👨‍🔧</div>
              <div style={styles.promoTitle}>Expert Support</div>
              <div style={styles.promoText}>
                Professional guidance for your projects
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Brands Section */}
      <section style={styles.brandsSection}>
        <div style={styles.container}>
          <h2 style={styles.brandsTitle}>Our Supported Brands</h2>
          <p style={styles.brandsSubtitle}>
            Partnering with India's most trusted brands to bring you quality products
          </p>
          <div style={styles.brandsGrid}>
            {supportedBrands.map((brand, idx) => (
              <div
                key={idx}
                style={styles.brandCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = '#1e3a8a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                {/* Icon Wrapper with Gradient Background */}
                <div style={styles.brandIconWrapper}>
                  <div style={styles.brandIcon}>{brand.icon}</div>
                </div>

                <h3 style={styles.brandName}>{brand.name}</h3>
                <span style={styles.brandCategory}>{brand.category}</span>
                <p style={styles.brandDescription}>{brand.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges - Enhanced with Social Proof */}
      <section style={styles.trustBadges}>
        <div style={styles.container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {trustBadges.map((badge, idx) => (
              <div key={idx} style={styles.trustBadge}>
                <div style={styles.trustIcon}>{badge.icon}</div>
                <div style={styles.trustTitle}>{badge.title}</div>
                <div style={styles.trustSubtitle}>{badge.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Customer Testimonials & Social Proof */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            marginTop: '32px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              Loved by Professionals & DIY Enthusiasts
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {/* Testimonial 1 */}
              <div style={{
                padding: '24px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {'⭐'.repeat(5)}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  "Best quality products at unbeatable prices. Delivered my entire home renovation order on time!"
                </p>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                  - Rajesh Kumar, Contractor
                </div>
              </div>

              {/* Testimonial 2 */}
              <div style={{
                padding: '24px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {'⭐'.repeat(5)}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  "Genuine products with amazing customer service. Their expert advice helped me choose the right materials."
                </p>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                  - Priya Sharma, Homeowner
                </div>
              </div>

              {/* Testimonial 3 */}
              <div style={{
                padding: '24px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {'⭐'.repeat(5)}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  "Professional quality materials at wholesale rates. Saved 30% compared to local stores. Highly recommend!"
                </p>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                  - Amit Patel, Builder
                </div>
              </div>
            </div>

            {/* Certifications & Badges */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginTop: '32px',
              paddingTop: '32px',
              borderTop: '1px solid #e5e7eb',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏅</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>ISO 9001:2015</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>SSL Secured</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Verified Seller</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌟</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>4.8/5 Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerGrid}>
            <div>
              <div style={styles.footerTitle}>Company</div>
              <ul style={styles.footerLinks}>
                <li><a href="#about" style={styles.footerLink}>About Us</a></li>
                <li><a href="#contact" style={styles.footerLink}>Contact</a></li>
                <li><a href="#careers" style={styles.footerLink}>Careers</a></li>
                <li><a href="#press" style={styles.footerLink}>Press</a></li>
              </ul>
            </div>
            <div>
              <div style={styles.footerTitle}>Help & Support</div>
              <ul style={styles.footerLinks}>
                <li><a href="#faq" style={styles.footerLink}>FAQ</a></li>
                <li><a href="#shipping" style={styles.footerLink}>Shipping Info</a></li>
                <li><a href="#returns" style={styles.footerLink}>Returns</a></li>
                <li><a href="#track" style={styles.footerLink}>Track Order</a></li>
              </ul>
            </div>
            <div>
              <div style={styles.footerTitle}>Policies</div>
              <ul style={styles.footerLinks}>
                <li><a href="#privacy" style={styles.footerLink}>Privacy Policy</a></li>
                <li><a href="#terms" style={styles.footerLink}>Terms of Service</a></li>
                <li><a href="#warranty" style={styles.footerLink}>Warranty</a></li>
              </ul>
            </div>
            <div>
              <div style={styles.footerTitle}>Connect</div>
              <ul style={styles.footerLinks}>
                <li><a href="#facebook" style={styles.footerLink}>Facebook</a></li>
                <li><a href="#instagram" style={styles.footerLink}>Instagram</a></li>
                <li><a href="#twitter" style={styles.footerLink}>Twitter</a></li>
                <li><a href="#youtube" style={styles.footerLink}>YouTube</a></li>
              </ul>
            </div>
          </div>
          <div style={styles.footerBottom}>
            © 2025 Hardware Store. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
