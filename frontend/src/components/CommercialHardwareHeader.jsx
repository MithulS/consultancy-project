/**
 * SRI AMMAN TRADERS HEADER COMPONENT
 * Professional header for hardware, electrical, plumbing, and paint materials store
 * Features: Top announcement bar, search bar with voice, navigation, account menu, cart
 */

import React, { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CommercialHardwareHeader({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const accountMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Load user data
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };
    loadUser();

    // Load cart count
    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    loadCart();

    // React to login / logout events from other components
    const handleLogin = () => loadUser();
    const handleLogoutEvent = () => {
      setUser(null);
      setCartCount(0);
    };
    // React to cart updates dispatched anywhere in the app
    const handleCartUpdate = () => loadCart();

    window.addEventListener('userLoggedIn', handleLogin);
    window.addEventListener('userLoggedOut', handleLogoutEvent);
    window.addEventListener('cartUpdated', handleCartUpdate);
    // Also sync when localStorage changes in other tabs
    window.addEventListener('storage', loadCart);

    // Scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Click outside to close account menu
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', loadCart);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    // Prevent double submissions
    if (isSearching) {
      return;
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
      window.location.hash = `#dashboard?search=${encodeURIComponent(searchQuery)}`;

      // Reset searching state after navigation
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  // Cleanup function for preventing memory leaks
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleVoiceSearch = () => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceError('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setVoiceError(''), 5000);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configuration
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // Store reference for cleanup
      recognitionRef.current = recognition;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
        console.log('🎤 Voice recognition started');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        console.log(`🎤 Recognized: "${transcript}" (confidence: ${(confidence * 100).toFixed(1)}%)`);

        setSearchQuery(transcript);
        setIsListening(false);

        // Auto-submit search after voice input
        setTimeout(() => {
          if (transcript.trim()) {
            window.location.hash = `#dashboard?search=${encodeURIComponent(transcript)}`;
          }
        }, 500);
      };

      recognition.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);

        let errorMessage = 'Voice search failed. ';

        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone found. Please check your device.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone access denied. Please enable microphone permissions.';
            break;
          case 'network':
            errorMessage += 'Network error. Please check your connection.';
            break;
          default:
            errorMessage += 'Please try again or use text search.';
        }

        setVoiceError(errorMessage);
        setTimeout(() => setVoiceError(''), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 Voice recognition ended');
      };

      // Request microphone permission and start
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognition.start();
        })
        .catch((err) => {
          console.error('🎤 Microphone permission error:', err);
          setVoiceError('Microphone access denied. Please enable microphone permissions in your browser settings.');
          setTimeout(() => setVoiceError(''), 5000);
        });

    } catch (err) {
      console.error('🎤 Voice search initialization error:', err);
      setVoiceError('Failed to initialize voice search. Please try again.');
      setTimeout(() => setVoiceError(''), 5000);
    }
  };

  // Cleanup function for voice recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const styles = {
    // Header
    header: {
      background: 'var(--primary-brand)', // Regal Blue
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 'var(--shadow-md)',
      borderBottom: 'none'
    },
    headerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '32px'
    },

    // Logo
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      flexShrink: 0
    },
    logoIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    },
    logoText: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    logoTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#111827',
      lineHeight: 1
    },
    logoSubtitle: {
      fontSize: '12px',
      color: '#6B7280',
      lineHeight: 1
    },

    // Search Bar
    searchContainer: {
      flex: 1,
      maxWidth: '600px'
    },
    searchForm: {
      display: 'flex',
      gap: '0',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      position: 'relative'
    },
    searchInput: {
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      fontSize: '15px',
      outline: 'none'
    },
    voiceButton: {
      padding: '0 16px',
      backgroundColor: 'transparent',
      border: 'none',
      borderLeft: '1px solid #E5E7EB',
      cursor: 'pointer',
      fontSize: '20px',
      transition: 'background-color 0.2s'
    },
    searchButton: {
      padding: '0 24px',
      background: 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)',
      border: 'none',
      color: '#FFFFFF',
      cursor: 'pointer',
      fontSize: '20px',
      fontWeight: 600,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },

    // Action Buttons
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexShrink: 0
    },
    actionButton: {
      position: 'relative',
      padding: '10px 16px',
      backgroundColor: 'transparent',
      border: '2px solid #E5E7EB',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '15px',
      fontWeight: 500,
      color: '#ffffff', // Explicit white for header text
      textDecoration: 'none',
      transition: 'all 0.2s',
      opacity: 0.9
    },
    trackButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
      position: 'relative',
      overflow: 'hidden'
    },
    badge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
      borderRadius: '10px',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: 600,
      minWidth: '18px',
      textAlign: 'center'
    },

    // Account Menu Dropdown
    accountMenuContainer: {
      position: 'relative'
    },
    accountMenu: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      minWidth: '200px',
      zIndex: 1000,
      overflow: 'hidden'
    },
    menuItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      borderBottom: '1px solid #F3F4F6',
      fontSize: '14px',
      color: '#374151',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    menuHeader: {
      padding: '12px 16px',
      borderBottom: '2px solid #E5E7EB',
      backgroundColor: '#F9FAFB'
    },
    userName: {
      fontWeight: 600,
      color: '#111827',
      fontSize: '15px'
    },
    userEmail: {
      fontSize: '12px',
      color: '#6B7280',
      marginTop: '2px'
    },

    // Navigation Bar
    navBar: {
      backgroundColor: '#F9FAFB',
      borderBottom: '1px solid #E5E7EB'
    },
    navContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      gap: '32px',
      alignItems: 'center'
    },
    navLink: {
      padding: '14px 0',
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCartCount(0);
    setShowAccountMenu(false);
    window.dispatchEvent(new Event('userLoggedOut'));
    window.location.hash = '#home';
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
        .search-button-hover {
          position: relative;
          overflow: hidden;
        }
        .search-button-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        .search-button-hover:hover::before {
          left: 100%;
        }
      `}</style>

      {/* Main Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Logo */}
          <div 
            style={styles.logo} 
            onClick={() => window.location.hash = '#dashboard'}
            onMouseEnter={(e) => {
              e.currentTarget.querySelector('[data-logo-icon]').style.transform = 'scale(1.1) rotate(5deg)';
              e.currentTarget.querySelector('[data-logo-icon]').style.boxShadow = '0 6px 20px rgba(11, 116, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('[data-logo-icon]').style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.querySelector('[data-logo-icon]').style.boxShadow = '0 4px 12px rgba(11, 116, 255, 0.3)';
            }}
          >
            <div style={styles.logoIcon} data-logo-icon>SA</div>
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>Sri Amman Traders</div>
              <div style={styles.logoSubtitle}>Genuine Branded Products</div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <form
              onSubmit={handleSearch}
              style={{
                ...styles.searchForm,
                borderColor: searchQuery ? '#4285F4' : '#E5E7EB'
              }}
            >
              <input
                type="text"
                placeholder="Enter Item # or Keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Only submit on Enter key, not on every keypress
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
                style={styles.searchInput}
                aria-label="Search products"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                disabled={isListening}
                style={{
                  ...styles.voiceButton,
                  backgroundColor: isListening ? '#FEF3C7' : 'transparent',
                  cursor: isListening ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => !isListening && (e.target.style.backgroundColor = '#F3F4F6')}
                onMouseLeave={(e) => !isListening && (e.target.style.backgroundColor = 'transparent')}
                aria-label={isListening ? 'Listening...' : 'Voice search'}
                title={isListening ? 'Listening... Speak now' : 'Click to use voice search'}
              >
                {isListening ? '🔴' : '🎤'}
              </button>
              <button
                type="submit"
                style={styles.searchButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3367D6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4285F4'}
              >
                🔍
              </button>
            </form>

            {/* Voice Error Toast */}
            {voiceError && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                backgroundColor: '#FEE2E2',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#991B1B',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                animation: 'slideDown 0.3s ease-out',
                zIndex: 1000
              }}>
                <strong>⚠️ Voice Search Error:</strong> {voiceError}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            {/* Track Order Button */}
            <button
              style={styles.trackButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
              onClick={() => window.location.hash = '#tracking'}
            >
              📦 TRACK MY ORDER
            </button>

            {/* Account Menu */}
            <div style={styles.accountMenuContainer} ref={accountMenuRef}>
              <button
                style={styles.actionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4285F4';
                  e.currentTarget.style.backgroundColor = '#F0F9FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <span style={{ fontSize: '20px' }}>👤</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>
                    {user ? 'Welcome' : 'Sign In'}
                  </span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {user ? user.name?.split(' ')[0] : 'Register'}
                  </span>
                </div>
                <span style={{ fontSize: '12px' }}>▼</span>
              </button>

              {showAccountMenu && (
                <div style={styles.accountMenu}>
                  {user ? (
                    <>
                      <div style={styles.menuHeader}>
                        <div style={styles.userName}>{user.name}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                      </div>
                      <div
                        style={styles.menuItem}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          window.location.hash = '#profile';
                          setShowAccountMenu(false);
                        }}
                      >
                        <span>👤</span> My Profile
                      </div>
                      <div
                        style={styles.menuItem}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          window.location.hash = '#orders';
                          setShowAccountMenu(false);
                        }}
                      >
                        <span>📦</span> My Orders
                      </div>
                      <div
                        style={{ ...styles.menuItem, borderBottom: 'none' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#FEE2E2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={handleLogout}
                      >
                        <span>🚪</span> Logout
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={styles.menuItem}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          window.location.hash = '#login';
                          setShowAccountMenu(false);
                        }}
                      >
                        <span>🔐</span> Sign In
                      </div>
                      <div
                        style={{ ...styles.menuItem, borderBottom: 'none' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          window.location.hash = '#register';
                          setShowAccountMenu(false);
                        }}
                      >
                        <span>📝</span> Register
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              style={{ ...styles.actionButton, position: 'relative' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4285F4';
                e.currentTarget.style.backgroundColor = '#F0F9FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => window.location.hash = '#cart'}
            >
              <span style={{ fontSize: '20px' }}>🛒</span>
              <span style={{ fontWeight: 600 }}>Cart</span>
              {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Category Navigation Bar */}
      <nav style={styles.navBar}>
        <div style={styles.navContainer}>
          <div
            style={styles.navLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#4285F4';
              e.target.style.borderBottomColor = '#4285F4';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
            onClick={() => window.location.hash = '#dashboard?category=Electrical'}
          >
            ⚡ Electrical
          </div>
          <div
            style={styles.navLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#4285F4';
              e.target.style.borderBottomColor = '#4285F4';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
            onClick={() => window.location.hash = '#dashboard?category=Plumbing'}
          >
            🚿 Plumbing
          </div>
          <div
            style={styles.navLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#4285F4';
              e.target.style.borderBottomColor = '#4285F4';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
            onClick={() => window.location.hash = '#dashboard?category=Hardware'}
          >
            🔩 Hardware
          </div>
          <div
            style={styles.navLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#4285F4';
              e.target.style.borderBottomColor = '#4285F4';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
            onClick={() => window.location.hash = '#dashboard?category=Paints%20%26%20Coatings'}
          >
            🎨 Paints
          </div>
          <div
            style={styles.navLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#4285F4';
              e.target.style.borderBottomColor = '#4285F4';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
            onClick={() => window.location.hash = '#dashboard?category=Pipes%20%26%20Fittings'}
          >
            🔄 Pipes & Fittings
          </div>
          <div
            style={styles.navLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#4285F4';
              e.target.style.borderBottomColor = '#4285F4';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
            onClick={() => window.location.hash = '#dashboard?category=Wiring%20%26%20Cables'}
          >
            🔌 Wiring & Cables
          </div>
          <div
            style={styles.navLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#EF4444';
              e.target.style.borderBottomColor = '#EF4444';
              e.target.style.fontWeight = 700;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#EF4444';
              e.target.style.borderBottomColor = 'transparent';
              e.target.style.fontWeight = 600;
            }}
            onClick={() => window.location.href = 'tel:+917904212501'}
          >
            📦 Wholesale Inquiry
          </div>
        </div>
      </nav>
    </>
  );
}
