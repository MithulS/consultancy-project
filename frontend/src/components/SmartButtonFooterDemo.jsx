/**
 * SMART BUTTON & FOOTER DEMO
 * Interactive showcase of the new UI improvements
 * Use this to test and demonstrate the features
 */

import React from 'react';
import SmartButton from './SmartButton';
import Footer from './Footer';

export default function SmartButtonFooterDemo() {
  const simulateCartAdd = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Item added to cart');
  };

  const styles = {
    demo: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 20px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '60px',
    },
    title: {
      fontSize: '48px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #4285F4 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '16px',
    },
    subtitle: {
      fontSize: '20px',
      color: '#a0a0a0',
      fontWeight: '400',
    },
    section: {
      marginBottom: '80px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '20px',
      padding: '40px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    sectionTitle: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '24px',
      color: '#ffffff',
    },
    description: {
      fontSize: '16px',
      color: '#b0b0b0',
      marginBottom: '32px',
      lineHeight: '1.6',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginTop: '32px',
    },
    demo_item: {
      padding: '24px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    label: {
      fontSize: '14px',
      color: '#888',
      marginBottom: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontWeight: '600',
    },
    productCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxWidth: '300px',
    },
    productImage: {
      width: '100%',
      height: '200px',
      background: 'linear-gradient(135deg, #4285F4 0%, #764ba2 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '64px',
      marginBottom: '16px',
    },
    productName: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '8px',
    },
    productPrice: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#4285F4',
      marginBottom: '16px',
    },
    code: {
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#50fa7b',
      overflow: 'auto',
      marginTop: '16px',
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '8px',
    },
    icon: {
      fontSize: '24px',
    },
  };

  return (
    <div style={styles.demo}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>✨ Smart Button & Footer Demo</h1>
          <p style={styles.subtitle}>
            High-impact UI improvements for modern e-commerce
          </p>
        </div>

        {/* Smart Button Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🎯 Smart Button - Micro-interactions</h2>
          <p style={styles.description}>
            Interactive buttons that provide instant visual feedback without disrupting user flow.
            Watch the button transform through idle → loading → success states.
          </p>

          {/* Variants Demo */}
          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#e0e0e0' }}>
            Variants
          </h3>
          <div style={styles.grid}>
            <div style={styles.demo_item}>
              <div style={styles.label}>Primary (Default)</div>
              <SmartButton
                onClick={simulateCartAdd}
                variant="primary"
              >
                🛒 Add to Cart
              </SmartButton>
            </div>

            <div style={styles.demo_item}>
              <div style={styles.label}>Secondary</div>
              <SmartButton
                onClick={simulateCartAdd}
                variant="secondary"
              >
                ❤️ Add to Wishlist
              </SmartButton>
            </div>

            <div style={styles.demo_item}>
              <div style={styles.label}>Success</div>
              <SmartButton
                onClick={simulateCartAdd}
                variant="success"
              >
                ✓ Subscribe
              </SmartButton>
            </div>

            <div style={styles.demo_item}>
              <div style={styles.label}>Dark</div>
              <SmartButton
                onClick={simulateCartAdd}
                variant="dark"
              >
                📥 Download
              </SmartButton>
            </div>
          </div>

          {/* Sizes Demo */}
          <h3 style={{ fontSize: '20px', marginTop: '40px', marginBottom: '16px', color: '#e0e0e0' }}>
            Sizes
          </h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <SmartButton size="small" onClick={simulateCartAdd}>
              Small
            </SmartButton>
            <SmartButton size="medium" onClick={simulateCartAdd}>
              Medium (Default)
            </SmartButton>
            <SmartButton size="large" onClick={simulateCartAdd}>
              Large
            </SmartButton>
          </div>

          {/* Product Card Example */}
          <h3 style={{ fontSize: '20px', marginTop: '40px', marginBottom: '16px', color: '#e0e0e0' }}>
            Real-World Example
          </h3>
          <div style={styles.productCard}>
            <div style={styles.productImage}>🔧</div>
            <div style={styles.productName}>Premium Door Handle</div>
            <div style={styles.productPrice}>$49.99</div>
            <SmartButton
              onClick={simulateCartAdd}
              style={{ width: '100%' }}
            >
              🛒 Add to Cart
            </SmartButton>
          </div>

          {/* Code Example */}
          <h3 style={{ fontSize: '20px', marginTop: '40px', marginBottom: '16px', color: '#e0e0e0' }}>
            Usage Example
          </h3>
          <pre style={styles.code}>{`<SmartButton
  onClick={async () => {
    await addToCart(product);
    return true; // Show success
  }}
  variant="primary"
  size="medium"
  disabled={!inStock}
>
  🛒 Add to Cart
</SmartButton>`}</pre>

          {/* Features */}
          <h3 style={{ fontSize: '20px', marginTop: '40px', marginBottom: '16px', color: '#e0e0e0' }}>
            Key Features
          </h3>
          <div style={styles.feature}>
            <span style={styles.icon}>🎨</span>
            <span>3-state animation: Idle → Loading → Success</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>⚡</span>
            <span>GPU-accelerated CSS animations</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>♿</span>
            <span>Fully accessible with ARIA labels</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>🔧</span>
            <span>Highly customizable (variants, sizes, styles)</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>🔄</span>
            <span>Auto-resets after success (configurable)</span>
          </div>
        </section>

        {/* Footer Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🏢 Professional Trust Footer</h2>
          <p style={styles.description}>
            A comprehensive footer component with newsletter signup, trust signals, social links,
            and organized navigation. Fully responsive and theme-aware.
          </p>

          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#e0e0e0' }}>
            Features
          </h3>
          <div style={styles.feature}>
            <span style={styles.icon}>📧</span>
            <span>Newsletter signup with email validation</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>💳</span>
            <span>Payment method trust signals</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>📱</span>
            <span>Social media links with hover animations</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>🔗</span>
            <span>Organized quick links (Support, Company, Legal)</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>🌓</span>
            <span>Theme support (dark/light)</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>📱</span>
            <span>Fully responsive design</span>
          </div>

          <h3 style={{ fontSize: '20px', marginTop: '40px', marginBottom: '16px', color: '#e0e0e0' }}>
            Usage Example
          </h3>
          <pre style={styles.code}>{`import Footer from './components/Footer';

// In your page component
<Footer theme="dark" />`}</pre>

          <h3 style={{ fontSize: '20px', marginTop: '40px', marginBottom: '16px', color: '#e0e0e0' }}>
            Live Demo (Scroll Down)
          </h3>
          <p style={{ color: '#888', marginBottom: '32px' }}>
            The footer is rendered at the bottom of this page. Try interacting with the newsletter
            signup, hovering over social icons, and testing the responsive layout.
          </p>
        </section>

        {/* Integration Status */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>✅ Integration Status</h2>
          <p style={styles.description}>
            Both components have been successfully integrated into the following pages:
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={styles.feature}>
              <span style={styles.icon}>✓</span>
              <span><strong>Dashboard.jsx</strong> - Main product dashboard with SmartButton + Footer</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.icon}>✓</span>
              <span><strong>CommercialHomePage.jsx</strong> - Commercial template with SmartButton + Footer</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.icon}>✓</span>
              <span><strong>DarkThemeProductCard.jsx</strong> - Product card with SmartButton</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.icon}>✓</span>
              <span><strong>ProductRecommendations.jsx</strong> - Recommendations with SmartButton</span>
            </div>
          </div>

          <h3 style={{ fontSize: '20px', marginTop: '40px', marginBottom: '16px', color: '#e0e0e0' }}>
            Impact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ ...styles.demo_item, textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📈</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Better UX</div>
              <div style={{ fontSize: '14px', color: '#888' }}>No disruptive popups</div>
            </div>
            <div style={{ ...styles.demo_item, textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚡</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Instant Feedback</div>
              <div style={{ fontSize: '14px', color: '#888' }}>Visual confirmation</div>
            </div>
            <div style={{ ...styles.demo_item, textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎨</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Modern Design</div>
              <div style={{ fontSize: '14px', color: '#888' }}>App-like experience</div>
            </div>
            <div style={{ ...styles.demo_item, textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Trust Signals</div>
              <div style={{ fontSize: '14px', color: '#888' }}>Payment icons</div>
            </div>
          </div>
        </section>
      </div>

      {/* Live Footer Demo */}
      <Footer theme="dark" />
    </div>
  );
}
