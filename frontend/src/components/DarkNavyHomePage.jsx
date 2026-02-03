/**
 * DARK NAVY THEMED HOMEPAGE
 * 
 * A complete e-commerce homepage featuring:
 * - Dark navy gradient background
 * - Hero section with call-to-action
 * - Category showcase with glassmorphism
 * - Featured products grid with premium cards
 * - Trust badges and promotional sections
 * - Red and blue accent buttons
 * 
 * Apply the dark-navy-theme class to enable the premium dark theme
 */

import React, { useState, useEffect } from 'react';
import DarkThemeProductCard from './DarkThemeProductCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DarkNavyHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product) => {
    // Add to cart logic
    console.log('Add to cart:', product);
  };

  const handleBuyNow = (product) => {
    // Buy now logic
    console.log('Buy now:', product);
  };

  const categories = [
    { name: 'Electrical', icon: '⚡', color: '#2e86de', count: 245 },
    { name: 'Plumbing', icon: '🚰', color: '#00d2d3', count: 189 },
    { name: 'Hardware', icon: '🔧', color: '#ff4757', count: 356 },
    { name: 'Tools', icon: '🛠️', color: '#ff9f43', count: 412 },
    { name: 'Lighting', icon: '💡', color: '#feca57', count: 178 },
    { name: 'Paints', icon: '🎨', color: '#a55eea', count: 203 },
    { name: 'Heating', icon: '🔥', color: '#ff6348', count: 145 },
    { name: 'Safety', icon: '🦺', color: '#2ecc71', count: 167 },
  ];

  const trustBadges = [
    { icon: '🚚', title: 'Free Shipping', description: 'On orders above ₹999', color: '#2e86de' },
    { icon: '🔒', title: 'Secure Payment', description: '100% Protected checkout', color: '#2ecc71' },
    { icon: '↩️', title: 'Easy Returns', description: '30-day money back', color: '#ff9f43' },
    { icon: '⚡', title: 'Fast Delivery', description: 'Same day dispatch', color: '#ff4757' },
  ];

  const promotions = [
    {
      title: 'New Year Sale',
      subtitle: 'Up to 50% OFF on all tools',
      cta: 'Shop Now',
      gradient: 'linear-gradient(135deg, #ff4757 0%, #ee2a3a 100%)',
    },
    {
      title: 'Premium Hardware',
      subtitle: 'Best quality at best prices',
      cta: 'Explore',
      gradient: 'linear-gradient(135deg, #2e86de 0%, #2472c4 100%)',
    },
  ];

  return (
    <div className="dark-navy-theme">
      {/* Header Navigation */}
      <header className="header">
        <div className="header-container">
          <a href="/" className="logo">
            <span className="logo-icon">🔨</span>
            <span className="logo-text">HomeHardware</span>
          </a>

          <nav>
            <ul className="nav-menu">
              <li><a href="#home" className="nav-link">Home</a></li>
              <li><a href="#products" className="nav-link">Products</a></li>
              <li><a href="#categories" className="nav-link">Categories</a></li>
              <li><a href="#deals" className="nav-link">Deals</a></li>
              <li><a href="#contact" className="nav-link">Contact</a></li>
            </ul>
          </nav>

          <div className="nav-actions">
            <button className="icon-button" aria-label="Search">
              🔍
            </button>
            <button className="icon-button" aria-label="Wishlist">
              ❤️
              <span className="badge">3</span>
            </button>
            <button className="icon-button" aria-label="Shopping Cart">
              🛒
              <span className="badge">5</span>
            </button>
            <button className="btn-red btn-sm">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Premium Hardware Store
          </h1>
          <p className="hero-subtitle">
            Discover top-quality tools and hardware at unbeatable prices. 
            Fast shipping, secure payment, and expert support.
          </p>
          <div className="hero-cta">
            <button className="btn-buy-now btn-lg">
              🛍️ Shop Now
            </button>
            <button className="btn-blue btn-lg">
              📦 Track Order
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section">
        <div className="container">
          <h2 className="heading-2 text-center" style={{ marginBottom: '48px' }}>
            Shop by Category
          </h2>
          <div className="category-grid">
            {categories.map((category, index) => (
              <a 
                href={`#category/${category.name.toLowerCase()}`} 
                className="category-card"
                key={index}
              >
                <span className="category-icon">{category.icon}</span>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">{category.count} Products</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="section" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="container">
          <div style={styles.promoGrid}>
            {promotions.map((promo, index) => (
              <div 
                key={index}
                style={{
                  ...styles.promoCard,
                  background: promo.gradient,
                }}
              >
                <h3 style={styles.promoTitle}>{promo.title}</h3>
                <p style={styles.promoSubtitle}>{promo.subtitle}</p>
                <button className="btn-ghost" style={{ marginTop: '20px' }}>
                  {promo.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <h2 className="heading-2 text-center" style={{ marginBottom: '48px' }}>
            Featured Products
          </h2>
          
          {loading ? (
            <div className="flex-center" style={{ padding: '60px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div style={styles.productGrid}>
              {featuredProducts.map((product) => (
                <DarkThemeProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center" style={{ marginTop: '48px' }}>
            <button className="btn-blue btn-lg">
              View All Products →
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <div style={styles.trustGrid}>
            {trustBadges.map((badge, index) => (
              <div key={index} style={styles.trustCard}>
                <div style={{ ...styles.trustIcon, color: badge.color }}>
                  {badge.icon}
                </div>
                <h4 style={styles.trustTitle}>{badge.title}</h4>
                <p style={styles.trustDescription}>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={styles.newsletterCard}>
            <h2 className="heading-2 text-center" style={{ marginBottom: '16px' }}>
              Subscribe to Our Newsletter
            </h2>
            <p className="text-large text-center" style={{ marginBottom: '32px', color: '#c5d0de' }}>
              Get exclusive deals, new arrivals, and expert tips delivered to your inbox
            </p>
            <div style={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Enter your email address"
                style={styles.emailInput}
              />
              <button className="btn-red btn-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="container">
          <div style={styles.footerGrid}>
            <div>
              <h3 style={styles.footerHeading}>About Us</h3>
              <p style={styles.footerText}>
                Your trusted partner for quality hardware and tools. 
                Serving customers with excellence since 2020.
              </p>
            </div>
            <div>
              <h3 style={styles.footerHeading}>Quick Links</h3>
              <ul style={styles.footerLinks}>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#shipping">Shipping Info</a></li>
                <li><a href="#returns">Returns Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 style={styles.footerHeading}>Customer Service</h3>
              <ul style={styles.footerLinks}>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#support">Support</a></li>
                <li><a href="#track">Track Order</a></li>
                <li><a href="#warranty">Warranty</a></li>
              </ul>
            </div>
            <div>
              <h3 style={styles.footerHeading}>Connect With Us</h3>
              <div style={styles.socialLinks}>
                <a href="#facebook" style={styles.socialIcon}>📘</a>
                <a href="#twitter" style={styles.socialIcon}>🐦</a>
                <a href="#instagram" style={styles.socialIcon}>📷</a>
                <a href="#linkedin" style={styles.socialIcon}>💼</a>
              </div>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p style={{ color: '#8fa3b8', fontSize: '0.875rem' }}>
              © 2026 HomeHardware. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  promoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  promoCard: {
    padding: '48px 32px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  promoTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '12px',
  },
  promoSubtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
  },
  trustCard: {
    textAlign: 'center',
    padding: '32px 24px',
    background: 'rgba(26, 41, 66, 0.5)',
    borderRadius: '16px',
    border: '1px solid rgba(74, 102, 133, 0.25)',
    backdropFilter: 'blur(20px)',
  },
  trustIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
    filter: 'drop-shadow(0 4px 12px currentColor)',
  },
  trustTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
  },
  trustDescription: {
    fontSize: '0.9375rem',
    color: '#8fa3b8',
  },
  newsletterCard: {
    background: 'rgba(26, 41, 66, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(74, 102, 133, 0.25)',
    borderRadius: '24px',
    padding: '60px 40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  newsletterForm: {
    display: 'flex',
    gap: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  emailInput: {
    flex: '1 1 300px',
    minWidth: '250px',
  },
  footer: {
    background: 'rgba(10, 22, 40, 0.95)',
    borderTop: '1px solid rgba(74, 102, 133, 0.25)',
    padding: '60px 0 20px',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  footerHeading: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px',
  },
  footerText: {
    fontSize: '0.9375rem',
    color: '#8fa3b8',
    lineHeight: '1.6',
  },
  footerLinks: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  socialLinks: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
  },
  socialIcon: {
    fontSize: '1.75rem',
    textDecoration: 'none',
    transition: 'transform 0.3s ease',
  },
  footerBottom: {
    borderTop: '1px solid rgba(74, 102, 133, 0.15)',
    paddingTop: '24px',
    textAlign: 'center',
  },
};
