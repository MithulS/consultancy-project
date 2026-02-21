/**
 * SRI AMMAN TRADERS HERO BANNER
 * Showcasing genuine products from leading brands
 * Features: Hero section, brand highlights, CTAs, benefits panel
 */

import React, { useState } from 'react';
import ParticleBackground from './ParticleBackground';

export default function CommercialHeroBanner() {

  const styles = {
    heroSection: {
      position: 'relative',
      height: '600px',
      background: 'var(--gradient-navy-hero)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    },
    heroBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      opacity: 0.3,
      zIndex: 3,
      pointerEvents: 'none'
    },
    heroContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 24px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '48px',
      position: 'relative',
      zIndex: 10
    },
    heroContent: {
      flex: 1,
      color: '#FFFFFF',
      animation: 'fadeIn 0.8s ease-out'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      padding: '8px 16px',
      borderRadius: '24px',
      fontSize: '13px',
      fontWeight: 600,
      marginBottom: '24px',
      color: 'var(--accent-blue-primary)',
      boxShadow: 'var(--shadow-sm)'
    },
    heroTitle: {
      fontSize: '56px',
      fontWeight: 800,
      lineHeight: 1.1,
      marginBottom: '16px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'opacity, transform',
      containIntrinsicSize: '56px'
    },
    heroSubtitle: {
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: 1.1,
      willChange: 'opacity',
      marginBottom: '24px',
      color: '#E5E7EB'
    },
    heroDescription: {
      fontSize: '18px',
      lineHeight: 1.6,
      marginBottom: '32px',
      color: '#D1D5DB',
      maxWidth: '600px',
      animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards'
    },
    ctaContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px'
    },
    ctaButton: {
      padding: '16px 32px',
      fontSize: '16px',
      fontWeight: 600,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    primaryCTA: {
      background: 'linear-gradient(135deg, var(--accent-red-primary) 0%, var(--accent-red-active) 100%)',
      color: '#FFFFFF',
      boxShadow: '0 4px 15px var(--accent-red-glow)',
      border: 'none'
    },
    secondaryCTA: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
      boxShadow: 'var(--shadow-md)'
    },
    contactInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      color: '#D1D5DB'
    },
    phoneNumber: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#FFFFFF'
    },

    // Decorative boxes
    decorativeBox: {
      position: 'absolute',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-highlight)',
      borderRadius: '16px',
      zIndex: 2,
      boxShadow: 'var(--shadow-lg)'
    }
  };

  return (
    <section style={styles.heroSection}>
      {/* Enhanced Interactive Particle Background Animation */}
      <ParticleBackground
        particleCount={120}
        particleColor="rgba(255, 255, 255, 0.9)"
        lineColor="rgba(147, 197, 253, 0.4)"
        particleSize={3.5}
        speed={0.6}
        connectionDistance={160}
        enableWaveEffect={true}
        enableParallax={true}
        enableMouseRepel={true}
      />

      <div style={styles.heroBackground}></div>

      {/* Floating Animated Icons */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '15%',
        fontSize: '48px',
        opacity: 0.15,
        animation: 'float 6s ease-in-out infinite',
        zIndex: 4
      }}>⚡</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '10%',
        fontSize: '36px',
        opacity: 0.15,
        animation: 'float 8s ease-in-out infinite 1s',
        zIndex: 4
      }}>🔧</div>
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '12%',
        fontSize: '40px',
        opacity: 0.12,
        animation: 'float 7s ease-in-out infinite 2s',
        zIndex: 4
      }}>💡</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '18%',
        fontSize: '44px',
        opacity: 0.12,
        animation: 'float 9s ease-in-out infinite 3s',
        zIndex: 4
      }}>🔌</div>

      {/* Decorative Elements */}
      <div style={{ ...styles.decorativeBox, width: '150px', height: '150px', top: '50px', right: '200px', transform: 'rotate(15deg)' }}></div>
      <div style={{ ...styles.decorativeBox, width: '100px', height: '100px', bottom: '80px', left: '100px', transform: 'rotate(-10deg)' }}></div>

      <div style={styles.heroContainer}>
        {/* Hero Content */}
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span>✨</span>
            <span>GENUINE BRANDED PRODUCTS</span>
          </div>

          <h1 style={styles.heroTitle}>
            Sri Amman Traders
          </h1>

          <h2 style={styles.heroSubtitle}>
            Hardware, Electrical, Plumbing & Paints
          </h2>

          <p style={styles.heroDescription}>
            Trusted supplier of genuine products from leading brands - Finolex, Crompton, Asian Paints, Havells, Anchor, and Sintex. Serving retail and wholesale customers with quality, fair pricing, and reliable service.
          </p>

          <div style={styles.ctaContainer}>
            <button
              style={{ ...styles.ctaButton, ...styles.primaryCTA }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px var(--accent-red-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px var(--accent-red-glow)';
              }}
              onClick={() => window.location.hash = '#dashboard'}
            >
              <span>🛍️</span> SHOP NOW
            </button>

            <button
              style={{ ...styles.ctaButton, ...styles.secondaryCTA }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--glass-background)';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => {
                const wholesaleSection = document.getElementById('wholesale');
                if (wholesaleSection) {
                  wholesaleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.location.hash = '#contact';
                }
              }}
            >
              <span>📦</span> WHOLESALE INQUIRY
            </button>
          </div>

          <div style={styles.contactInfo}>
            <span style={{ fontSize: '18px' }}>📞</span>
            <div>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>Need assistance? Call us today</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Contact:</span>
                <span style={styles.phoneNumber}>+91 7904212501</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
