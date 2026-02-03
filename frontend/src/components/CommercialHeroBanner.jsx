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
      height: '500px',
      background: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)',
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
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '8px 16px',
      borderRadius: '24px',
      fontSize: '13px',
      fontWeight: 600,
      marginBottom: '24px',
      color: '#93C5FD'
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
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
    },
    secondaryCTA: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: '2px solid #FFFFFF'
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
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '2px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '8px',
      zIndex: 2
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
                e.target.style.backgroundColor = '#DC2626';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#EF4444';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
              onClick={() => window.location.hash = '#dashboard'}
            >
              <span>🛍️</span> SHOP NOW
            </button>

            <button
              style={{ ...styles.ctaButton, ...styles.secondaryCTA }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
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
