/**
 * PROFESSIONAL TRUST FOOTER COMPONENT
 * Premium footer with:
 * - Newsletter signup
 * - Trust signals (payment methods)
 * - Social media links
 * - Quick links (Support, Company, Legal)
 * - Responsive design
 */

import React, { useState } from 'react';

export default function Footer({ theme = 'dark' }) {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // idle, loading, success, error

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
      return;
    }

    setSubscribeStatus('loading');

    try {
      // Simulate API call - replace with actual newsletter API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    } catch (error) {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }
  };

  // Theme configurations
  const themes = {
    dark: {
      background: 'var(--navy-darkest)',
      text: 'var(--text-primary)',
      textSecondary: 'var(--text-secondary)',
      border: 'var(--border-subtle)',
      inputBg: 'rgba(255, 255, 255, 0.05)',
      inputBorder: 'rgba(255, 255, 255, 0.1)',
      linkHover: 'var(--accent-blue-primary)',
    },
    light: {
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      text: '#2d3748',
      textSecondary: '#718096',
      border: 'rgba(0, 0, 0, 0.1)',
      inputBg: '#ffffff',
      inputBorder: 'rgba(0, 0, 0, 0.15)',
      linkHover: '#4285F4',
    },
  };

  const themeConfig = themes[theme] || themes.dark;

  const styles = {
    footer: {
      background: themeConfig.background,
      color: themeConfig.text,
      padding: '60px 0 30px',
      borderTop: `1px solid ${themeConfig.border}`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    topSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '40px',
      marginBottom: '40px',
      paddingBottom: '40px',
      borderBottom: `1px solid ${themeConfig.border}`,
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    columnTitle: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '8px',
      color: themeConfig.text,
      letterSpacing: '0.5px',
    },
    link: {
      color: themeConfig.textSecondary,
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'inline-block',
    },
    newsletterForm: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${themeConfig.inputBorder}`,
      background: themeConfig.inputBg,
      color: themeConfig.text,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    subscribeButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(135deg, #4285F4 0%, #764ba2 100%)',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
    },
    trustSignals: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      marginTop: '12px',
    },
    paymentIcon: {
      padding: '8px 12px',
      borderRadius: '6px',
      background: themeConfig.inputBg,
      border: `1px solid ${themeConfig.inputBorder}`,
      fontSize: '12px',
      fontWeight: '600',
      color: themeConfig.textSecondary,
    },
    socialLinks: {
      display: 'flex',
      gap: '12px',
      marginTop: '12px',
    },
    socialIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: themeConfig.inputBg,
      border: `1px solid ${themeConfig.inputBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '18px',
    },
    bottomSection: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
      paddingTop: '30px',
    },
    copyright: {
      color: themeConfig.textSecondary,
      fontSize: '14px',
      margin: 0,
    },
    bottomLinks: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
    },
    statusMessage: {
      fontSize: '13px',
      marginTop: '8px',
      fontWeight: '500',
    },
  };

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'AmEx', icon: '💳' },
    { name: 'PayPal', icon: '💰' },
    { name: 'Stripe', icon: '⚡' },
  ];

  const socialPlatforms = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' },
  ];

  const quickLinks = {
    Support: ['Help Center', 'Contact Us', 'FAQs', 'Shipping Info', 'Returns'],
    Company: ['About Us', 'Careers', 'Press', 'Blog', 'Partners'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'],
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Top Section - Main Content */}
        <div style={styles.topSection}>
          {/* Newsletter Column */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Stay Updated</h3>
            <p style={{ ...styles.link, cursor: 'default' }}>
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <form onSubmit={handleNewsletterSubmit} style={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                disabled={subscribeStatus === 'loading'}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4285F4';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = themeConfig.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                style={styles.subscribeButton}
                disabled={subscribeStatus === 'loading'}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {subscribeStatus === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
            {subscribeStatus === 'success' && (
              <p style={{ ...styles.statusMessage, color: '#2ed573' }}>
                ✓ Successfully subscribed!
              </p>
            )}
            {subscribeStatus === 'error' && (
              <p style={{ ...styles.statusMessage, color: '#ff6b6b' }}>
                ✗ Please enter a valid email address
              </p>
            )}
          </div>

          {/* Quick Links Columns */}
          {Object.entries(quickLinks).map(([title, links]) => (
            <div key={title} style={styles.column}>
              <h3 style={styles.columnTitle}>{title}</h3>
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  style={styles.link}
                  onMouseEnter={(e) => {
                    e.target.style.color = themeConfig.linkHover;
                    e.target.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = themeConfig.textSecondary;
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Middle Section - Trust Signals */}
        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ ...styles.columnTitle, marginBottom: '16px' }}>
            Secure Payment Methods
          </h4>
          <div style={styles.trustSignals}>
            {paymentMethods.map((method) => (
              <div key={method.name} style={styles.paymentIcon} title={method.name}>
                {method.icon} {method.name}
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Section */}
        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ ...styles.columnTitle, marginBottom: '16px' }}>Follow Us</h4>
          <div style={styles.socialLinks}>
            {socialPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                style={styles.socialIcon}
                title={platform.name}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #4285F4 0%, #764ba2 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.background = themeConfig.inputBg;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {platform.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section - Copyright & Legal */}
        <div style={styles.bottomSection}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} HomeHardware. All rights reserved.
            Built with ❤️ for exceptional shopping experiences.
          </p>
          <div style={styles.bottomLinks}>
            <a
              href="#"
              style={{ ...styles.link, fontSize: '13px' }}
              onMouseEnter={(e) => e.target.style.color = themeConfig.linkHover}
              onMouseLeave={(e) => e.target.style.color = themeConfig.textSecondary}
            >
              Privacy
            </a>
            <a
              href="#"
              style={{ ...styles.link, fontSize: '13px' }}
              onMouseEnter={(e) => e.target.style.color = themeConfig.linkHover}
              onMouseLeave={(e) => e.target.style.color = themeConfig.textSecondary}
            >
              Terms
            </a>
            <a
              href="#"
              style={{ ...styles.link, fontSize: '13px' }}
              onMouseEnter={(e) => e.target.style.color = themeConfig.linkHover}
              onMouseLeave={(e) => e.target.style.color = themeConfig.textSecondary}
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
